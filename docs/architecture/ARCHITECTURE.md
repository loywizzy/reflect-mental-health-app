# 🏗️ System Architecture — Reflect Mental Health AI Web App

เอกสารนี้แสดง Architecture Diagram และ Data Flow ของระบบ

---

## 🎯 Architecture Overview

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        WEB["🌐 Web Browser"]
    end

    subgraph Frontend["🎨 Frontend (Next.js)"]
        PAGES["📄 Pages<br/>(App Router)"]
        COMPONENTS["🧩 Components"]
        STATE["📦 State Management"]
    end

    subgraph Backend["🔌 Backend (FastAPI)"]
        API["🔗 API Routes"]
        AUTH["🔐 Auth Service"]
        JOURNAL["📝 Journal Service"]
        INSIGHT["💡 Insight Service"]
        SAFETY["🚨 Safety Service"]
    end

    subgraph NLP["🧠 NLP Layer (Non-LLM)"]
        PREPROCESS["📝 Text Preprocessing"]
        EMOTION["😊 Emotion Analysis"]
        LINGUISTIC["📊 Linguistic Features"]
        TRIGGER["🎯 Trigger Extraction"]
    end

    subgraph Intelligence["📈 Intelligence Layer"]
        TREND["📉 Trend Engine"]
        BASELINE["📊 User Baseline"]
        TRIGGERMAP["🗺️ Trigger Mapper"]
        INSIGHTGEN["💬 Insight Generator"]
    end

    subgraph LLM["🤖 LLM Layer (Guarded)"]
        PROMPT["📋 Prompt Builder"]
        REFLECT["🪞 Reflection Generator"]
        FILTER["🛡️ Output Filter"]
    end

    subgraph Database["🗄️ Database (PostgreSQL)"]
        DB[(PostgreSQL)]
    end

    subgraph External["☁️ External Services"]
        OPENAI["OpenAI API<br/>(or Gemini)"]
    end

    WEB --> PAGES
    PAGES --> COMPONENTS
    COMPONENTS --> STATE
    STATE --> API

    API --> AUTH
    API --> JOURNAL
    API --> INSIGHT
    API --> SAFETY

    JOURNAL --> PREPROCESS
    PREPROCESS --> EMOTION
    PREPROCESS --> LINGUISTIC
    EMOTION --> TRIGGER
    LINGUISTIC --> TRIGGER

    TRIGGER --> TREND
    TREND --> BASELINE
    BASELINE --> TRIGGERMAP
    TRIGGERMAP --> INSIGHTGEN

    INSIGHTGEN --> PROMPT
    PROMPT --> REFLECT
    REFLECT --> FILTER

    SAFETY -.->|Crisis Detected| FILTER

    JOURNAL --> DB
    EMOTION --> DB
    TRIGGER --> DB
    TREND --> DB
    INSIGHTGEN --> DB

    REFLECT --> OPENAI
    OPENAI --> FILTER
    FILTER --> API
```

---

## 🔄 Data Flow Diagram

```mermaid
flowchart LR
    subgraph Input["📥 Input"]
        USER["👤 User"]
        TEXT["📝 Journal Text"]
    end

    subgraph Processing["⚙️ Processing"]
        direction TB
        NLP["🧠 NLP Analysis<br/>(Non-LLM)"]
        TREND["📈 Trend Engine"]
        INSIGHT["💡 Insight Generator<br/>(Deterministic)"]
        LLM["🤖 LLM Reflection<br/>(Guarded)"]
    end

    subgraph Output["📤 Output"]
        DASH["📊 Dashboard"]
        REFLECT["🪞 Reflection"]
        ALERT["🔔 Gentle Alert"]
    end

    USER -->|writes| TEXT
    TEXT --> NLP
    NLP -->|features| TREND
    TREND -->|patterns| INSIGHT
    INSIGHT -->|reflection points| LLM
    
    NLP -->|snapshot| DASH
    TREND -->|trends| DASH
    INSIGHT -->|insights| DASH
    LLM -->|reflection| REFLECT
    TREND -.->|pattern detected| ALERT
```

---

## 🧩 Component Architecture

### Frontend Components

```mermaid
flowchart TB
    subgraph Pages["📄 Pages"]
        HOME["🏠 Home"]
        JOURNAL["📝 Journal"]
        DASHBOARD["📊 Dashboard"]
        PROFILE["👤 Profile"]
        CRISIS["🚨 Crisis (Static)"]
    end

    subgraph Shared["🧩 Shared Components"]
        NAV["🧭 Navigation"]
        CARD["🃏 Card"]
        CHART["📈 Chart"]
        INPUT["✏️ Text Input"]
        BUTTON["🔘 Button"]
        MODAL["💬 Modal"]
    end

    subgraph Features["✨ Feature Components"]
        JOURNALFORM["📝 JournalForm"]
        TRENDCHART["📈 TrendChart"]
        TRIGGERMAP["🗺️ TriggerMap"]
        REFLECTION["🪞 ReflectionCard"]
        ENTRYLIST["📋 EntryList"]
    end

    HOME --> NAV
    JOURNAL --> NAV
    JOURNAL --> JOURNALFORM
    JOURNAL --> ENTRYLIST
    DASHBOARD --> NAV
    DASHBOARD --> TRENDCHART
    DASHBOARD --> TRIGGERMAP
    DASHBOARD --> REFLECTION
    PROFILE --> NAV
```

---

### Backend Services

```mermaid
flowchart TB
    subgraph API["🔗 API Layer"]
        AUTH_API["/api/auth"]
        JOURNAL_API["/api/journal"]
        INSIGHT_API["/api/insights"]
        USER_API["/api/users"]
    end

    subgraph Services["⚙️ Services"]
        AUTH_SVC["AuthService"]
        JOURNAL_SVC["JournalService"]
        NLP_SVC["NLPService"]
        TREND_SVC["TrendService"]
        INSIGHT_SVC["InsightService"]
        LLM_SVC["LLMService"]
        SAFETY_SVC["SafetyService"]
    end

    subgraph Repositories["🗄️ Repositories"]
        USER_REPO["UserRepository"]
        ENTRY_REPO["EntryRepository"]
        ANALYSIS_REPO["AnalysisRepository"]
        TRIGGER_REPO["TriggerRepository"]
    end

    AUTH_API --> AUTH_SVC
    JOURNAL_API --> JOURNAL_SVC
    JOURNAL_API --> NLP_SVC
    INSIGHT_API --> TREND_SVC
    INSIGHT_API --> INSIGHT_SVC
    INSIGHT_API --> LLM_SVC
    USER_API --> AUTH_SVC

    JOURNAL_SVC --> SAFETY_SVC
    LLM_SVC --> SAFETY_SVC

    AUTH_SVC --> USER_REPO
    JOURNAL_SVC --> ENTRY_REPO
    NLP_SVC --> ANALYSIS_REPO
    TREND_SVC --> ANALYSIS_REPO
    INSIGHT_SVC --> TRIGGER_REPO
```

---

## 🧠 NLP Pipeline Detail

```mermaid
flowchart LR
    subgraph Input["📥 Input"]
        RAW["Raw Text"]
    end

    subgraph Preprocessing["📝 Preprocessing"]
        TOKENIZE["Tokenization"]
        SEGMENT["Sentence Segmentation"]
        CLEAN["Text Cleaning"]
    end

    subgraph Analysis["🔬 Analysis"]
        SENTIMENT["Sentiment Analysis<br/>(-1 to 1)"]
        EMOTION["Emotion Classification<br/>(calm/tense/sad)"]
    end

    subgraph Features["📊 Feature Extraction"]
        SENT_LEN["Sentence Length"]
        MODAL["Modal Verbs<br/>(ต้อง, ควร)"]
        NEGATION["Negation Count"]
        PRONOUN["First-Person Ratio"]
        VOCAB["Vocabulary Repetition"]
    end

    subgraph Output["📤 Output"]
        SNAPSHOT["Analysis Snapshot<br/>(JSON)"]
    end

    RAW --> TOKENIZE
    TOKENIZE --> SEGMENT
    SEGMENT --> CLEAN

    CLEAN --> SENTIMENT
    CLEAN --> EMOTION
    CLEAN --> SENT_LEN
    CLEAN --> MODAL
    CLEAN --> NEGATION
    CLEAN --> PRONOUN
    CLEAN --> VOCAB

    SENTIMENT --> SNAPSHOT
    EMOTION --> SNAPSHOT
    SENT_LEN --> SNAPSHOT
    MODAL --> SNAPSHOT
    NEGATION --> SNAPSHOT
    PRONOUN --> SNAPSHOT
    VOCAB --> SNAPSHOT
```

---

## 🚨 Safety Flow

```mermaid
flowchart TB
    INPUT["📝 User Input"]
    
    subgraph Safety["🚨 Safety Check"]
        KEYWORD["Keyword Detection"]
        PATTERN["Pattern Matching"]
        DECISION{Crisis<br/>Detected?}
    end

    subgraph Normal["✅ Normal Flow"]
        NLP["NLP Pipeline"]
        LLM["LLM Reflection"]
        DASHBOARD["Dashboard"]
    end

    subgraph Crisis["🆘 Crisis Flow"]
        DISABLE["Disable LLM"]
        STATIC["Static Safe Message"]
        HOTLINE["Show Hotline Info<br/>1323"]
    end

    INPUT --> KEYWORD
    KEYWORD --> PATTERN
    PATTERN --> DECISION

    DECISION -->|No| NLP
    NLP --> LLM
    LLM --> DASHBOARD

    DECISION -->|Yes| DISABLE
    DISABLE --> STATIC
    STATIC --> HOTLINE

    style Crisis fill:#ffcccc
    style HOTLINE fill:#ff9999
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant DB as Database

    U->>F: Enter email/password
    F->>A: POST /api/auth/login
    A->>DB: Verify credentials
    DB-->>A: User data
    A-->>F: JWT Token + User info
    F->>F: Store token (httpOnly cookie)
    F-->>U: Redirect to Dashboard

    Note over F,A: Subsequent requests
    F->>A: API Request + JWT
    A->>A: Verify JWT
    A-->>F: Protected data
```

---

## 📦 Deployment Architecture

```mermaid
flowchart TB
    subgraph Users["👥 Users"]
        BROWSER["🌐 Browser"]
    end

    subgraph Vercel["☁️ Vercel"]
        NEXTJS["Next.js<br/>(Frontend + API Routes)"]
    end

    subgraph Railway["🚂 Railway / Render"]
        FASTAPI["FastAPI<br/>(Backend)"]
    end

    subgraph Managed["🗄️ Managed Services"]
        POSTGRES["PostgreSQL<br/>(Neon / Supabase)"]
    end

    subgraph External["☁️ External APIs"]
        OPENAI["OpenAI API"]
    end

    BROWSER --> NEXTJS
    NEXTJS --> FASTAPI
    FASTAPI --> POSTGRES
    FASTAPI --> OPENAI
```

---

## 🔑 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Separate NLP from LLM** | NLP ให้ผลที่อธิบายได้ / LLM ใช้แค่สะท้อน |
| **Trend-based, not state-based** | ไม่ตัดสินสถานะปัจจุบัน แค่ดูแนวโน้ม |
| **User baseline comparison** | เปรียบเทียบกับตัวเอง ไม่ใช่คนอื่น |
| **Safety-first architecture** | เช็ค crisis ก่อน LLM เสมอ |
| **Deterministic insight first** | สร้าง insight จาก rules ก่อนส่งให้ LLM |

---

## 📐 API Endpoints (MVP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ |
| POST | `/api/auth/logout` | ออกจากระบบ |
| GET | `/api/journal` | ดึง journal entries |
| POST | `/api/journal` | สร้าง journal entry |
| GET | `/api/journal/:id` | ดึง entry เฉพาะ |
| DELETE | `/api/journal/:id` | ลบ entry |
| GET | `/api/insights/trends` | ดึงแนวโน้ม |
| GET | `/api/insights/triggers` | ดึง trigger map |
| GET | `/api/insights/reflection` | ดึง AI reflection |
| GET | `/api/users/me` | ข้อมูล user |
| PATCH | `/api/users/me` | อัปเดต profile |
| DELETE | `/api/users/me` | ลบ account |
