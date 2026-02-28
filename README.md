# Reflect — Mental Health AI Web App

> **AI สะท้อน ไม่ตัดสิน** — เข้าใจตัวเองมากขึ้นจากแนวโน้มของภาษาและประสบการณ์

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## 📖 Overview

Reflect เป็น mental health web app ที่ช่วยให้ผู้ใช้เข้าใจตัวเองผ่านการวิเคราะห์แนวโน้มของภาษาและอารมณ์ โดยไม่วินิจฉัยโรค แต่เน้นการสะท้อนและเติบโต

### Core Principles
- ✅ **ไม่วินิจฉัย** — ไม่มีการติดป้ายทางการแพทย์
- ✅ **อธิบายได้** — ทุก insight มาจากข้อมูลที่มองเห็นได้
- ✅ **Privacy-first** — ข้อมูลเป็นของคุณ ควบคุมและลบได้ทุกเมื่อ
- ✅ **Safety-first** — Crisis detection ก่อนการประมวลผล AI

---

## 🚀 Features

| Feature | รายละเอียด |
|---------|-----------|
| 📝 **Journal** | เขียนบันทึกได้อิสระ ไม่มีคำถามบังคับ |
| 📊 **Language Drift** | วิเคราะห์การเปลี่ยนแปลงของภาษา (ความยาวประโยค, คำบ่งบอกแรงกดดัน) |
| 🎯 **Trigger Map** | แสดงความเชื่อมโยงระหว่างหัวข้อกับแนวโน้มอารมณ์ |
| 💡 **AI Reflection** | AI สะท้อนและตั้งคำถามปลายเปิด โดยใช้ Gemini API |
| 💬 **Interactive Chat** | พูดคุยโต้ตอบกับ AI เพื่อสำรวจความคิดและอารมณ์ |
| 🛡️ **Crisis Detection** | ตรวจจับคำสำคัญวิกฤต redirect ไปหน้าช่วยเหลือ |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** (Sage Green palette)
- **Recharts** (Data visualization)

### Backend
- **FastAPI** (Python 3.12)
- **PostgreSQL** (Database)
- **SQLAlchemy** (ORM)
- **PyThaiNLP** (Thai NLP)
- **Google Gemini API** (LLM for Reflection & Chat)

### NLP & AI Pipeline
- **Rule-based sentiment analysis** (Thai lexicon)
- **Linguistic feature extraction** (sentence length, modal verbs, negation)
- **Crisis keyword detection** (safety-first)
- **LLM Integration** (Gemini API for context-aware reflection)

---

## ⚡ Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/reflect-mental-health-app.git
cd reflect-mental-health-app
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database and GEMINI_API_KEY

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📁 Project Structure

```
reflect-mental-health-app/
├── backend/
│   ├── app/
│   │   ├── api/          # API routers (auth, journal, insights, users)
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── nlp/          # NLP pipeline (5 modules)
│   ├── database/
│   │   ├── migrations/   # SQL migrations
│   │   └── seeds/        # Sample data
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages (App Router)
│   │   ├── components/   # React components
│   │   ├── lib/          # API client, auth, utils
│   │   └── data/         # Mock data
│   └── package.json
├── docs/                 # Documentation
└── README.md
```

---

## 🧪 Testing

### Backend
```bash
cd backend
pytest
```

### NLP Pipeline Test
```bash
cd backend
source venv/bin/activate
python -c "
from app.nlp import analyze_text
result = analyze_text('วันนี้เครียดมาก ต้องทำงานเยอะ')
print(result)
"
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway/Render)
1. Connect GitHub repo
2. Set environment variables
3. Deploy

---

## ⚠️ Disclaimer

**Reflect ไม่ใช่เครื่องมือวินิจฉัยโรค** และไม่แทนที่ผู้เชี่ยวชาญด้านสุขภาพจิต

หากต้องการความช่วยเหลือเร่งด่วน กรุณาติดต่อ:
- **สายด่วนสุขภาพจิต**: 1323
- **สายด่วนป้องกันการฆ่าตัวตาย**: 1323

---

## 📄 License

MIT License - For educational/research/prototype use

---

## 👥 Contributing

This is a prototype project for educational purposes. Contributions are welcome!

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.
