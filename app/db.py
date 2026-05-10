"""SQLite persistence: seen-URL dedup + verified performance records."""
from __future__ import annotations

import hashlib
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator, Optional

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    UniqueConstraint,
    create_engine,
    select,
)
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings


class Base(DeclarativeBase):
    pass


class SeenUrl(Base):
    __tablename__ = "seen_urls"

    id = Column(Integer, primary_key=True)
    url_hash = Column(String(64), unique=True, nullable=False, index=True)
    url = Column(String(2048), nullable=False)
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Performance(Base):
    __tablename__ = "performances"
    __table_args__ = (
        UniqueConstraint("artist", "venue", "date", name="uq_artist_venue_date"),
    )

    id = Column(Integer, primary_key=True)
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    artist = Column(String(512), nullable=False)
    venue = Column(String(512), nullable=False)
    city_state = Column(String(256), default="")
    genre = Column(String(32), nullable=False, index=True)  # jazz | classical | unknown
    source_url = Column(String(2048), nullable=False)
    source_domain = Column(String(128), default="")
    verification_status = Column(String(32), nullable=False)  # Verified | Unverified | Discarded
    confidence = Column(Float, nullable=False, default=0.0)
    snippet = Column(String(2048), default="")
    last_updated = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


_engine = create_engine(
    f"sqlite:///{settings.sqlite_path}",
    echo=False,
    future=True,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)


def init_db() -> None:
    Base.metadata.create_all(_engine)


@contextmanager
def session_scope() -> Iterator[Session]:
    s = SessionLocal()
    try:
        yield s
        s.commit()
    except Exception:
        s.rollback()
        raise
    finally:
        s.close()


def _hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def url_seen(url: str) -> bool:
    h = _hash(url)
    with session_scope() as s:
        return s.scalar(select(SeenUrl.id).where(SeenUrl.url_hash == h)) is not None


def mark_url_seen(url: str) -> None:
    h = _hash(url)
    with session_scope() as s:
        if s.scalar(select(SeenUrl.id).where(SeenUrl.url_hash == h)) is None:
            s.add(SeenUrl(url_hash=h, url=url[:2048]))


def performance_exists(artist: str, venue: str, date: str) -> bool:
    with session_scope() as s:
        stmt = select(Performance.id).where(
            Performance.artist == artist,
            Performance.venue == venue,
            Performance.date == date,
        )
        return s.scalar(stmt) is not None


def upsert_performance(record: dict) -> Optional[Performance]:
    """Insert a verified performance; returns the row, or None if duplicate."""
    with session_scope() as s:
        existing = s.scalar(
            select(Performance).where(
                Performance.artist == record["artist"],
                Performance.venue == record["venue"],
                Performance.date == record["date"],
            )
        )
        if existing is not None:
            # refresh confidence / status if newer evidence is stronger
            if record.get("confidence", 0) > existing.confidence:
                existing.confidence = record["confidence"]
                existing.verification_status = record["verification_status"]
                existing.source_url = record["source_url"]
                existing.source_domain = record.get("source_domain", existing.source_domain)
                existing.snippet = record.get("snippet", existing.snippet)
            return None

        row = Performance(**record)
        s.add(row)
        s.flush()
        s.refresh(row)
        return row


def fetch_recent(dates: list[str], genre: Optional[str] = None) -> list[dict]:
    with session_scope() as s:
        stmt = select(Performance).where(Performance.date.in_(dates))
        if genre and genre.lower() != "both":
            stmt = stmt.where(Performance.genre == genre.lower())
        stmt = stmt.order_by(Performance.date.desc(), Performance.confidence.desc())
        rows = s.scalars(stmt).all()
        return [
            {
                "id": r.id,
                "date": r.date,
                "artist": r.artist,
                "venue": r.venue,
                "city_state": r.city_state,
                "genre": r.genre,
                "source_url": r.source_url,
                "source_domain": r.source_domain,
                "verification_status": r.verification_status,
                "confidence": round(r.confidence, 2),
                "snippet": r.snippet,
                "last_updated": r.last_updated.isoformat() if r.last_updated else None,
            }
            for r in rows
        ]
