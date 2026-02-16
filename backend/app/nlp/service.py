"""
NLP Service — Integrates all NLP modules into a single analysis pipeline.
Pipeline order:
  1. Crisis check (safety first)
  2. Preprocessing
  3. Sentiment & Emotion analysis
  4. Linguistic feature extraction
"""

from app.nlp.preprocessor import preprocess
from app.nlp.analyzer import analyze as analyze_sentiment_emotion
from app.nlp.feature_extractor import extract_features
from app.nlp.crisis_detector import check_crisis


def analyze_text(text: str) -> dict:
    """
    Full NLP analysis pipeline for a single text entry.

    Returns:
    {
        "crisis": { ... },
        "sentiment_score": float,
        "emotion_vector": { ... },
        "dominant_emotion": str,
        "features": { ... },
        "word_count": int,
        "sentence_count": int,
    }
    """
    # 1. Crisis check (safety first — before any processing)
    crisis_result = check_crisis(text)

    # 2. Preprocess
    preprocessed = preprocess(text)

    # 3. Sentiment & Emotion analysis
    sentiment_result = analyze_sentiment_emotion(preprocessed["words"])

    # 4. Linguistic feature extraction
    features = extract_features(preprocessed["words"], preprocessed["sentences"])

    return {
        "crisis": crisis_result,
        "sentiment_score": sentiment_result["sentiment_score"],
        "emotion_vector": sentiment_result["emotion_vector"],
        "dominant_emotion": sentiment_result["dominant_emotion"],
        "features": {
            "avg_sentence_length": features["avg_sentence_length"],
            "sentence_length_variance": features["sentence_length_variance"],
            "modal_verb_count": features["modal_verb_count"],
            "negation_count": features["negation_count"],
            "first_person_ratio": features["first_person_ratio"],
            "vocabulary_repetition": features["vocabulary_repetition"],
            "pressure_word_count": features["pressure_word_count"],
            "uncertainty_word_count": features["uncertainty_word_count"],
        },
        "word_count": preprocessed["word_count"],
        "sentence_count": preprocessed["sentence_count"],
    }
