"""
AI Reflection Service
Main service for generating reflections using Gemini
"""

from .provider import generate_text, configure_gemini
from .prompts import build_reflection_prompt
from .safety import validate_reflection, get_fallback_reflection
import logging

logger = logging.getLogger(__name__)

from app.core.config import settings
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
            "model_used": settings.gemini_model,
            "is_fallback": False,
        }
        
    except Exception as e:
        logger.error(f"Error generating reflection: {str(e)}")
        
        return {
            "reflection_text": get_fallback_reflection(persona),
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "model_used": "fallback",
            "is_fallback": True,
            "error": str(e),
        }


async def generate_chat_response(
    history: list,
    current_message: str,
    persona: str = "worker"
) -> str:
    """
    Generate chat response based on history and persona.
    """
    try:
        # System instruction — กระชับ ส่ง 1 ครั้ง
        system_instruction = f"""คุณคือ AI เพื่อนรับฟังในแอป mental health สำหรับ persona: {persona}
- student: เป็นกันเอง เข้าใจเรื่องการเรียน
- worker: professional แต่อบอุ่น เข้าใจ burnout
- teen: สบายๆ ประโยคสั้น
กฎ: ฟังอย่างตั้งใจ ถามคำถามปลายเปิด ไม่วินิจฉัย ไม่ให้คำสัญญา ตอบไม่เกิน 150 คำ
ถ้าผู้ใช้พูดถึงการทำร้ายตัวเอง ให้แนะนำสายด่วน 1323 ทันที"""
        
        # จำกัด history แค่ 10 messages ล่าสุด เพื่อประหยัด token
        MAX_HISTORY = 10
        recent_history = history[-MAX_HISTORY:] if len(history) > MAX_HISTORY else history
        
        # Format History
        transcript = ""
        if len(history) > MAX_HISTORY:
            transcript += f"[... {len(history) - MAX_HISTORY} ข้อความก่อนหน้า ...]\n"
        for msg in recent_history:
            role = "User" if msg.sender == "user" else "AI"
            transcript += f"{role}: {msg.content}\n"
            
        prompt = f"{system_instruction}\n\nConversation History:\n{transcript}User: {current_message}\nAI:"

        # Generate
        logger.info(f"Generating chat response for persona={persona}")
        result = await generate_text(prompt)
        text = result["text"]
        
        # Validate (Safety)
        # We reuse validation logic
        is_safe, violations = validate_reflection(text) 
        if not is_safe:
             logger.warning(f"Chat unsafe: {violations}")
             return "ขออภัยครับ ระบบตรวจพบข้อความที่ไม่เหมาะสม หรือผมอาจจะไม่เข้าใจบริบท ลองพิมพ์ใหม่อีกครั้งนะครับ"
             
        return text

    except Exception as e:
        logger.error(f"Chat Generation Error: {e}")
        return "ขอโทษด้วยครับ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะ"
