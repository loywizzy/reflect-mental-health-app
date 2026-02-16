"""
Linguistic Feature Extractor
- Extracts explainable language features from text
- No medical labels, only observable patterns
- Features: sentence length, modal verbs, negations, first person ratio, etc.
"""

from collections import Counter
from app.nlp.preprocessor import tokenize_words, tokenize_sentences


# ============================================================
# THAI LINGUISTIC PATTERNS
# ============================================================

# Modal verbs (คำช่วยกริยาบอกความจำเป็น/ภาระ)
MODAL_VERBS: set[str] = {
    "ต้อง", "ควร", "ควรจะ", "จำเป็น", "น่าจะ", "อยาก", "อาจ",
    "ไม่ไหว", "ไหว", "ห้าม", "พยายาม",
}

# Negation words
NEGATION_WORDS: set[str] = {
    "ไม่", "ไม่ได้", "ไม่มี", "ไม่เคย", "ไม่ค่อย", "ยังไม่",
    "ไม่รู้", "ไม่ใช่", "ไม่อยาก", "ไม่เป็น",
}

# First person pronouns
FIRST_PERSON_PRONOUNS: set[str] = {
    "ฉัน", "ผม", "เรา", "ดิฉัน", "ข้าพเจ้า", "กู", "กัน",
    "หนู", "ตัวเอง",
}

# Pressure/obligation keywords
PRESSURE_WORDS: set[str] = {
    "ต้อง", "ต้องทำ", "ต้องให้", "ให้ได้", "ทำให้ได้",
    "ไม่ไหว", "หนัก", "กดดัน", "เครียด", "แรงกดดัน",
}

# Uncertainty words
UNCERTAINTY_WORDS: set[str] = {
    "ไม่รู้", "ไม่แน่ใจ", "สงสัย", "อาจจะ", "น่าจะ",
    "คงจะ", "ลังเล", "ไม่ชัด",
}


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_sentence_features(sentences: list[str]) -> dict:
    """Extract sentence-level features."""
    if not sentences:
        return {"avg_sentence_length": 0.0, "sentence_length_variance": 0.0}

    lengths = [len(tokenize_words(s)) for s in sentences]
    avg_length = sum(lengths) / len(lengths)

    # Variance
    if len(lengths) > 1:
        variance = sum((x - avg_length) ** 2 for x in lengths) / len(lengths)
    else:
        variance = 0.0

    return {
        "avg_sentence_length": round(avg_length, 2),
        "sentence_length_variance": round(variance, 2),
    }


def count_pattern(words: list[str], pattern_set: set[str]) -> int:
    """Count occurrences of words in a pattern set."""
    return sum(1 for w in words if w in pattern_set)


def extract_vocabulary_features(words: list[str]) -> dict:
    """Extract vocabulary usage features."""
    if not words:
        return {"vocabulary_repetition": 0.0, "unique_word_ratio": 0.0}

    word_counts = Counter(words)
    unique_words = len(word_counts)
    total_words = len(words)

    # Repetition = 1 - (unique / total); high = more repetitive
    repetition = 1.0 - (unique_words / total_words) if total_words > 0 else 0.0

    return {
        "vocabulary_repetition": round(repetition, 3),
        "unique_word_ratio": round(unique_words / total_words, 3) if total_words > 0 else 0.0,
    }


def extract_features(words: list[str], sentences: list[str]) -> dict:
    """
    Extract all linguistic features from preprocessed text.
    Returns a feature dictionary.

    Features:
    - avg_sentence_length: average words per sentence
    - sentence_length_variance: variance in sentence length
    - modal_verb_count: count of modal/obligation words
    - negation_count: count of negation words
    - first_person_ratio: ratio of first person pronouns
    - vocabulary_repetition: how repetitive the vocabulary is
    - pressure_word_count: count of pressure-related words
    - uncertainty_word_count: count of uncertainty words
    """
    sentence_features = extract_sentence_features(sentences)
    vocab_features = extract_vocabulary_features(words)

    modal_count = count_pattern(words, MODAL_VERBS)
    negation_count = count_pattern(words, NEGATION_WORDS)
    first_person_count = count_pattern(words, FIRST_PERSON_PRONOUNS)
    pressure_count = count_pattern(words, PRESSURE_WORDS)
    uncertainty_count = count_pattern(words, UNCERTAINTY_WORDS)

    total_words = len(words)
    first_person_ratio = first_person_count / total_words if total_words > 0 else 0.0

    return {
        "avg_sentence_length": sentence_features["avg_sentence_length"],
        "sentence_length_variance": sentence_features["sentence_length_variance"],
        "modal_verb_count": modal_count,
        "negation_count": negation_count,
        "first_person_ratio": round(first_person_ratio, 3),
        "vocabulary_repetition": vocab_features["vocabulary_repetition"],
        "pressure_word_count": pressure_count,
        "uncertainty_word_count": uncertainty_count,
        "word_count": total_words,
        "sentence_count": len(sentences),
    }
