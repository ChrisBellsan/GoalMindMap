"""FastAPI entrypoint: serves the single-scroll UI and the JSON API."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import FastAPI, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .config import settings
from .db import fetch_recent, init_db
from .pipeline import run_pipeline
from .scheduler import shutdown_scheduler, start_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
)
log = logging.getLogger("music_tracker")

BASE_DIR = Path(__file__).resolve().parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    start_scheduler()
    log.info("Music tracker started.")
    try:
        yield
    finally:
        shutdown_scheduler()


app = FastAPI(title="Verifiable Live Jazz & Classical Tracker", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")


def _date_window() -> tuple[str, str]:
    tz = ZoneInfo(settings.timezone)
    now = datetime.now(tz)
    return now.strftime("%Y-%m-%d"), (now - timedelta(days=1)).strftime("%Y-%m-%d")


@app.get("/", response_class=HTMLResponse)
def index(request: Request, genre: str = "both"):
    today, yesterday = _date_window()
    records = fetch_recent([today, yesterday], genre=genre)
    grouped = {today: [], yesterday: []}
    for r in records:
        grouped.setdefault(r["date"], []).append(r)
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "today": today,
            "yesterday": yesterday,
            "genre": genre.lower(),
            "groups": [(today, grouped[today]), (yesterday, grouped[yesterday])],
            "total": len(records),
        },
    )


@app.get("/api/performances")
def api_performances(genre: Optional[str] = Query(default="both")):
    today, yesterday = _date_window()
    records = fetch_recent([today, yesterday], genre=genre)
    return {
        "today": today,
        "yesterday": yesterday,
        "genre": (genre or "both").lower(),
        "count": len(records),
        "records": records,
    }


@app.post("/api/sweep")
def api_sweep():
    """Manual trigger - useful for testing without waiting for the cron."""
    summary = run_pipeline()
    return JSONResponse(summary)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}
