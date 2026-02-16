# 🧠 nlp/

NLP & Feature Extraction Pipeline (Non-LLM)

## Tech Stack
- Hugging Face Transformers
- spaCy
- PyThaiNLP (สำหรับภาษาไทย)
- NLTK (optional)

## โครงสร้าง
```
nlp/
├── emotion/      # Emotion/sentiment analysis
├── linguistic/   # Language drift features
└── triggers/     # Trigger extraction
```

## Features ที่วิเคราะห์

### Emotion / Sentiment (Phase 3)
- sentiment_score ∈ [-1, 1]
- emotion_vector (calm / tense / sad)

### Linguistic Features (Phase 3)
- Average sentence length
- Sentence length variance
- Modal verb frequency (เช่น "ต้อง", "ควร")
- Negation count
- First-person pronoun ratio
- Vocabulary repetition

> ❗ LLM is NOT used in this layer
