from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import UserBaseline, JournalEntry, AnalysisSnapshot
import logging

logger = logging.getLogger(__name__)

def calculate_user_baseline(user_id, db: Session, window_days: int = 30):
    """
    Calculate and update user baseline metrics based on recent journal entries.
    
    Args:
        user_id: The UUID of the user
        db: Database session
        window_days: Number of days to look back (default 30)
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=window_days)
        
        # Query analysis snapshots for the user within the window
        snapshots = db.query(AnalysisSnapshot).join(JournalEntry).filter(
            JournalEntry.user_id == user_id,
            JournalEntry.created_at >= cutoff_date
        ).all()
        
        if not snapshots:
            logger.info(f"No entries found for user {user_id} in last {window_days} days. Baseline not updated.")
            return None
            
        count = len(snapshots)
        total_words = sum(s.word_count for s in snapshots if s.word_count) or 1
        
        # Calculate Averages / Ratios
        
        # Sentiment: Simple average
        avg_sentiment = sum(s.sentiment_score for s in snapshots if s.sentiment_score is not None) / count
        
        # Sentence Length: Simple average
        avg_sentence_length = sum(s.avg_sentence_length for s in snapshots if s.avg_sentence_length is not None) / count
        
        # Ratios (Weighted by word count or simple average? Using simple avg of counts/total_words for now)
        # Actually better to sum counts and divide by total words for accurate ratio
        
        total_modal = sum(s.modal_verb_count for s in snapshots if s.modal_verb_count is not None)
        total_negation = sum(s.negation_count for s in snapshots if s.negation_count is not None)
        
        # First person ratio is already a ratio. We can just avg it.
        avg_first_person = sum(s.first_person_ratio for s in snapshots if s.first_person_ratio is not None) / count
        
        baseline_modal_ratio = total_modal / total_words
        baseline_negation_ratio = total_negation / total_words
        
        # Get or create baseline record
        baseline = db.query(UserBaseline).filter(UserBaseline.user_id == user_id).first()
        
        if not baseline:
            baseline = UserBaseline(user_id=user_id)
            db.add(baseline)
            
        # Update fields
        baseline.baseline_sentiment = avg_sentiment
        baseline.baseline_sentence_length = avg_sentence_length
        baseline.baseline_modal_verb_ratio = baseline_modal_ratio
        baseline.baseline_negation_ratio = baseline_negation_ratio
        baseline.baseline_first_person_ratio = avg_first_person
        baseline.sample_count = count
        baseline.window_days = window_days
        baseline.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(baseline)
        
        logger.info(f"Updated baseline for user {user_id}: sentiment={avg_sentiment:.2f}, samples={count}")
        return baseline
        
    except Exception as e:
        logger.error(f"Error calculating baseline for user {user_id}: {e}")
        db.rollback()
        return None
