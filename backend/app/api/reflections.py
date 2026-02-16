"""
API Router for Reflections
Generate and retrieve AI reflections for journal entries
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models import User, JournalEntry, Reflection, AnalysisSnapshot, EntryTrigger
from app.schemas import ReflectionRequest, ReflectionResponse
from app.llm import generate_reflection

router = APIRouter(prefix="/reflections", tags=["reflections"])


@router.post("/generate", response_model=ReflectionResponse, status_code=status.HTTP_201_CREATED)
async def create_reflection(
    request: ReflectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate AI reflection for a journal entry
    
    - Checks if entry belongs to current user
    - Checks if reflection already exists (unless force_regenerate=True)
    - Generates reflection using Gemini
    - Saves to database
    """
    
    # Get journal entry
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == request.entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found or does not belong to you"
        )
    
    # Check if reflection already exists
    existing_reflection = db.query(Reflection).filter(
        Reflection.entry_id == request.entry_id
    ).first()
    
    if existing_reflection and not request.force_regenerate:
        return existing_reflection
    
    # Get NLP analysis data
    analysis = db.query(AnalysisSnapshot).filter(
        AnalysisSnapshot.entry_id == request.entry_id
    ).first()
    
    # Get triggers
    entry_triggers = db.query(EntryTrigger).filter(
        EntryTrigger.entry_id == request.entry_id
    ).all()
    
    triggers_data = [
        {
            "name": et.trigger.name,
            "name_th": et.trigger.name_th,
            "category": et.trigger.category.value,
        }
        for et in entry_triggers
    ] if entry_triggers else []
    
    # Generate reflection
    try:
        result = await generate_reflection(
            content=entry.content,
            persona=current_user.persona.value,
            sentiment_score=analysis.sentiment_score if analysis else None,
            dominant_emotion=analysis.dominant_emotion.value if analysis and analysis.dominant_emotion else None,
            triggers=triggers_data
        )
        
        # Parse questions from reflection_text if needed
        # For now, store as None - can enhance later
        questions = None
        
        # Save or update reflection
        if existing_reflection:
            # Update existing
            existing_reflection.reflection_text = result["reflection_text"]
            existing_reflection.questions = questions
            existing_reflection.model_used = result["model_used"]
            existing_reflection.prompt_tokens = result["prompt_tokens"]
            existing_reflection.completion_tokens = result["completion_tokens"]
            existing_reflection.is_fallback = result["is_fallback"]
            reflection = existing_reflection
        else:
            # Create new
            reflection = Reflection(
                entry_id=request.entry_id,
                user_id=current_user.id,
                reflection_text=result["reflection_text"],
                questions=questions,
                persona=current_user.persona,
                model_used=result["model_used"],
                prompt_tokens=result["prompt_tokens"],
                completion_tokens=result["completion_tokens"],
                is_fallback=result["is_fallback"]
            )
            db.add(reflection)
        
        db.commit()
        db.refresh(reflection)
        
        return reflection
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate reflection: {str(e)}"
        )


@router.get("/{entry_id}", response_model=ReflectionResponse)
def get_reflection(
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get reflection for a specific journal entry"""
    
    # Verify entry belongs to user
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    # Get reflection
    reflection = db.query(Reflection).filter(
        Reflection.entry_id == entry_id
    ).first()
    
    if not reflection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reflection not found for this entry"
        )
    
    return reflection
