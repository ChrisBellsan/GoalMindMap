"""Google Sheets persistence via gspread + service account.

Falls back to a no-op when credentials are missing so local/dev works.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Iterable, Optional

import gspread
from google.oauth2.service_account import Credentials

from ..config import settings

log = logging.getLogger(__name__)

HEADERS = [
    "Date",
    "Artist",
    "Venue",
    "City/State",
    "Genre",
    "Source URL",
    "Verification Status",
    "Last Updated",
]

_SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

_worksheet: Optional[gspread.Worksheet] = None


def _open_worksheet() -> Optional[gspread.Worksheet]:
    global _worksheet
    if _worksheet is not None:
        return _worksheet

    creds_path = settings.google_credentials_path
    if not creds_path or not os.path.exists(creds_path):
        log.warning("Google credentials not found at %s; sheet sync disabled.", creds_path)
        return None

    try:
        creds = Credentials.from_service_account_file(creds_path, scopes=_SCOPES)
        client = gspread.authorize(creds)

        if settings.google_sheet_id:
            book = client.open_by_key(settings.google_sheet_id)
        else:
            book = client.open(settings.google_sheet_name)

        try:
            ws = book.worksheet(settings.google_worksheet_name)
        except gspread.WorksheetNotFound:
            ws = book.add_worksheet(
                title=settings.google_worksheet_name, rows=1000, cols=len(HEADERS)
            )

        _ensure_headers(ws)
        _worksheet = ws
        return ws
    except Exception as exc:  # pragma: no cover - network/auth path
        log.exception("Failed to open Google Sheet: %s", exc)
        return None


def _ensure_headers(ws: gspread.Worksheet) -> None:
    first_row = ws.row_values(1)
    if first_row != HEADERS:
        ws.update("A1", [HEADERS])


def append_records(records: Iterable[dict]) -> int:
    rows = list(records)
    if not rows:
        return 0
    ws = _open_worksheet()
    if ws is None:
        return 0

    payload = []
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    for r in rows:
        payload.append(
            [
                r.get("date", ""),
                r.get("artist", ""),
                r.get("venue", ""),
                r.get("city_state", ""),
                r.get("genre", ""),
                r.get("source_url", ""),
                r.get("verification_status", ""),
                now,
            ]
        )

    try:
        ws.append_rows(payload, value_input_option="RAW")
        return len(payload)
    except Exception as exc:  # pragma: no cover - network path
        log.exception("Failed to append rows to sheet: %s", exc)
        return 0
