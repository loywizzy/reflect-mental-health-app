import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey, Text, Float, Integer, Date, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


# ============================================================
# ENUMS
# ============================================================

class PersonaType(str, enum.Enum):
    student = "student"
    worker = "worker"
    teen = "teen"


class EmotionType(str, enum.Enum):
    calm = "calm"
    tense = "tense"
    sad = "sad"
    happy = "happy"
    neutral = "neutral"


class TriggerCategory(str, enum.Enum):
    work = "work"
    study = "study"
    relationship = "relationship"
    health = "health"
    family = "family"
    finance = "finance"
    self_care = "self-care"
    other = "other"


class LanguageType(str, enum.Enum):
    th = "th"
    en = "en"


class ThemeType(str, enum.Enum):
    light = "light"
    dark = "dark"


class PlanType(str, enum.Enum):
    free = "free"
    pro = "pro"
    admin = "admin"


# ============================================================
# MODELS
# ============================================

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    persona = Column(Enum(PersonaType), default=PersonaType.worker)
    plan = Column(Enum(PlanType), default=PlanType.free)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    reflections = relationship("Reflection", back_populates="user", cascade="all, delete-orphan")
    trigger_stats = relationship("TriggerStat", back_populates="user", cascade="all, delete-orphan")
    daily_summaries = relationship("DailySummary", back_populates="user", cascade="all, delete-orphan")
    baseline = relationship("UserBaseline", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    ai_usage = relationship("UserAIUsage", back_populates="user", cascade="all, delete-orphan")


class UserAIUsage(Base):
    __tablename__ = "user_ai_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    usage_date = Column(Date, default=datetime.utcnow().date(), nullable=False)
    call_count = Column(Integer, default=0)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="ai_usage")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    email_notifications = Column(Boolean, default=True)
    language = Column(Enum(LanguageType), default=LanguageType.th)
    theme = Column(Enum(ThemeType), default=ThemeType.light)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="settings")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    entry_date = Column(Date, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="journal_entries")
    analysis = relationship("AnalysisSnapshot", back_populates="entry", uselist=False, cascade="all, delete-orphan")
    triggers = relationship("EntryTrigger", back_populates="entry", cascade="all, delete-orphan")
    reflection = relationship("Reflection", back_populates="entry", uselist=False, cascade="all, delete-orphan")


class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id = Column(UUID(as_uuid=True), ForeignKey("journal_entries.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Reflection content
    reflection_text = Column(Text, nullable=False)
    questions = Column(JSON)  # Array of questions
    
    # Metadata
    persona = Column(Enum(PersonaType), nullable=False)
    model_used = Column(String(50), default="gemini-1.5-flash")
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    is_fallback = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    entry = relationship("JournalEntry", back_populates="reflection")
    user = relationship("User", back_populates="reflections")


class AnalysisSnapshot(Base):
    __tablename__ = "analysis_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id = Column(UUID(as_uuid=True), ForeignKey("journal_entries.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Sentiment & Emotion
    sentiment_score = Column(Float)  # -1 to 1
    emotion_vector = Column(JSON)  # {"calm": 0.3, "tense": 0.5, ...}
    dominant_emotion = Column(Enum(EmotionType))
    
    # Linguistic Features
    avg_sentence_length = Column(Float)
    sentence_length_variance = Column(Float)
    modal_verb_count = Column(Integer, default=0)
    negation_count = Column(Integer, default=0)
    first_person_ratio = Column(Float)
    vocabulary_repetition = Column(Float)
    
    # Raw data
    word_count = Column(Integer)
    sentence_count = Column(Integer)
    raw_features = Column(JSON)
    
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    entry = relationship("JournalEntry", back_populates="analysis")


class Trigger(Base):
    __tablename__ = "triggers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    name_th = Column(String(100))
    category = Column(Enum(TriggerCategory, values_callable=lambda x: [e.value for e in x]), default=TriggerCategory.other)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    entry_triggers = relationship("EntryTrigger", back_populates="trigger")
    trigger_stats = relationship("TriggerStat", back_populates="trigger")


class EntryTrigger(Base):
    __tablename__ = "entry_triggers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id = Column(UUID(as_uuid=True), ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False)
    trigger_id = Column(UUID(as_uuid=True), ForeignKey("triggers.id", ondelete="CASCADE"), nullable=False)
    relevance_score = Column(Float, default=1.0)
    sentiment_context = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    entry = relationship("JournalEntry", back_populates="triggers")
    trigger = relationship("Trigger", back_populates="entry_triggers")


class TriggerStat(Base):
    __tablename__ = "trigger_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    trigger_id = Column(UUID(as_uuid=True), ForeignKey("triggers.id", ondelete="CASCADE"), nullable=False)
    
    occurrence_count = Column(Integer, default=0)
    avg_sentiment = Column(Float)
    sentiment_volatility = Column(Float)
    
    first_seen = Column(DateTime)
    last_seen = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="trigger_stats")
    trigger = relationship("Trigger", back_populates="trigger_stats")


class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    summary_date = Column(Date, nullable=False)
    
    entry_count = Column(Integer, default=0)
    avg_sentiment = Column(Float)
    emotion_distribution = Column(JSON)
    language_drift_delta = Column(JSON)
    top_triggers = Column(JSON)
    generated_insight = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="daily_summaries")


class UserBaseline(Base):
    __tablename__ = "user_baselines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    baseline_sentiment = Column(Float)
    baseline_sentence_length = Column(Float)
    baseline_modal_verb_ratio = Column(Float)
    baseline_negation_ratio = Column(Float)
    baseline_first_person_ratio = Column(Float)
    
    sample_count = Column(Integer, default=0)
    window_days = Column(Integer, default=30)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="baseline")


class CrisisKeyword(Base):
    __tablename__ = "crisis_keywords"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    keyword = Column(String(100), nullable=False)
    keyword_pattern = Column(String(255))
    severity = Column(Integer, default=1)  # 1=low, 2=medium, 3=high
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender = Column(String(50), nullable=False)  # 'user' or 'ai'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
