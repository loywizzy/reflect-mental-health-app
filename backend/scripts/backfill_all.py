"""
Backfill script — run trigger detection and baseline calculation for all users.
Usage: cd backend && source venv/bin/activate && python scripts/backfill_all.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models import User, JournalEntry, UserBaseline, TriggerStat
from app.services.baseline import calculate_user_baseline
from app.services.trigger_detector import detect_triggers

def main():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for user in users:
            print(f"\n=== Processing user: {user.email} ===")
            entries = db.query(JournalEntry).filter(JournalEntry.user_id == user.id).all()
            print(f"  Entries: {len(entries)}")

            triggers_found = 0
            for entry in entries:
                if entry.analysis:
                    detected = detect_triggers(
                        content=entry.content,
                        user_id=user.id,
                        entry_id=entry.id,
                        sentiment_score=entry.analysis.sentiment_score or 0,
                        db=db,
                    )
                    triggers_found += len(detected)

            print(f"  Triggers detected: {triggers_found}")

            baseline = calculate_user_baseline(user.id, db)
            if baseline:
                print(f"  Baseline updated: sentiment={baseline.baseline_sentiment:.3f}, samples={baseline.sample_count}")
            else:
                print(f"  Baseline: None")

        ts_count = db.query(TriggerStat).count()
        ub_count = db.query(UserBaseline).count()
        print(f"\n✅ Done! trigger_stats={ts_count}, user_baselines={ub_count}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
