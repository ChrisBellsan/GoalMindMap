"""Runtime configuration loaded from the environment / .env file."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def _split_csv(raw: str) -> list[str]:
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    serpapi_key: str = field(default_factory=lambda: _env("SERPAPI_API_KEY"))
    gemini_key: str = field(default_factory=lambda: _env("GEMINI_API_KEY"))
    gemini_model: str = field(
        default_factory=lambda: _env("GEMINI_MODEL", "gemini-2.0-flash-exp")
    )

    google_credentials_path: str = field(
        default_factory=lambda: _env("GOOGLE_CREDENTIALS_PATH", "./credentials.json")
    )
    google_sheet_id: str = field(default_factory=lambda: _env("GOOGLE_SHEET_ID"))
    google_sheet_name: str = field(
        default_factory=lambda: _env("GOOGLE_SHEET_NAME", "Live Performance Tracker")
    )
    google_worksheet_name: str = field(
        default_factory=lambda: _env("GOOGLE_WORKSHEET_NAME", "Performances")
    )

    sweep_times: list[str] = field(
        default_factory=lambda: _split_csv(_env("SWEEP_TIMES", "09:00,21:00"))
    )
    timezone: str = field(default_factory=lambda: _env("TZ", "America/New_York"))
    sqlite_path: str = field(
        default_factory=lambda: _env("SQLITE_PATH", str(PROJECT_ROOT / "tracker.db"))
    )

    host: str = field(default_factory=lambda: _env("HOST", "0.0.0.0"))
    port: int = field(default_factory=lambda: int(_env("PORT", "5000") or "5000"))


settings = Settings()
