# 🤖 llm/

LLM Reflection Layer (Safe Usage Only)

## Purpose
- Rephrase insights in warm, human language
- Ask open-ended reflective questions

## โครงสร้าง
```
llm/
├── prompts/   # System prompts (reflection-only)
└── filters/   # Output filters & validators
```

## ✅ LLM Allowed Actions
- Reflection
- Normalization
- Gentle curiosity

## ❌ LLM Forbidden Actions
- Diagnosis
- Risk scoring
- Medical advice
- Absolute statements

## Input Format (Strictly Limited)
```json
{
  "persona": "worker",
  "reflection_points": [
    "ใช้คำ 'ต้อง' บ่อยขึ้น",
    "ประโยคสั้นลง",
    "หัวข้อเรื่องงานเชื่อมกับความตึง"
  ]
}
```

## Output Control
- Temperature: low
- Prompt-locked role
- Post-processing language filter
