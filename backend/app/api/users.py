from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core import get_db, get_password_hash
from app.models import User, UserSettings, JournalEntry
from app.schemas import (
    UserResponse,
    UserUpdate,
    UserWithSettings,
    UserSettingsUpdate,
    UserSettingsResponse,
)
from app.api.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserWithSettings)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's full profile with stats."""
    # Count journal entries
    journal_count = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id
    ).count()
    
    # Calculate days active
    # Ensure created_at is naive if needed, or make utcnow aware. 
    # Simpler: use naive utcnow and naive created_at (User defaults are utcnow)
    created_at_naive = current_user.created_at.replace(tzinfo=None) if current_user.created_at.tzinfo else current_user.created_at
    days_active = (datetime.utcnow() - created_at_naive).days + 1
    
    return UserWithSettings(
        id=current_user.id,
        email=current_user.email,
        persona=current_user.persona,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        journal_count=journal_count,
        days_active=days_active,
    )


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile."""
    if user_data.persona is not None:
        current_user.persona = user_data.persona
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/me/settings", response_model=UserSettingsResponse)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's settings."""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        # Create default settings if not exists
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("/me/settings", response_model=UserSettingsResponse)
def update_user_settings(
    settings_data: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's settings."""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    if settings_data.email_notifications is not None:
        settings.email_notifications = settings_data.email_notifications
    if settings_data.language is not None:
        settings.language = settings_data.language
    if settings_data.theme is not None:
        settings.theme = settings_data.theme
    
    db.commit()
    db.refresh(settings)
    
    return settings


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete current user and all associated data."""
    db.delete(current_user)
    db.commit()
    
    return None


@router.post("/me/export")
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Export all user data (GDPR compliance)."""
    # Get all journal entries with analysis
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id
    ).all()
    
    export_data = {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "persona": current_user.persona.value,
            "created_at": current_user.created_at.isoformat(),
        },
        "settings": None,
        "journal_entries": [],
    }
    
    if current_user.settings:
        export_data["settings"] = {
            "email_notifications": current_user.settings.email_notifications,
            "language": current_user.settings.language.value,
            "theme": current_user.settings.theme.value,
        }
    
    for entry in entries:
        entry_data = {
            "id": str(entry.id),
            "content": entry.content,
            "entry_date": entry.entry_date.isoformat(),
            "created_at": entry.created_at.isoformat(),
            "analysis": None,
        }
        
        if entry.analysis:
            entry_data["analysis"] = {
                "sentiment_score": entry.analysis.sentiment_score,
                "dominant_emotion": entry.analysis.dominant_emotion.value if entry.analysis.dominant_emotion else None,
                "word_count": entry.analysis.word_count,
            }
        
        export_data["journal_entries"].append(entry_data)
    
    return export_data
