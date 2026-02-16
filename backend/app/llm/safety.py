"""
Safety Layer for LLM Output
Content filtering and validation
"""

import re

# Forbidden words/phrases that indicate medical diagnosis or advice
FORBIDDEN_WORDS = [
    # Medical terms
    "depression", "โรคซึมเศร้า", "โรคทางจิต",
    "anxiety", "โรควิตกกังวล",
    "disorder", "ความผิดปกติ",
    "bipolar", "สองขั้ว",
    "schizophrenia", "จิตเภท",
    
    # Treatment/medical advice
    "รักษา", "การรักษา",
    "ยา", "ยารักษา",
    "หมอ", "แพทย์", "นักจิตวิทยา" (ในบริบทแนะนำ),
    "ควรไปพบแพทย์", "ควรปรึกษาหมอ",
    
    # Diagnostic language
    "คุณเป็น", "คุณมีปัญหา", "คุณมีอาการ",
    "คุณอาจเป็น", "คุณอาจมีปัญหา",
    
    # False promises
    "ทุกอย่างจะดีขึ้น", "จะดีขึ้นแน่นอน",
    "ไม่ต้องกังวล", "ไม่มีอะไร",
]

# Regex patterns for problematic phrases
FORBIDDEN_PATTERNS = [
    r"คุณ(อาจ)?เป็น\s*(โรค|ปัญหา)",
    r"(ควร|น่าจะ)(ไป)?พบ(หมอ|แพทย์|นักจิตวิทยา)",
    r"ต้อง(รักษา|กิน|ใช้)ยา",
]


def check_forbidden_content(text: str) -> tuple[bool, list[str]]:
    """
    Check if text contains forbidden words or patterns
    
    Returns:
        (is_safe, violations) - tuple of bool and list of violations found
    """
    violations = []
    text_lower = text.lower()
    
    # Check forbidden words
    for word in FORBIDDEN_WORDS:
        if word.lower() in text_lower:
            violations.append(f"Forbidden word: {word}")
    
   # Check forbidden patterns
    for pattern in FORBIDDEN_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            violations.append(f"Forbidden pattern: {pattern}")
    
    is_safe = len(violations) == 0
    return is_safe, violations


def validate_reflection(text: str) -> tuple[bool, str]:
    """
    Validate reflection output
    
    Returns:
        (is_valid, reason) - tuple of bool and reason if invalid
    """
    
    # Check empty
    if not text or len(text.strip()) == 0:
        return False, "Empty reflection"
    
    # Check minimum length
    if len(text.strip()) < 50:
        return False, "Reflection too short"
    
    # Check maximum length
    if len(text) > 1500:
        return False, "Reflection too long"
    
    # Check forbidden content
    is_safe, violations = check_forbidden_content(text)
    if not is_safe:
        return False, f"Contains forbidden content: {violations[0]}"
    
    return True, ""


def get_fallback_reflection(persona: str = "worker") -> str:
    """
    Get fallback reflection when LLM fails or produces unsafe content
    """
    fallback_messages = {
        "student": "ขอบคุณที่แบ่งปันวันนี้ 🌱 อยากถามว่า มีอะไรที่ทำให้รู้สึกแบบนี้บ้าง? และถ้ามีโอกาส อยากเปลี่ยนแปลงอะไรไหม?",
        "worker": "ขอบคุณที่แบ่งปันวันนี้ 🌱 อยากถามว่า อะไรที่ทำให้รู้สึกแบบนี้? และถ้ามีเวลามากขึ้น อยากทำอะไรบ้าง?",
        "teen": "ขอบคุณที่แบ่งปันวันนี้ 🌱 อยากรู้ว่า อะไรที่ทำให้รู้สึกแบบนี้? และคิดว่าอะไรจะช่วยให้รู้สึกดีขึ้นได้บ้าง?",
    }
    
    return fallback_messages.get(persona, fallback_messages["worker"])
