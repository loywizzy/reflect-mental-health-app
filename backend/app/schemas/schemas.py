from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models import PersonaType, EmotionType, TriggerCategory, LanguageType, ThemeType


# ============================================================
# USER SCHEMAS
# ============================================================

class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    persona: PersonaType = PersonaType.worker


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    persona: Optional[PersonaType] = None


class UserResponse(UserBase):
    id: UUID
    persona: PersonaType
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserWithSettings(UserResponse):
    journal_count: int = 0
    days_active: int = 0


# ============================================================
# USER SETTINGS SCHEMAS
# ============================================================

class UserSettingsBase(BaseModel):
    email_notifications: bool = True
    language: LanguageType = LanguageType.th
    theme: ThemeType = ThemeType.light


class UserSettingsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    language: Optional[LanguageType] = None
    theme: Optional[ThemeType] = None


class UserSettingsResponse(UserSettingsBase):
    id: UUID
    user_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# AUTH SCHEMAS
# ============================================================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


# ============================================================
# JOURNAL SCHEMAS
# ============================================================

class JournalEntryBase(BaseModel):
    content: str = Field(..., min_length=1)
    entry_date: Optional[date] = None


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntryUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1)


class JournalEntryResponse(BaseModel):
    id: UUID
    user_id: UUID
    content: str
    entry_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JournalEntryWithAnalysis(JournalEntryResponse):
    sentiment_score: Optional[float] = None
    dominant_emotion: Optional[EmotionType] = None


# ============================================================
# ANALYSIS SCHEMAS
# ============================================================

class EmotionVector(BaseModel):
    calm: float = 0.0
    tense: float = 0.0
    sad: float = 0.0
    happy: float = 0.0
    neutral: float = 0.0


class AnalysisSnapshotResponse(BaseModel):
    id: UUID
    entry_id: UUID
    sentiment_score: Optional[float] = None
    emotion_vector: Optional[dict] = None
    dominant_emotion: Optional[EmotionType] = None
    avg_sentence_length: Optional[float] = None
    sentence_length_variance: Optional[float] = None
    modal_verb_count: int = 0
    negation_count: int = 0
    first_person_ratio: Optional[float] = None
    vocabulary_repetition: Optional[float] = None
    word_count: Optional[int] = None
    sentence_count: Optional[int] = None
    analyzed_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# TRIGGER SCHEMAS
# ============================================================

class TriggerResponse(BaseModel):
    id: UUID
    name: str
    name_th: Optional[str] = None
    category: TriggerCategory

    class Config:
        from_attributes = True


class EntryTriggerResponse(BaseModel):
    trigger: TriggerResponse
    relevance_score: float
    sentiment_context: Optional[float] = None

    class Config:
        from_attributes = True


class TriggerStatResponse(BaseModel):
    trigger: TriggerResponse
    occurrence_count: int
    avg_sentiment: Optional[float] = None
    sentiment_volatility: Optional[float] = None
    last_seen: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# INSIGHT / DASHBOARD SCHEMAS
# ============================================================

class TrendDataPoint(BaseModel):
    date: str
    sentiment: float
    label: str


class LanguageDrift(BaseModel):
    metric: str
    value: float
    delta: float
    delta_percent: float
    direction: str  # up, down, stable


class DashboardResponse(BaseModel):
    trend_data: list[TrendDataPoint]
    language_drift: list[LanguageDrift]
    trigger_stats: list[TriggerStatResponse]
    insights: list[str]


class DailySummaryResponse(BaseModel):
    id: UUID
    summary_date: date
    entry_count: int
    avg_sentiment: Optional[float] = None
    emotion_distribution: Optional[dict] = None
    language_drift_delta: Optional[dict] = None
    top_triggers: Optional[list] = None
    generated_insight: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# BASELINE SCHEMA
# ============================================================

class UserBaselineResponse(BaseModel):
    baseline_sentiment: Optional[float] = None
    baseline_sentence_length: Optional[float] = None
    baseline_modal_verb_ratio: Optional[float] = None
    baseline_negation_ratio: Optional[float] = None
    baseline_first_person_ratio: Optional[float] = None
    sample_count: int
    window_days: int
    updated_at: datetime

    class Config:
        from_attributes = True
