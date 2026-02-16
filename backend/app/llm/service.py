"""
AI Reflection Service
Main service for generating reflections using Gemini
"""

from .provider import generate_text, configure_gemini
from .prompts import build_reflection_prompt
from .safety import validate_reflection, get_fallback_reflection
import logging

logger = logging.getLogger(__name__)

# Configure Gemini on module load
configure_gemini()


async def generate_reflection(
    content: str,
    persona: str = "worker",
    sentiment_score: float = None,
    dominant_emotion: str = None,
    triggers: list = None,
) -> dict:
    """
    Generate AI reflection for a journal entry
    
    Args:
        content: Journal entry content
        persona: User persona (student/worker/teen)
        sentiment_score: Sentiment score from NLP
        dominant_emotion: Dominant emotion from NLP
        triggers: List of detected triggers
        
    Returns:
        dict with 'reflection_text', 'prompt_tokens', 'completion_tokens', 'model_used', 'is_fallback'
    """
    
    try:
        # Build prompt
        prompt = build_reflection_prompt(
            content=content,
            persona=persona,
            sentiment_score=sentiment_score,
            dominant_emotion=dominant_emotion,
            triggers=triggers
        )
        
        # Generate using Gemini
        logger.info(f"Generating reflection for persona={persona}")
        result = await generate_text(prompt)
        
        reflection_text = result["text"]
        
        # Validate safety
        is_valid, reason = validate_reflection(reflection_text)
        
        if not is_valid:
            logger.warning(f"Reflection failed validation: {reason}")
            logger.warning(f"Original text: {reflection_text[:200]}...")
            
            # Use fallback
            reflection_text = get_fallback_reflection(persona)
            
            return {
                "reflection_text": reflection_text,
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "model_used": "fallback",
                "is_fallback": True,
            }
        
        # Success
        return {
            "reflection_text": reflection_text,
            "prompt_tokens": result.get("prompt_tokens", 0),
            "completion_tokens": result.get("completion_tokens", 0),
            "model_used": "gemini-1.5-flash",
            "is_fallback": False,
        }
        
    except Exception as e:
        logger.error(f"Error generating reflection: {str(e)}")
        
        # Return fallback on error
        return {
            "reflection_text": get_fallback_reflection(persona),
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "model_used": "fallback",
            "is_fallback": True,
            "error": str(e),
        }
