# 📋 Project Status & Roadmap

## ✅ Completed (Phase 1-4)

### Phase 1: Foundation & Design
- [x] Project structure setup
- [x] Database schema design (PostgreSQL)
- [x] Wireframes & UI mockups
- [x] Tech stack selection

### Phase 2: Backend Core
- [x] FastAPI setup + CORS configuration
- [x] Database models (SQLAlchemy)
- [x] API endpoints:
  - [x] Authentication (`/auth/register`, `/auth/login`, `/auth/me`)
  - [x] Journal CRUD (`/journal`)
  - [x] Insights (`/insights/dashboard`, `/insights/triggers`)
  - [x] User management (`/users/me`, settings, export, delete)
- [x] JWT authentication
- [x] Database migrations + seed data

### Phase 3: NLP Pipeline & Frontend
- [x] Thai text preprocessor (PyThaiNLP + AttaCut)
- [x] Rule-based sentiment analyzer (lexicon-based)
- [x] Emotion detection (calm, tense, sad, happy)
- [x] Linguistic feature extraction
- [x] Crisis keyword detection (safety-first)
- [x] NLP service integration
- [x] `/journal/analyze` endpoint (preview mode)
- [x] Next.js setup (App Router, TypeScript)
- [x] API client + Auth context
- [x] Pages: Home, Journal, Dashboard, Profile
- [x] Crisis redirect flow
- [x] Responsive design (Tailwind CSS)

### Phase 4: Database & Integration
- [x] PostgreSQL installation & configuration
- [x] Run migrations (001 + 002)
- [x] Database connection verified
- [x] Backend + Frontend running together

### Phase 5: LLM Integration (AI Reflection)
- [x] Gemini API provider setup
- [x] Prompt templates (Thai, persona-aware)
- [x] Safety guardrails (content filtering)
- [x] `/reflections` API endpoints (generate + get)
- [x] Reflection component in Frontend
- [x] End-to-end testing with real Gemini API

---

## ✅ Phase 7: Security + UX (เสร็จแล้ว)

### 🛡️ Security
- [x] Rate limiting (`slowapi`) — login 5/min, register 3/min
- [x] CORS fix — `allowed_origins` list แทน `"*"`
- [x] Input validation — journal content max 5,000 chars
- [x] Gemini API quota guard — in-memory counter + warning at 90%

### 🏷️ UX — Dashboard
- [x] **Language Drift** — เปลี่ยนเป็นประโยคภาษาคน (เช่น "คุณใช้คำ 'ต้อง' บ่อยขึ้น อาจมีแรงกดดัน")
- [x] **Baseline badge** — "ช่วงนี้รู้สึกดีกว่าปกติ 😊" + ปุ่ม ℹ️ อธิบาย baseline
- [x] **Baseline reference line** — เส้น "ปกติของคุณ" บน mood chart
- [x] **Journal sentiment** — แสดงเป็น "😊 รู้สึกดี" แทนตัวเลข -0.3
- [x] **Character counter** — 0/5000 ใน journal write area

### 🌐 Multi-language
- [x] Navigation มีปุ่ม TH/EN toggle อยู่แล้ว
- [x] เพิ่ม keys ที่ขาดใน `th.ts` + `en.ts` (noEntries, history, weeklyView, monthlyView)
- [x] แปล section titles ให้เป็นภาษาไทย (languageDrift, triggerMap, insights)

### 📈 Trend Improvements
- [x] **7 วัน / 30 วัน toggle** — กดเปลี่ยน period ได้ในหน้า Dashboard
- [x] **Emotion distribution donut chart** — แสดงสัดส่วนอารมณ์ในช่วงที่เลือก
- [x] แสดงจำนวนวันที่มีข้อมูลจริงใน header

### 📄 Export PDF (ทำทีหลัง)
- [ ] ติดตั้ง `jsPDF` + `html2canvas` ใน frontend
- [ ] Export journal + charts เป็น PDF 1 หน้า
- [ ] ~~Email notifications~~ — **ตัดออก**

---

## 🚀 Deployment
- [ ] Backend deploy (Railway/Render)
- [ ] Frontend deploy (Vercel)
- [ ] Production environment variables (`.env.production`)
- [ ] API health monitoring

---

## 📊 Progress Overview

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1–3 | ✅ Complete | 100% |
| Phase 4 | ✅ Complete | 100% |
| Phase 5 (LLM) | ✅ Complete | 100% |
| Phase 6 (Chat + Baseline BE) | ✅ Complete | 100% |
| Phase 7 (Security + UX) | ✅ Complete | 100% |
| Deployment | 📅 Planned | 0% |

**Overall Progress: ~95%** 🎉
