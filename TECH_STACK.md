# 🧱 TECH_STACK.md
## Mental Health AI Web App (Reflect)

เอกสารนี้อธิบาย Tech Stack และเหตุผลเชิงระบบ  
สำหรับโปรเจกต์ Mental Health AI Web App ที่เน้น **ความปลอดภัย, อธิบายได้, และจริยธรรม**

---

## 🎯 System Goals

- ไม่วินิจฉัยโรค (No diagnosis)
- ไม่แทนผู้เชี่ยวชาญ (No medical advice)
- วิเคราะห์แนวโน้ม (Trend-based, not state-based)
- AI ใช้เพื่อ “สะท้อน” ไม่ใช่ “ตัดสิน”
- Explainable by design
- Privacy-first

---

## 🏗 High-Level Architecture

[ Web Client ]
↓
[ Backend API ]
↓
[ NLP / Feature Extraction ] (Non-LLM)
↓
[ Trend & Trigger Engine ] (Rule-based + Stats)
↓
[ Insight Generator ] (Deterministic)
↓
[ LLM Reflection Layer ] (Guarded, Output-only)
↓
[ Frontend Dashboard ]


---

## 🎨 Frontend Layer

### Framework
- **Next.js (React)**
  - Server-side rendering
  - API routes for MVP
  - Easy deployment (Vercel)

### Styling / UI
- **Tailwind CSS**
  - Calm color palette
  - Consistent spacing
- **Headless UI / Radix UI (optional)**
  - Accessibility-first components

### Visualization
- **Recharts** or **Chart.js**
  - Mood trends
  - Trigger maps
- UI rule:
  - ❌ No aggressive colors (red)
  - ❌ No sharp alerts
  - ✅ Soft, neutral visual language

---

## 🔌 Backend Layer

### Language
- **TypeScript (Node.js)**  
  OR  
- **Python (FastAPI)** if NLP-first workflow preferred

### Responsibilities
- Authentication
- Journal CRUD
- Orchestrate NLP pipeline
- Store analysis snapshots
- Serve insight data to frontend
- Call LLM reflection service

---

## 🗄 Database Layer

### Primary Database
- **PostgreSQL**

### Core Tables
- users
- journal_entries
- analysis_snapshots
- daily_summaries
- trigger_stats

### Design Principles
- No medical labels
- Store features, not conclusions
- Time-series friendly schema
- User owns and can delete all data

---

## 🧠 NLP & Emotion Analysis Layer (Non-LLM)

> ❗ LLM is NOT used in this layer

### Libraries
- **Hugging Face Transformers**
- **spaCy**
- **NLTK** (optional)

### Emotion / Sentiment
- Small, fixed emotion model
- Outputs:
  - sentiment_score ∈ [-1, 1]
  - emotion_vector (e.g. calm / tense / sad)

### Linguistic Feature Extraction (Rule-based)
- Average sentence length
- Sentence length variance
- Modal verb frequency (e.g. “ต้อง”, “ควร”)
- Negation count
- First-person pronoun ratio
- Vocabulary repetition

> These features form **Language Drift**

---

## 📈 Trend & Trigger Engine (Core Intelligence)

### Trend Analysis
- Rolling window (e.g. 7 days)
- Baseline comparison per user
- Delta-based evaluation (not prediction)

Example:
- sentiment ↓ for 5 consecutive days
- sentence length ↓ vs personal baseline

### Trigger Mapping
- Keyword-based topic extraction (MVP)
- Optional: embedding similarity
- Co-occurrence with emotion changes

Output:
- topic → frequency
- topic → avg sentiment
- topic → volatility

### Key Rule
- Compare user to **self**, not population

---

## 🪞 Insight Generation (Deterministic)

### Input
- Aggregated trends
- Language drift signals
- Trigger correlations

### Output
- Human-readable insight (non-LLM)
- Example:
  - “ช่วงนี้คุณใช้คำบ่งบอกแรงกดดันบ่อยขึ้น”
  - “อารมณ์ตึงเกิดชัดเวลาเขียนถึงเรื่องงาน”

> All insights must be explainable

---

## 🤖 LLM Reflection Layer (Safe Usage Only)

### Purpose
- Rephrase insights in warm, human language
- Ask open-ended reflective questions

### LLM Allowed Actions
- Reflection
- Normalization
- Gentle curiosity

### LLM Forbidden Actions
- Diagnosis
- Risk scoring
- Medical advice
- Absolute statements

### Input to LLM (Strictly Limited)
```json
{
  "persona": "worker",
  "reflection_points": [
    "ใช้คำ 'ต้อง' บ่อยขึ้น",
    "ประโยคสั้นลง",
    "หัวข้อเรื่องงานเชื่อมกับความตึง"
  ]
}

Output Control

Temperature: low

Prompt-locked role

Post-processing language filter

🚨 Safety & Crisis Layer
Detection

Keyword / phrase matching

Regex-based

Runs BEFORE LLM

Crisis Flow

Risk Keyword Detected
   ↓
Disable LLM
   ↓
Show static supportive message
   ↓
Encourage human help

Rules

No improvisation by LLM

No automated diagnosis

No emergency handling claims

🔐 Authentication & Privacy
Auth

Auth.js / NextAuth

Email-based login (MVP)

Privacy

Minimal data collection

Optional encryption at rest

User-controlled deletion

No data sharing by default

🧪 Testing Strategy
Unit Tests

Trend calculation

Language drift metrics

Trigger mapping logic

Edge Cases

Empty input

Very short text

Long silence (no entries)

Safety Tests

Crisis keywords

False positives

LLM output validation

🚀 Deployment (MVP)

Frontend: Vercel

Backend: Railway / Render

Database: Managed PostgreSQL

📌 Non-Goals (Explicitly Out of Scope)

Clinical diagnosis

Therapy replacement

Real-time emergency response

Population-level mental health scoring

🧠 Design Philosophy Summary

Deterministic > Probabilistic for decisions

Reflection > Evaluation

Explainable > Accurate-but-opaque

User agency > AI authority

📄 Status

Phase: MVP / Prototype

Intended use: Educational / Research / Demo

Not a medical device