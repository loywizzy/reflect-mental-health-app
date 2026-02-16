# 🧭 PHASE.md
## Mental Health AI Web App (Reflect)

เอกสารนี้อธิบาย **Phase การพัฒนาโปรเจกต์ตั้งแต่ 0 → Done**  
โดยเน้นความปลอดภัย, อธิบายได้, และเหมาะกับ Solo Dev / Small Team

---

## 🟢 PHASE 0: Project Foundation

### Goal
ตั้งกรอบความคิดและขอบเขตของระบบให้ชัด  
ป้องกัน feature creep และความเสี่ยงด้านจริยธรรม

### Tasks
- เขียน Project Manifesto
- กำหนด Non-goals ชัดเจน
- ระบุ target persona (student / worker / teen)
- นิยาม success criteria

### Deliverables
- README.md (draft)
- Scope definition

### Exit Criteria
- ทุกคน (หรือ AI agent) อธิบายได้ว่า
  - ระบบนี้ **ไม่ใช่อะไร**
  - ระบบนี้ **ช่วยอะไร**

---

## 🟢 PHASE 1: UX & Feature Lock

### Goal
ล็อก feature ที่จะทำใน MVP  
UX ต้องมาก่อน logic

### Tasks
- วาด wireframe หลัก (Home / Journal / Insight)
- เลือก MVP features:
  - Journal input
  - Language drift insight
  - Trigger map
  - AI reflection
- ตัด feature ที่ไม่จำเป็น

### Deliverables
- Wireframe (text / Figma)
- Feature list (locked)

### Exit Criteria
- ไม่มี feature ใหม่เพิ่มใน MVP
- UX flow เดินได้ตั้งแต่เขียน → เห็น insight

---

## 🟢 PHASE 2: System & Data Design

### Goal
ออกแบบโครงสร้างข้อมูลและ flow ก่อนเขียนโค้ด

### Tasks
- ออกแบบ database schema
- นิยาม data pipeline:
  - text → features → trend → insight
- วาด architecture diagram

### Deliverables
- ER diagram
- Architecture diagram
- TECH_STACK.md

### Exit Criteria
- รู้ว่าข้อมูลไหลยังไง
- ไม่มี field ที่เป็น medical label

---

## 🟢 PHASE 3: NLP & Feature Extraction (Non-LLM)

### Goal
สร้างชั้นวิเคราะห์ข้อความแบบอธิบายได้

### Tasks
- Text preprocessing
- Emotion / sentiment analysis
- Linguistic feature extraction:
  - sentence length
  - modal verbs
  - negation
  - pronoun usage
- Store analysis snapshot

### Deliverables
- NLP pipeline
- Feature extraction module
- Sample output JSON

### Exit Criteria
- ข้อความเดียว → ได้ feature ที่ stable และ repeatable
- ไม่ใช้ LLM ใน phase นี้

---

## 🟢 PHASE 4: Trend & Trigger Engine

### Goal
สร้าง “สมอง” ของระบบ  
วิเคราะห์แนวโน้มโดยไม่ทำนายโรค

### Tasks
- Rolling window analysis
- Baseline per user
- Delta / anomaly detection
- Trigger-topic correlation

### Deliverables
- Trend scoring logic
- Trigger map data structure
- Rule definitions

### Exit Criteria
- Insight ทุกอันอธิบายที่มาได้
- เปรียบเทียบกับ “ตัวเองในอดีต” เท่านั้น

---

## 🟢 PHASE 5: Insight Generation (Deterministic)

### Goal
แปลงข้อมูลเป็น insight ที่เป็นภาษามนุษย์  
โดยไม่ใช้ LLM

### Tasks
- Insight template design
- Mapping rules → text insight
- Persona-based phrasing (student / worker / teen)

### Deliverables
- Insight text generator
- Example insights

### Exit Criteria
- Insight อ่านแล้วไม่รู้สึกถูกตัดสิน
- ไม่มีศัพท์ทางการแพทย์

---

## 🟢 PHASE 6: LLM Reflection Layer (Guarded)

### Goal
ใช้ LLM เพื่อ “สะท้อนใจ” อย่างปลอดภัย

### Tasks
- เขียน system prompt แบบ reflection-only
- จำกัด input ให้ LLM
- Post-process output (language filter)
- Persona tone adjustment

### Deliverables
- LLM prompt spec
- Reflection response examples

### Exit Criteria
- LLM ไม่ตัดสิน mental state
- LLM ไม่ให้คำแนะนำเชิงแพทย์

---

## 🟢 PHASE 7: Safety & Crisis Handling

### Goal
ป้องกัน worst-case scenario

### Tasks
- Crisis keyword detection
- Disable LLM เมื่อพบความเสี่ยง
- Static safe response
- Disclaimer & consent flow

### Deliverables
- Safety flow diagram
- Crisis response copy

### Exit Criteria
- ระบบ fail-safe
- ไม่มี LLM improvisation ใน crisis

---

## 🟢 PHASE 8: Frontend Integration

### Goal
รวมทุกอย่างเป็น web app ที่ใช้งานได้จริง

### Tasks
- Journal UI
- Insight dashboard
- Trigger visualization
- Gentle alert UX

### Deliverables
- Working web app (beta)
- Deployed preview

### Exit Criteria
- User ใช้ได้ end-to-end
- ไม่มี dead-end UX

---

## 🟢 PHASE 9: Testing & Hardening

### Goal
ทำให้ระบบเสถียรและปลอดภัยพอสำหรับ demo

### Tasks
- Unit tests (trend / trigger)
- Edge case testing
- Safety testing
- UX copy refinement

### Deliverables
- Test report
- Bug fixes

### Exit Criteria
- ไม่มี critical bug
- Insight ไม่ misleading

---

## 🟢 PHASE 10: Story, Demo & Documentation

### Goal
ทำให้คนอื่น “เข้าใจและเชื่อ” ในระบบ

### Tasks
- Case study (3 persona)
- Demo script (5 นาที)
- Ethical note
- Final README

### Deliverables
- Slide deck
- Demo-ready system
- Documentation complete

### Exit Criteria
- อธิบายโปรเจกต์จบใน 5 นาที
- ตอบคำถามเรื่อง ethics ได้

---

## ✅ Definition of DONE

- ระบบใช้งานได้จริง
- AI ไม่อันตราย
- Insight อธิบายได้
- ผู้ใช้รู้สึกเข้าใจตัวเองมากขึ้น
- พร้อมใช้เป็น portfolio / thesis / demo

---

## 🧠 Guiding Principle

> Build slow thinking systems  
> Use AI humbly  
> Let humans stay in control
