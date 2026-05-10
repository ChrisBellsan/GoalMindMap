"""APScheduler wiring: runs the daily sweep at the configured local times."""
from __future__ import annotations

import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from .config import settings
from .pipeline import run_pipeline

log = logging.getLogger(__name__)

_scheduler: BackgroundScheduler | None = None


def start_scheduler() -> BackgroundScheduler:
    global _scheduler
    if _scheduler is not None:
        return _scheduler

    sched = BackgroundScheduler(timezone=settings.timezone)
    for raw in settings.sweep_times:
        try:
            hour, minute = (int(part) for part in raw.split(":", 1))
        except ValueError:
            log.warning("Skipping invalid SWEEP_TIMES entry: %r", raw)
            continue
        sched.add_job(
            _safe_run,
            CronTrigger(hour=hour, minute=minute, timezone=settings.timezone),
            id=f"sweep-{hour:02d}{minute:02d}",
            replace_existing=True,
            misfire_grace_time=300,
        )
        log.info("Scheduled daily sweep at %02d:%02d %s", hour, minute, settings.timezone)

    sched.start()
    _scheduler = sched
    return sched


def shutdown_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None


def _safe_run() -> None:
    try:
        run_pipeline()
    except Exception:  # pragma: no cover - background job
        log.exception("Scheduled sweep failed")
