"""
Gemini API Provider
Handles communication with Google Gemini API
"""

import google.generativeai as genai
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import User, UserAIUsage, PlanType

logger = logging.getLogger(__name__)

# Plan Limits (calls per day)
PLAN_LIMITS = {
    PlanType.free: 10,
    PlanType.pro: 100,
    PlanType.admin: 1000
}

def check_user_gemini_quota(db: Session, user_id: str) -> int:
    """
    Check and increment user's daily AI usage quota.
    Returns: Current call count for the user today.
    Raises: Exception if quota exceeded.
    """
    # 1. Get user and their plan
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise Exception("User not found for quota check")
    
    plan = user.plan or PlanType.free
    limit = PLAN_LIMITS.get(plan, 10)
    
    # 2. Get or create daily usage record
    today = datetime.utcnow().date()
    usage = db.query(UserAIUsage).filter(
        UserAIUsage.user_id == user_id,
        UserAIUsage.usage_date == today
    ).first()
    
    if not usage:
        usage = UserAIUsage(user_id=user_id, usage_date=today, call_count=0)
        db.add(usage)
        db.flush()
    
    # 3. Check limit
    if usage.call_count >= limit:
        raise Exception(f"Daily AI limit reached ({usage.call_count}/{limit}). Please upgrade to Pro for more reflections.")
    
    # 4. Increment
    usage.call_count += 1
    db.commit()
    
    return usage.call_count


def configure_gemini():
    """Configure Gemini API with key from settings"""
    if settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)
    else:
        logger.warning("GEMINI_API_KEY not set!")


def get_gemini_model(model_name: str = None):
    """Get configured Gemini model instance"""
    if not model_name:
        model_name = settings.gemini_model
    
    return genai.GenerativeModel(model_name)


async def generate_text(prompt: str, db: Session, user_id: str, model_name: str = None) -> dict:
    """
    Generate text using Gemini API with per-user quota check
    """
    # Check Quota first
    call_num = check_user_gemini_quota(db, user_id)
    
    try:
        model = get_gemini_model(model_name)
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.9,
                top_k=40,
                max_output_tokens=800,
            ),
        )
        
        # Extract token counts
        prompt_tokens = response.usage_metadata.prompt_token_count if hasattr(response, 'usage_metadata') else 0
        completion_tokens = response.usage_metadata.candidates_token_count if hasattr(response, 'usage_metadata') else 0
        
        logger.info(f"💰 Gemini usage [User: {user_id}]: {prompt_tokens + completion_tokens} tokens (call #{call_num})")
        
        return {
            "text": response.text,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        }
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        raise Exception(f"Gemini API error: {str(e)}")
