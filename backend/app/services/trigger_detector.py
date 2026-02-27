"""
Trigger Detection Service
Scans journal text for known trigger keywords (EN/TH) and updates stats.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models import EntryTrigger, TriggerStat
import logging

logger = logging.getLogger(__name__)


def detect_triggers(
    content: str,
    user_id,
    entry_id,
    sentiment_score: float,
    db: Session,
):
    """
    Scan journal content for trigger keywords and create EntryTrigger + TriggerStat records.

    Uses raw SQL to load triggers to avoid SQLAlchemy Enum deserialization issues
    with the 'self-care' category value.
    """
    try:
        content_lower = content.lower()

        # Load triggers via raw SQL to avoid Enum mapping issues
        rows = db.execute(text("SELECT id, name, name_th, category FROM triggers")).fetchall()

        matched = []
        for row in rows:
            trigger_id = row[0]
            name = row[1]
            name_th = row[2]

            found = False
            if name and name.lower() in content_lower:
                found = True
            if name_th and name_th in content_lower:
                found = True

            if found:
                matched.append({"id": trigger_id, "name": name})

        if not matched:
            return []

        for trigger in matched:
            tid = trigger["id"]

            # Check for existing EntryTrigger (avoid duplicates on re-process)
            existing = db.query(EntryTrigger).filter(
                EntryTrigger.entry_id == entry_id,
                EntryTrigger.trigger_id == tid,
            ).first()

            if not existing:
                entry_trigger = EntryTrigger(
                    entry_id=entry_id,
                    trigger_id=tid,
                    relevance_score=1.0,
                    sentiment_context=sentiment_score,
                )
                db.add(entry_trigger)

            # Update or create TriggerStat
            stat = db.query(TriggerStat).filter(
                TriggerStat.user_id == user_id,
                TriggerStat.trigger_id == tid,
            ).first()

            now = datetime.utcnow()

            if stat:
                old_count = stat.occurrence_count or 0
                old_avg = stat.avg_sentiment or 0
                new_count = old_count + 1
                new_avg = ((old_avg * old_count) + (sentiment_score or 0)) / new_count
                stat.occurrence_count = new_count
                stat.avg_sentiment = round(new_avg, 4)
                stat.last_seen = now
                stat.updated_at = now
            else:
                stat = TriggerStat(
                    user_id=user_id,
                    trigger_id=tid,
                    occurrence_count=1,
                    avg_sentiment=sentiment_score or 0,
                    sentiment_volatility=0,
                    first_seen=now,
                    last_seen=now,
                )
                db.add(stat)

        db.commit()
        names = [t["name"] for t in matched]
        logger.info(f"Detected {len(matched)} triggers for entry {entry_id}: {names}")
        return matched

    except Exception as e:
        logger.error(f"Error detecting triggers for entry {entry_id}: {e}")
        db.rollback()
        return []
