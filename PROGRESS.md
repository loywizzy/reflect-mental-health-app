# 📊 PROGRESS.md
## Mental Health AI Web App (Reflect)

ไฟล์นี้ใช้ track ความคืบหน้าของโปรเจค  
อัปเดตทุกครั้งที่ทำงานเสร็จแต่ละ task/phase

---

## 🎯 สถานะปัจจุบัน

| สถานะ | ความหมาย |
|-------|----------|
| ⬜ | ยังไม่เริ่ม |
| 🟡 | กำลังทำ |
| ✅ | เสร็จแล้ว |
| ⏸️ | พักไว้ก่อน |

---

## 📅 Last Updated
**2026-02-02** — สร้าง Frontend MVP ครบทุกหน้า (Home, Journal, Dashboard, Profile, Crisis)

---

## 🟢 PHASE 0: Project Foundation ✅

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| เขียน Project Manifesto | ✅ | README.md |
| กำหนด Non-goals | ✅ | README.md |
| ระบุ target persona | ✅ | student / worker / teen |
| นิยาม success criteria | ✅ | README.md |

**Deliverables:**
- [x] README.md (draft)
- [x] Scope definition

---

## 🟢 PHASE 1: UX & Feature Lock ✅

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| วาด wireframe หลัก (Home / Journal / Insight) | ✅ | docs/wireframes/WIREFRAMES.md |
| เลือก MVP features | ✅ | README.md |
| ตัด feature ที่ไม่จำเป็น | ✅ | |

**Deliverables:**
- [x] Wireframe (text-based)
- [x] Feature list (locked)

---

## 🟢 PHASE 2: System & Data Design ✅

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| ออกแบบ database schema | ✅ | docs/architecture/DATABASE_SCHEMA.md |
| นิยาม data pipeline | ✅ | TECH_STACK.md |
| วาด architecture diagram | ✅ | docs/architecture/ARCHITECTURE.md |
| สร้างโครงสร้างโฟลเดอร์ | ✅ | |

**Deliverables:**
- [x] ER diagram
- [x] Architecture diagram
- [x] TECH_STACK.md
- [x] Folder structure

---

## 🟢 PHASE 3: NLP & Feature Extraction ⬜

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| Text preprocessing | ⬜ | |
| Emotion / sentiment analysis | ⬜ | |
| Linguistic feature extraction | ⬜ | |
| Store analysis snapshot | ⬜ | |

**Deliverables:**
- [ ] NLP pipeline
- [ ] Feature extraction module
- [ ] Sample output JSON

---

## 🟢 PHASE 4: Trend & Trigger Engine ⬜

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| Rolling window analysis | ⬜ | |
| Baseline per user | ⬜ | |
| Delta / anomaly detection | ⬜ | |
| Trigger-topic correlation | ⬜ | |

**Deliverables:**
- [ ] Trend scoring logic
- [ ] Trigger map data structure
- [ ] Rule definitions

---

## 🟢 PHASE 5: Insight Generation ⬜

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| Insight template design | ⬜ | |
| Mapping rules → text insight | ⬜ | |
| Persona-based phrasing | ⬜ | |

**Deliverables:**
- [ ] Insight text generator
- [ ] Example insights

---

## 🟢 PHASE 6: LLM Reflection Layer ⬜

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| เขียน system prompt | ⬜ | |
| จำกัด input ให้ LLM | ⬜ | |
| Post-process output | ⬜ | |
| Persona tone adjustment | ⬜ | |

**Deliverables:**
- [ ] LLM prompt spec
- [ ] Reflection response examples

---

## 🟢 PHASE 7: Safety & Crisis Handling ⬜

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| Crisis keyword detection | ⬜ | |
| Disable LLM เมื่อพบความเสี่ยง | ⬜ | |
| Static safe response | ⬜ | |
| Disclaimer & consent flow | ⬜ | |

**Deliverables:**
- [ ] Safety flow diagram
- [ ] Crisis response copy

---

## 🟢 PHASE 8: Frontend Integration 🟡

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| Journal UI | ✅ | src/app/journal/page.tsx |
| Insight dashboard | ✅ | src/app/dashboard/page.tsx |
| Trigger visualization | ✅ | อยู่ใน dashboard |
| Gentle alert UX | ✅ | src/app/crisis/page.tsx |
| Setup Next.js | ✅ | TypeScript + Tailwind |
| Mock data | ✅ | src/data/mockData.ts |

**Deliverables:**
- [x] Working web app (beta) — http://localhost:3000
- [ ] Deployed preview

---

## 🟢 PHASE 9: Testing & Hardening ⬜

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| Unit tests (trend / trigger) | ⬜ | |
| Edge case testing | ⬜ | |
| Safety testing | ⬜ | |
| UX copy refinement | ⬜ | |

**Deliverables:**
- [ ] Test report
- [ ] Bug fixes

---

## 🟢 PHASE 10: Story, Demo & Documentation ⬜

| Task | สถานะ | หมายเหตุ |
|------|-------|----------|
| Case study (3 persona) | ⬜ | |
| Demo script (5 นาที) | ⬜ | |
| Ethical note | ⬜ | |
| Final README | ⬜ | |

**Deliverables:**
- [ ] Slide deck
- [ ] Demo-ready system
- [ ] Documentation complete

---

## 📝 Notes / Blockers

_เพิ่ม note หรือ blockers ที่พบระหว่างทำงานที่นี่_

---

## 🧠 Guiding Principle

> Build slow thinking systems  
> Use AI humbly  
> Let humans stay in control
