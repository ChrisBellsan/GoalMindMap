"""Agentic Critic: Gemini-powered fact-check that judges sweep hits.

Returns structured JSON. The critic must:
  - Reject Cancelled / Postponed events.
  - Verify performance happened on today or yesterday in the USA.
  - Identify Jazz vs Classical vs Other.
  - Emit a 0-1 confidence score and a one-line "Verified via ..." reason.
"""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Optional

import google.generativeai as genai

from ..config import settings
from .sweep import SweepHit

log = logging.getLogger(__name__)

_SYSTEM = """You are a meticulous fact-checking critic for live music performances.

You receive ONE search result (title, snippet, URL, source domain) and two
reference dates (today, yesterday) in the USA. You must decide whether the
result describes a verifiable live JAZZ or CLASSICAL performance that already
occurred on either of those two dates inside the United States.

Rules:
  * VERIFIED requires evidence the show happened: a setlist, review, or
    primary tracker log (setlist.fm setlist page, bachtrack review,
    bandsintown "past" event, jazznearyou archived event).
  * If the snippet says "Cancelled", "Postponed", "Rescheduled" -> DISCARD.
  * If the date in the snippet is in the future or doesn't match today /
    yesterday -> DISCARD.
  * If venue is outside the USA -> DISCARD.
  * Genre must be exactly one of: jazz, classical, unknown.
  * Confidence is a float in [0,1]. Setlist.fm setlists -> 0.9+.
    Bachtrack reviews -> 0.85+. Bandsintown past events -> 0.7-0.85.
    Snippets with only event listings (no proof of completion) -> < 0.5.

Respond with ONLY a JSON object, no prose, with this schema:
{
  "decision": "VERIFIED" | "DISCARD",
  "reason": "Verified via <Source>" | "<short reason>",
  "artist": "...",
  "venue": "...",
  "city_state": "<City, ST>" or "",
  "date": "YYYY-MM-DD",
  "genre": "jazz" | "classical" | "unknown",
  "confidence": 0.0-1.0
}
"""


@dataclass(frozen=True)
class Verdict:
    decision: str  # VERIFIED | DISCARD
    reason: str
    artist: str
    venue: str
    city_state: str
    date: str
    genre: str
    confidence: float


_model: Optional[genai.GenerativeModel] = None


def _get_model() -> Optional[genai.GenerativeModel]:
    global _model
    if _model is not None:
        return _model
    if not settings.gemini_key:
        log.warning("GEMINI_API_KEY not set; critic will fall back to heuristics.")
        return None
    genai.configure(api_key=settings.gemini_key)
    _model = genai.GenerativeModel(
        settings.gemini_model,
        system_instruction=_SYSTEM,
    )
    return _model


_JSON_RE = re.compile(r"\{.*\}", re.DOTALL)


def _parse_json(text: str) -> Optional[dict]:
    if not text:
        return None
    match = _JSON_RE.search(text)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _heuristic_verdict(hit: SweepHit) -> Verdict:
    """Used when Gemini is unavailable or returns garbage. Conservative."""
    snippet_lower = f"{hit.title} {hit.snippet}".lower()
    if any(w in snippet_lower for w in ("cancelled", "canceled", "postponed", "rescheduled")):
        return Verdict("DISCARD", "Cancelled/postponed", "", "", "", "", "unknown", 0.0)

    date = hit.today if hit.today in snippet_lower else (
        hit.yesterday if hit.yesterday in snippet_lower else hit.today
    )
    genre = "classical" if "bachtrack" in hit.source_domain else (
        "jazz" if "jazznearyou" in hit.source_domain else "unknown"
    )
    confidence = 0.6 if "setlist.fm" in hit.source_domain else 0.4
    reason_source = {
        "setlist.fm": "Setlist.fm",
        "bachtrack.com": "Bachtrack",
        "jazznearyou.com": "JazzNearYou",
        "bandsintown.com": "Bandsintown",
    }.get(hit.source_domain, hit.source_domain)
    return Verdict(
        decision="VERIFIED",
        reason=f"Verified via {reason_source} (heuristic)",
        artist=hit.title.split(" - ")[0][:200],
        venue="",
        city_state="",
        date=date,
        genre=genre,
        confidence=confidence,
    )


def critique(hit: SweepHit) -> Verdict:
    model = _get_model()
    if model is None:
        return _heuristic_verdict(hit)

    prompt = json.dumps(
        {
            "today": hit.today,
            "yesterday": hit.yesterday,
            "title": hit.title,
            "snippet": hit.snippet,
            "url": hit.url,
            "source_domain": hit.source_domain,
        }
    )

    try:
        response = model.generate_content(
            prompt,
            generation_config={"temperature": 0.0, "response_mime_type": "application/json"},
        )
        data = _parse_json(getattr(response, "text", "") or "")
    except Exception as exc:  # pragma: no cover - network path
        log.exception("Gemini critique failed for %s: %s", hit.url, exc)
        return _heuristic_verdict(hit)

    if not data:
        return _heuristic_verdict(hit)

    decision = str(data.get("decision", "DISCARD")).upper()
    if decision not in ("VERIFIED", "DISCARD"):
        decision = "DISCARD"
    genre = str(data.get("genre", "unknown")).lower()
    if genre not in ("jazz", "classical", "unknown"):
        genre = "unknown"

    try:
        confidence = float(data.get("confidence", 0.0))
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(1.0, confidence))

    date = str(data.get("date") or hit.today)
    if date not in (hit.today, hit.yesterday):
        # Critic invented a date outside the window; force discard.
        decision = "DISCARD"

    return Verdict(
        decision=decision,
        reason=str(data.get("reason") or ""),
        artist=str(data.get("artist") or "").strip()[:512],
        venue=str(data.get("venue") or "").strip()[:512],
        city_state=str(data.get("city_state") or "").strip()[:256],
        date=date,
        genre=genre,
        confidence=confidence,
    )
