"""
Text Preprocessor for Thai Language
- Tokenization (word segmentation)
- Sentence segmentation
- Text cleaning
"""

import re
from pythainlp.tokenize import word_tokenize, sent_tokenize


def clean_text(text: str) -> str:
    """Clean raw text input."""
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove excessive punctuation but keep Thai and common punctuation
    text = re.sub(r'[^\u0E00-\u0E7Fa-zA-Z0-9\s.,!?()""\'…\-]', '', text)
    return text


def tokenize_words(text: str) -> list[str]:
    """Tokenize Thai text into words using attacut engine."""
    cleaned = clean_text(text)
    tokens = word_tokenize(cleaned, engine="newmm")
    # Filter out whitespace tokens
    return [t for t in tokens if t.strip()]


def tokenize_sentences(text: str) -> list[str]:
    """Segment text into sentences."""
    cleaned = clean_text(text)
    sentences = sent_tokenize(cleaned)
    # Filter empty sentences
    return [s.strip() for s in sentences if s.strip()]


def get_word_count(text: str) -> int:
    """Get number of meaningful words."""
    tokens = tokenize_words(text)
    return len(tokens)


def get_sentence_count(text: str) -> int:
    """Get number of sentences."""
    sentences = tokenize_sentences(text)
    return len(sentences)


def preprocess(text: str) -> dict:
    """
    Full preprocessing pipeline.
    Returns structured data for downstream analysis.
    """
    cleaned = clean_text(text)
    words = tokenize_words(cleaned)
    sentences = tokenize_sentences(cleaned)

    return {
        "cleaned_text": cleaned,
        "words": words,
        "sentences": sentences,
        "word_count": len(words),
        "sentence_count": len(sentences),
    }
