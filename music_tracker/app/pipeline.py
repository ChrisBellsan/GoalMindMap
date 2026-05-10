"""End-to-end pipeline: sweep -> critique -> SQLite -> Google Sheets."""
from __future__ import annotations

import logging
from typing import Optional

from .agents.critic import Verdict, critique
from .agents.sweep import SweepHit, run_sweep
from .db import performance_exists, upsert_performance
from .services import sheets

log = logging.getLogger(__name__)


def _to_record(hit: SweepHit, verdict: Verdict) -> Optional[dict]:
    if verdict.decision != "VERIFIED":
        return None
    artist = (verdict.artist or hit.title).strip()
    venue = (verdict.venue or "").strip()
    if not artist or not venue or not verdict.date:
        return None
    return {
        "date": verdict.date,
        "artist": artist,
        "venue": venue,
        "city_state": verdict.city_state,
        "genre": verdict.genre,
        "source_url": hit.url,
        "source_domain": hit.source_domain,
        "verification_status": verdict.reason or "Verified",
        "confidence": verdict.confidence,
        "snippet": hit.snippet[:2048],
    }


def run_pipeline(page_limit: int = 3) -> dict:
    hits = run_sweep(page_limit=page_limit)
    inserted: list[dict] = []
    discarded = 0
    duplicates = 0

    for hit in hits:
        verdict = critique(hit)
        record = _to_record(hit, verdict)
        if record is None:
            discarded += 1
            continue
        if performance_exists(record["artist"], record["venue"], record["date"]):
            duplicates += 1
            continue
        row = upsert_performance(record)
        if row is not None:
            inserted.append(record)

    appended = sheets.append_records(inserted)
    summary = {
        "candidates": len(hits),
        "inserted": len(inserted),
        "duplicates": duplicates,
        "discarded": discarded,
        "sheet_appended": appended,
    }
    log.info("Pipeline summary: %s", summary)
    return summary
