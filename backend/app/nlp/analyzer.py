"""
Emotion & Sentiment Analyzer (Deterministic, Non-LLM)
- Rule-based + lexicon approach
- Thai language support
- Returns sentiment score (-1 to 1) and emotion vector
"""

from pythainlp.tokenize import word_tokenize

# ============================================================
# THAI SENTIMENT LEXICONS
# ============================================================

# Positive words with scores (0.1 to 1.0)
POSITIVE_LEXICON: dict[str, float] = {
    # Happiness
    "สนุก": 0.8, "ดีใจ": 0.9, "มีความสุข": 1.0, "สุข": 0.8,
    "เพลิดเพลิน": 0.7, "ตื่นเต้น": 0.6, "ยินดี": 0.7,
    "ขอบคุณ": 0.5, "ประทับใจ": 0.7, "ภูมิใจ": 0.8,
    # Calm / Relaxed
    "สบาย": 0.6, "ผ่อนคลาย": 0.7, "สงบ": 0.6, "โล่งใจ": 0.8,
    "พักผ่อน": 0.5, "สบายใจ": 0.7, "ใจเย็น": 0.5,
    # General positive
    "ดี": 0.4, "ดีขึ้น": 0.5, "เก่ง": 0.5, "สำเร็จ": 0.7,
    "เสร็จ": 0.3, "ชอบ": 0.5, "รัก": 0.7, "หัวเราะ": 0.6,
    "ยิ้ม": 0.5, "อร่อย": 0.4, "สวย": 0.4,
    "คุ้มค่า": 0.5, "ได้เรียนรู้": 0.5, "เติบโต": 0.5,
}

# Negative words with scores (-0.1 to -1.0)
NEGATIVE_LEXICON: dict[str, float] = {
    # Sadness
    "เศร้า": -0.8, "ร้องไห้": -0.7, "เสียใจ": -0.8, "ผิดหวัง": -0.7,
    "เหงา": -0.6, "ว้าเหว่": -0.7, "คิดถึง": -0.3,
    "สูญเสีย": -0.8, "หมดหวัง": -0.9,
    # Tension / Anxiety
    "เครียด": -0.7, "กดดัน": -0.8, "กังวล": -0.7, "ตึงเครียด": -0.8,
    "กลัว": -0.6, "ไม่สบายใจ": -0.6, "หนัก": -0.5,
    "วิตก": -0.7, "แรงกดดัน": -0.8,
    # Fatigue / Frustration
    "เหนื่อย": -0.5, "เหนื่อยมาก": -0.7, "อ่อนเพลีย": -0.6,
    "หมดแรง": -0.7, "ไม่ไหว": -0.8, "ท้อ": -0.7, "ท้อแท้": -0.8,
    "รำคาญ": -0.5, "หงุดหงิด": -0.6,
    # General negative
    "แย่": -0.6, "ไม่ดี": -0.5, "ยาก": -0.4, "ลำบาก": -0.5,
    "ปัญหา": -0.4, "ผิดพลาด": -0.5, "ล้มเหลว": -0.7,
    "โกรธ": -0.7, "เกลียด": -0.8, "น่ารำคาญ": -0.5,
}

# Intensifiers
INTENSIFIERS: dict[str, float] = {
    "มาก": 1.5, "มากๆ": 1.8, "สุดๆ": 1.8, "ที่สุด": 2.0,
    "นิดหน่อย": 0.5, "เล็กน้อย": 0.5, "ค่อนข้าง": 0.8,
    "จริงๆ": 1.3, "โคตร": 1.8, "แบบ": 1.0,
}

# Negation words that flip sentiment
NEGATION_WORDS: set[str] = {
    "ไม่", "ไม่ได้", "ไม่ค่อย", "ไม่เคย", "ยัง", "ยังไม่",
}

# ============================================================
# EMOTION KEYWORDS FOR CLASSIFICATION
# ============================================================

EMOTION_KEYWORDS: dict[str, list[str]] = {
    "calm": ["สงบ", "สบาย", "ผ่อนคลาย", "โล่งใจ", "สบายใจ", "ใจเย็น", "พักผ่อน", "เงียบ"],
    "tense": ["เครียด", "กดดัน", "กังวล", "ตึงเครียด", "กลัว", "ไม่สบายใจ", "วิตก", "แรงกดดัน", "ต้อง", "ไม่ไหว", "หนัก"],
    "sad": ["เศร้า", "ร้องไห้", "เสียใจ", "ผิดหวัง", "เหงา", "ว้าเหว่", "ท้อ", "ท้อแท้", "หมดหวัง", "สูญเสีย"],
    "happy": ["สนุก", "ดีใจ", "มีความสุข", "สุข", "เพลิดเพลิน", "ยินดี", "ขอบคุณ", "ภูมิใจ", "หัวเราะ", "ยิ้ม"],
    "neutral": [],
}


# ============================================================
# ANALYSIS FUNCTIONS
# ============================================================

def analyze_sentiment(words: list[str]) -> float:
    """
    Calculate sentiment score from word list.
    Returns: float between -1.0 and 1.0
    """
    if not words:
        return 0.0

    total_score = 0.0
    scored_count = 0
    negate_next = False

    for i, word in enumerate(words):
        # Check for negation
        if word in NEGATION_WORDS:
            negate_next = True
            continue

        score = 0.0
        if word in POSITIVE_LEXICON:
            score = POSITIVE_LEXICON[word]
        elif word in NEGATIVE_LEXICON:
            score = NEGATIVE_LEXICON[word]

        if score != 0.0:
            # Apply negation
            if negate_next:
                score *= -0.5  # Partial flip
                negate_next = False

            # Check for intensifiers in surrounding words
            for j in range(max(0, i - 2), min(len(words), i + 3)):
                if j != i and words[j] in INTENSIFIERS:
                    score *= INTENSIFIERS[words[j]]
                    break

            total_score += score
            scored_count += 1
        else:
            negate_next = False

    if scored_count == 0:
        return 0.0

    # Normalize to -1..1 range
    avg = total_score / scored_count
    return max(-1.0, min(1.0, avg))


def analyze_emotions(words: list[str]) -> dict[str, float]:
    """
    Calculate emotion vector from word list.
    Returns: dict with emotion -> score (0.0 to 1.0)
    """
    emotion_counts: dict[str, int] = {e: 0 for e in EMOTION_KEYWORDS}
    total_matches = 0

    for word in words:
        for emotion, keywords in EMOTION_KEYWORDS.items():
            if word in keywords:
                emotion_counts[emotion] += 1
                total_matches += 1

    if total_matches == 0:
        return {"calm": 0.0, "tense": 0.0, "sad": 0.0, "happy": 0.0, "neutral": 1.0}

    # Normalize to proportions
    emotion_vector = {}
    for emotion, count in emotion_counts.items():
        emotion_vector[emotion] = round(count / total_matches, 2)

    return emotion_vector


def get_dominant_emotion(emotion_vector: dict[str, float]) -> str:
    """Get the dominant emotion from emotion vector."""
    if not emotion_vector:
        return "neutral"
    return max(emotion_vector, key=lambda k: emotion_vector[k])


def analyze(words: list[str]) -> dict:
    """
    Full sentiment + emotion analysis.
    """
    sentiment = analyze_sentiment(words)
    emotions = analyze_emotions(words)
    dominant = get_dominant_emotion(emotions)

    return {
        "sentiment_score": round(sentiment, 3),
        "emotion_vector": emotions,
        "dominant_emotion": dominant,
    }
