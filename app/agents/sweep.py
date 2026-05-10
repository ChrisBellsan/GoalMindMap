"""Daily Sweep agent: SerpApi-powered Boolean search across performance trackers.

Always anchored to today + yesterday in the configured timezone so the sweep
remains perpetually current.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Iterable, Optional
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from serpapi import GoogleSearch

from ..config import settings
from ..db import mark_url_seen, url_seen

log = logging.getLogger(__name__)

TARGET_SITES = ("bachtrack.com", "jazznearyou.com", "setlist.fm", "bandsintown.com")


@dataclass(frozen=True)
class SweepHit:
    title: str
    snippet: str
    url: str
    source_domain: str
    today: str  # YYYY-MM-DD
    yesterday: str  # YYYY-MM-DD


def _date_strings() -> tuple[str, str]:
    tz = ZoneInfo(settings.timezone)
    now = datetime.now(tz)
    today = now.strftime("%Y-%m-%d")
    yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    return today, yesterday


def build_query(today: str, yesterday: str) -> str:
    sites = " OR ".join(f"site:{s}" for s in TARGET_SITES)
    return (
        f"({sites}) "
        f'("{today}" OR "{yesterday}") '
        f'("USA" OR "United States") '
        f'("live" OR "concert" OR "recital" OR "review" OR "setlist") '
        f"-inurl:tickets"
    )


def _domain(url: str) -> str:
    try:
        host = urlparse(url).hostname or ""
        return host.lower().lstrip("www.")
    except Exception:
        return ""


def _iter_serpapi_results(query: str, page_limit: int = 3) -> Iterable[dict]:
    """Iterate organic_results across up to `page_limit` pages."""
    if not settings.serpapi_key:
        log.warning("SERPAPI_API_KEY not set; sweep will return 0 results.")
        return

    start = 0
    for _ in range(page_limit):
        params = {
            "engine": "google",
            "q": query,
            "api_key": settings.serpapi_key,
            "num": 20,
            "start": start,
            "hl": "en",
            "gl": "us",
        }
        try:
            data = GoogleSearch(params).get_dict()
        except Exception as exc:  # pragma: no cover - network path
            log.exception("SerpApi request failed: %s", exc)
            return

        organic = data.get("organic_results") or []
        if not organic:
            return
        for item in organic:
            yield item
        start += len(organic)
        if len(organic) < 20:
            return


def run_sweep(page_limit: int = 3) -> list[SweepHit]:
    """Execute the sweep. Returns only hits whose URL is new (deduplicated)."""
    today, yesterday = _date_strings()
    query = build_query(today, yesterday)
    log.info("Daily sweep query: %s", query)

    fresh: list[SweepHit] = []
    for item in _iter_serpapi_results(query, page_limit=page_limit):
        url: Optional[str] = item.get("link")
        if not url:
            continue
        domain = _domain(url)
        if not any(domain.endswith(t) for t in TARGET_SITES):
            continue
        if url_seen(url):
            continue
        mark_url_seen(url)
        fresh.append(
            SweepHit(
                title=(item.get("title") or "").strip(),
                snippet=(item.get("snippet") or "").strip(),
                url=url,
                source_domain=domain,
                today=today,
                yesterday=yesterday,
            )
        )

    log.info("Sweep produced %d new candidates", len(fresh))
    return fresh
