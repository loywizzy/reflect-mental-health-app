from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core import get_db
from app.models import User, JournalEntry, AnalysisSnapshot
from app.schemas import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
    JournalEntryWithAnalysis,
)
from app.api.auth import get_current_user
from app.nlp import analyze_text

router = APIRouter(prefix="/journal", tags=["journal"])


def run_analysis(entry: JournalEntry, db: Session) -> AnalysisSnapshot:
    """Run NLP analysis on a journal entry and save the result."""
    result = analyze_text(entry.content)

    snapshot = AnalysisSnapshot(
        entry_id=entry.id,
        sentiment_score=result["sentiment_score"],
        emotion_vector=result["emotion_vector"],
        dominant_emotion=result["dominant_emotion"],
        avg_sentence_length=result["features"]["avg_sentence_length"],
        sentence_length_variance=result["features"]["sentence_length_variance"],
        modal_verb_count=result["features"]["modal_verb_count"],
        negation_count=result["features"]["negation_count"],
        first_person_ratio=result["features"]["first_person_ratio"],
        vocabulary_repetition=result["features"]["vocabulary_repetition"],
        word_count=result["word_count"],
        sentence_count=result["sentence_count"],
        raw_features=result["features"],
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


@router.get("", response_model=list[JournalEntryWithAnalysis])
def get_journal_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's journal entries with optional date filter."""
    query = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id)
    
    if start_date:
        query = query.filter(JournalEntry.entry_date >= start_date)
    if end_date:
        query = query.filter(JournalEntry.entry_date <= end_date)
    
    entries = query.order_by(JournalEntry.entry_date.desc()).offset(skip).limit(limit).all()
    
    result = []
    for entry in entries:
        entry_data = JournalEntryWithAnalysis(
            id=entry.id,
            user_id=entry.user_id,
            content=entry.content,
            entry_date=entry.entry_date,
            created_at=entry.created_at,
            updated_at=entry.updated_at,
            sentiment_score=entry.analysis.sentiment_score if entry.analysis else None,
            dominant_emotion=entry.analysis.dominant_emotion if entry.analysis else None,
        )
        result.append(entry_data)
    
    return result


@router.get("/{entry_id}", response_model=JournalEntryWithAnalysis)
def get_journal_entry(
    entry_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific journal entry."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    return JournalEntryWithAnalysis(
        id=entry.id,
        user_id=entry.user_id,
        content=entry.content,
        entry_date=entry.entry_date,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
        sentiment_score=entry.analysis.sentiment_score if entry.analysis else None,
        dominant_emotion=entry.analysis.dominant_emotion if entry.analysis else None,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_journal_entry(
    entry_data: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new journal entry with auto NLP analysis."""
    # 1. Crisis check first
    from app.nlp import check_crisis
    crisis_result = check_crisis(entry_data.content)

    # 2. Create entry
    entry = JournalEntry(
        user_id=current_user.id,
        content=entry_data.content,
        entry_date=entry_data.entry_date or date.today(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # 3. Run NLP analysis
    snapshot = run_analysis(entry, db)

    return {
        "entry": JournalEntryWithAnalysis(
            id=entry.id,
            user_id=entry.user_id,
            content=entry.content,
            entry_date=entry.entry_date,
            created_at=entry.created_at,
            updated_at=entry.updated_at,
            sentiment_score=snapshot.sentiment_score,
            dominant_emotion=snapshot.dominant_emotion,
        ),
        "crisis": crisis_result,
        "analysis": {
            "sentiment_score": snapshot.sentiment_score,
            "dominant_emotion": snapshot.dominant_emotion,
            "emotion_vector": snapshot.emotion_vector,
            "features": snapshot.raw_features,
        },
    }


@router.put("/{entry_id}", response_model=JournalEntryResponse)
def update_journal_entry(
    entry_id: UUID,
    entry_data: JournalEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a journal entry and re-run analysis."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    if entry_data.content is not None:
        entry.content = entry_data.content
        
        # Delete old analysis
        if entry.analysis:
            db.delete(entry.analysis)
            db.commit()
        
        # Re-run analysis
        run_analysis(entry, db)
    
    db.commit()
    db.refresh(entry)
    
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal_entry(
    entry_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a journal entry."""
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    db.delete(entry)
    db.commit()
    
    return None


@router.post("/analyze")
def analyze_text_endpoint(
    entry_data: JournalEntryCreate,
):
    """
    Analyze text without saving (preview mode).
    No auth required — useful for testing the NLP pipeline.
    """
    result = analyze_text(entry_data.content)
    return result
