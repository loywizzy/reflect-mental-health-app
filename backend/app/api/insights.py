from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.core import get_db
from app.models import (
    User, 
    JournalEntry, 
    AnalysisSnapshot, 
    TriggerStat, 
    Trigger,
    UserBaseline,
    DailySummary,
)
from app.schemas import (
    TrendDataPoint,
    LanguageDrift,
    TriggerStatResponse,
    TriggerResponse,
    DashboardResponse,
)
from app.api.auth import get_current_user

router = APIRouter(prefix="/insights", tags=["insights"])


def get_emotion_emoji(emotion: str) -> str:
    """Convert emotion to emoji."""
    emoji_map = {
        "calm": "😌",
        "tense": "😰",
        "sad": "😔",
        "happy": "😊",
        "neutral": "😐",
    }
    return emoji_map.get(emotion, "😐")


def get_day_label(day: int) -> str:
    """Get Thai day label."""
    days = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"]
    return days[day % 7]


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard data including trends, language drift, and trigger stats."""
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # 1. Get Trend Data
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.entry_date >= start_date,
        JournalEntry.entry_date <= end_date,
    ).order_by(JournalEntry.entry_date.asc()).all()
    
    trend_data = []
    for entry in entries:
        if entry.analysis:
            trend_data.append(TrendDataPoint(
                date=get_day_label(entry.entry_date.weekday()),
                sentiment=entry.analysis.sentiment_score or 0,
                label=get_emotion_emoji(entry.analysis.dominant_emotion.value if entry.analysis.dominant_emotion else "neutral"),
            ))
    
    # 2. Get Language Drift (comparing to baseline)
    baseline = db.query(UserBaseline).filter(
        UserBaseline.user_id == current_user.id
    ).first()
    
    language_drift = []
    if baseline and entries:
        # Calculate current averages
        analyses = [e.analysis for e in entries if e.analysis]
        if analyses:
            current_sentence_length = sum(a.avg_sentence_length or 0 for a in analyses) / len(analyses)
            current_modal_count = sum(a.modal_verb_count or 0 for a in analyses) / len(analyses)
            current_negation_count = sum(a.negation_count or 0 for a in analyses) / len(analyses)
            
            # Calculate deltas
            if baseline.baseline_sentence_length:
                delta = current_sentence_length - baseline.baseline_sentence_length
                delta_pct = (delta / baseline.baseline_sentence_length) * 100 if baseline.baseline_sentence_length else 0
                language_drift.append(LanguageDrift(
                    metric="ความยาวประโยค",
                    value=round(current_sentence_length, 1),
                    delta=round(delta, 1),
                    delta_percent=round(delta_pct, 0),
                    direction="up" if delta > 0 else "down" if delta < 0 else "stable",
                ))
            
            if baseline.baseline_modal_verb_ratio:
                baseline_count = baseline.baseline_modal_verb_ratio * baseline.sample_count if baseline.sample_count else 0
                delta = current_modal_count - baseline_count
                delta_pct = (delta / baseline_count) * 100 if baseline_count else 0
                language_drift.append(LanguageDrift(
                    metric='การใช้คำ "ต้อง"',
                    value=round(current_modal_count, 1),
                    delta=round(delta, 1),
                    delta_percent=round(delta_pct, 0),
                    direction="up" if delta > 0 else "down" if delta < 0 else "stable",
                ))

            if baseline.baseline_negation_ratio:
                baseline_count = baseline.baseline_negation_ratio * baseline.sample_count if baseline.sample_count else 0
                delta = current_negation_count - baseline_count
                delta_pct = (delta / baseline_count) * 100 if baseline_count else 0
                language_drift.append(LanguageDrift(
                    metric="คำปฏิเสธ",
                    value=round(current_negation_count, 1),
                    delta=round(delta, 1),
                    delta_percent=round(delta_pct, 0),
                    direction="up" if delta > 0 else "down" if delta < 0 else "stable",
                ))
    
    # 3. Get Trigger Stats
    trigger_stats = db.query(TriggerStat).filter(
        TriggerStat.user_id == current_user.id
    ).order_by(TriggerStat.occurrence_count.desc()).limit(10).all()
    
    trigger_stats_response = []
    for stat in trigger_stats:
        trigger_stats_response.append(TriggerStatResponse(
            trigger=TriggerResponse(
                id=stat.trigger.id,
                name=stat.trigger.name,
                name_th=stat.trigger.name_th,
                category=stat.trigger.category,
            ),
            occurrence_count=stat.occurrence_count,
            avg_sentiment=stat.avg_sentiment,
            sentiment_volatility=stat.sentiment_volatility,
            last_seen=stat.last_seen,
        ))
    
    # 4. Generate Insights (deterministic)
    insights = []
    if language_drift:
        for drift in language_drift:
            if abs(drift.delta_percent) >= 15:
                direction_text = "เพิ่มขึ้น" if drift.direction == "up" else "ลดลง"
                insights.append(f"ช่วงนี้ {drift.metric} {direction_text} {abs(drift.delta_percent):.0f}% จาก baseline")
    
    if trigger_stats_response:
        top_trigger = trigger_stats_response[0]
        if top_trigger.avg_sentiment and top_trigger.avg_sentiment < -0.2:
            insights.append(f"หัวข้อ '{top_trigger.trigger.name_th or top_trigger.trigger.name}' มักเชื่อมโยงกับอารมณ์เชิงลบ")
    
    return DashboardResponse(
        trend_data=trend_data,
        language_drift=language_drift,
        trigger_stats=trigger_stats_response,
        insights=insights,
    )


@router.get("/triggers", response_model=list[TriggerStatResponse])
def get_trigger_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's trigger statistics for Trigger Map."""
    trigger_stats = db.query(TriggerStat).filter(
        TriggerStat.user_id == current_user.id
    ).order_by(TriggerStat.occurrence_count.desc()).all()
    
    result = []
    for stat in trigger_stats:
        result.append(TriggerStatResponse(
            trigger=TriggerResponse(
                id=stat.trigger.id,
                name=stat.trigger.name,
                name_th=stat.trigger.name_th,
                category=stat.trigger.category,
            ),
            occurrence_count=stat.occurrence_count,
            avg_sentiment=stat.avg_sentiment,
            sentiment_volatility=stat.sentiment_volatility,
            last_seen=stat.last_seen,
        ))
    
    return result
