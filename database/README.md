# 🗄️ database/

Database Scripts & Migrations

## Tech Stack
- PostgreSQL

## โครงสร้าง
```
database/
├── migrations/   # Schema migrations (Alembic)
└── seeds/        # Seed data for development
```

## Core Tables (Phase 2)
- `users` — ข้อมูลผู้ใช้
- `journal_entries` — บันทึก journal
- `analysis_snapshots` — ผลวิเคราะห์แต่ละ entry
- `daily_summaries` — สรุปรายวัน
- `trigger_stats` — สถิติ triggers

## Design Principles
- ❌ No medical labels
- ✅ Store features, not conclusions
- ✅ Time-series friendly schema
- ✅ User owns and can delete all data
