# 🔌 backend/

Python FastAPI Backend

## Tech Stack
- Python 3.11+
- FastAPI
- SQLAlchemy
- PostgreSQL

## โครงสร้าง
```
backend/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Config, security, dependencies
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   └── services/     # Business logic
└── tests/            # Unit & integration tests
```

## Responsibilities
- Authentication (Auth.js / NextAuth)
- Journal CRUD
- Orchestrate NLP pipeline
- Store analysis snapshots
- Serve insight data to frontend
- Call LLM reflection service

## การ Setup (Phase 8)
```bash
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary
```
