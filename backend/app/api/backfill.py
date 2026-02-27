"""
Backfill endpoint — reprocess existing entries for trigger detection and baseline.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core import get_db
from app.models import User, JournalEntry
from app.api.auth import get_current_user
from app.services.baseline import calculate_user_baseline
from app.services.trigger_detector import detect_triggers
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/backfill", tags=["backfill"])


@router.post("/process-entries")
def backfill_process_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Reprocess all existing journal entries for the current user.
    Runs trigger detection on every entry and recalculates baseline.
    """
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id
    ).all()

    processed = 0
    triggers_found = 0

    for entry in entries:
        if entry.analysis:
            detected = detect_triggers(
                content=entry.content,
                user_id=current_user.id,
                entry_id=entry.id,
                sentiment_score=entry.analysis.sentiment_score or 0,
                db=db,
            )
            triggers_found += len(detected)
            processed += 1

    # Recalculate baseline
    baseline = calculate_user_baseline(current_user.id, db)

    return {
        "message": "Backfill completed",
        "entries_processed": processed,
        "total_entries": len(entries),
        "triggers_found": triggers_found,
        "baseline_updated": baseline is not None,
        "baseline_sentiment": baseline.baseline_sentiment if baseline else None,
        "baseline_sample_count": baseline.sample_count if baseline else None,
    }
