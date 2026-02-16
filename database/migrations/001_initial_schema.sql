-- ============================================================
-- Reflect Mental Health AI Web App
-- Database Schema - PostgreSQL
-- ============================================================
-- Version: 1.0.0
-- Created: 2026-02-02
-- Description: Complete database schema for Reflect app
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE persona_type AS ENUM ('student', 'worker', 'teen');
CREATE TYPE emotion_type AS ENUM ('calm', 'tense', 'sad', 'happy', 'neutral');
CREATE TYPE trigger_category AS ENUM ('work', 'study', 'relationship', 'health', 'family', 'finance', 'self-care', 'other');
CREATE TYPE language_type AS ENUM ('th', 'en');
CREATE TYPE theme_type AS ENUM ('light', 'dark');

-- ============================================================
-- TABLE: users
-- ============================================================
-- ข้อมูลผู้ใช้พื้นฐาน

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    persona persona_type DEFAULT 'worker',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookup
CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'ข้อมูลผู้ใช้พื้นฐาน';
COMMENT ON COLUMN users.persona IS 'กำหนด tone ของ AI: student, worker, teen';

-- ============================================================
-- TABLE: user_settings
-- ============================================================
-- การตั้งค่าของผู้ใช้

CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    language language_type DEFAULT 'th',
    theme theme_type DEFAULT 'light',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

COMMENT ON TABLE user_settings IS 'การตั้งค่าของผู้ใช้';

-- ============================================================
-- TABLE: journal_entries
-- ============================================================
-- บันทึก journal ของผู้ใช้

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);

COMMENT ON TABLE journal_entries IS 'บันทึก journal ของผู้ใช้';
COMMENT ON COLUMN journal_entries.content IS 'เนื้อหา journal ที่ผู้ใช้เขียน';

-- ============================================================
-- TABLE: analysis_snapshots
-- ============================================================
-- ผลวิเคราะห์ NLP ของแต่ละ entry (Non-LLM)
-- ❗ ไม่มี field ที่เป็น medical label

CREATE TABLE analysis_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    
    -- Sentiment & Emotion
    sentiment_score FLOAT CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    emotion_vector JSONB, -- {"calm": 0.3, "tense": 0.5, ...}
    dominant_emotion emotion_type,
    
    -- Linguistic Features (Language Drift)
    avg_sentence_length FLOAT,
    sentence_length_variance FLOAT,
    modal_verb_count INTEGER DEFAULT 0,
    negation_count INTEGER DEFAULT 0,
    first_person_ratio FLOAT CHECK (first_person_ratio >= 0 AND first_person_ratio <= 1),
    vocabulary_repetition FLOAT CHECK (vocabulary_repetition >= 0 AND vocabulary_repetition <= 1),
    
    -- Raw data
    word_count INTEGER,
    sentence_count INTEGER,
    raw_features JSONB, -- ข้อมูล features ดิบทั้งหมด
    
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(entry_id)
);

CREATE INDEX idx_analysis_snapshots_entry_id ON analysis_snapshots(entry_id);
CREATE INDEX idx_analysis_snapshots_analyzed_at ON analysis_snapshots(analyzed_at);

COMMENT ON TABLE analysis_snapshots IS 'ผลวิเคราะห์ NLP ของแต่ละ entry (Non-LLM) - ไม่มี medical labels';
COMMENT ON COLUMN analysis_snapshots.sentiment_score IS 'คะแนน sentiment: -1 (negative) ถึง 1 (positive)';
COMMENT ON COLUMN analysis_snapshots.emotion_vector IS 'Vector อารมณ์: {"calm": 0.3, "tense": 0.5, ...}';

-- ============================================================
-- TABLE: triggers
-- ============================================================
-- รายการ triggers/หัวข้อที่ระบบรู้จัก

CREATE TABLE triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    name_th VARCHAR(100), -- ชื่อภาษาไทย
    category trigger_category DEFAULT 'other',
    is_system BOOLEAN DEFAULT FALSE, -- true = system-defined, false = user-defined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_triggers_category ON triggers(category);
CREATE INDEX idx_triggers_name ON triggers(name);

COMMENT ON TABLE triggers IS 'รายการ triggers/หัวข้อที่ระบบรู้จัก';

-- Insert default triggers
INSERT INTO triggers (name, name_th, category, is_system) VALUES
    ('work', 'งาน', 'work', TRUE),
    ('deadline', 'เดดไลน์', 'work', TRUE),
    ('boss', 'หัวหน้า', 'work', TRUE),
    ('meeting', 'ประชุม', 'work', TRUE),
    ('study', 'เรียน', 'study', TRUE),
    ('exam', 'สอบ', 'study', TRUE),
    ('homework', 'การบ้าน', 'study', TRUE),
    ('relationship', 'ความสัมพันธ์', 'relationship', TRUE),
    ('friend', 'เพื่อน', 'relationship', TRUE),
    ('family', 'ครอบครัว', 'family', TRUE),
    ('parents', 'พ่อแม่', 'family', TRUE),
    ('health', 'สุขภาพ', 'health', TRUE),
    ('sleep', 'นอน', 'health', TRUE),
    ('tired', 'เหนื่อย', 'health', TRUE),
    ('money', 'เงิน', 'finance', TRUE),
    ('expense', 'ค่าใช้จ่าย', 'finance', TRUE),
    ('rest', 'พักผ่อน', 'self-care', TRUE),
    ('exercise', 'ออกกำลังกาย', 'self-care', TRUE),
    ('hobby', 'งานอดิเรก', 'self-care', TRUE),
    ('expectation', 'ความคาดหวัง', 'other', TRUE),
    ('pressure', 'แรงกดดัน', 'other', TRUE),
    ('anxiety', 'กังวล', 'other', TRUE),
    ('stress', 'เครียด', 'other', TRUE);

-- ============================================================
-- TABLE: entry_triggers
-- ============================================================
-- Junction table: เชื่อม entry กับ triggers

CREATE TABLE entry_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    trigger_id UUID NOT NULL REFERENCES triggers(id) ON DELETE CASCADE,
    relevance_score FLOAT DEFAULT 1.0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    sentiment_context FLOAT CHECK (sentiment_context >= -1 AND sentiment_context <= 1),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(entry_id, trigger_id)
);

CREATE INDEX idx_entry_triggers_entry_id ON entry_triggers(entry_id);
CREATE INDEX idx_entry_triggers_trigger_id ON entry_triggers(trigger_id);

COMMENT ON TABLE entry_triggers IS 'เชื่อม entry กับ triggers ที่พบในข้อความ';
COMMENT ON COLUMN entry_triggers.relevance_score IS 'ความเกี่ยวข้อง 0-1';
COMMENT ON COLUMN entry_triggers.sentiment_context IS 'sentiment ขณะพูดถึง trigger นี้';

-- ============================================================
-- TABLE: trigger_stats
-- ============================================================
-- สถิติ triggers ต่อผู้ใช้ (สำหรับ Trigger Map)

CREATE TABLE trigger_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trigger_id UUID NOT NULL REFERENCES triggers(id) ON DELETE CASCADE,
    
    occurrence_count INTEGER DEFAULT 0,
    avg_sentiment FLOAT,
    sentiment_volatility FLOAT, -- ความผันผวนของ sentiment
    
    first_seen TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, trigger_id)
);

CREATE INDEX idx_trigger_stats_user_id ON trigger_stats(user_id);
CREATE INDEX idx_trigger_stats_user_trigger ON trigger_stats(user_id, trigger_id);

COMMENT ON TABLE trigger_stats IS 'สถิติ triggers ต่อผู้ใช้ สำหรับ Trigger Map';

-- ============================================================
-- TABLE: daily_summaries
-- ============================================================
-- สรุปรายวันสำหรับ dashboard

CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    
    -- Aggregated metrics
    entry_count INTEGER DEFAULT 0,
    avg_sentiment FLOAT,
    emotion_distribution JSONB, -- {"calm": 2, "tense": 3, ...}
    
    -- Language drift (delta from baseline)
    language_drift_delta JSONB, -- {"avg_sentence_length": -15, ...}
    
    -- Top triggers
    top_triggers JSONB, -- [{"trigger_id": "...", "count": 3, "sentiment": -0.4}, ...]
    
    -- Generated insight (deterministic, not LLM)
    generated_insight TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, summary_date)
);

CREATE INDEX idx_daily_summaries_user_id ON daily_summaries(user_id);
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date DESC);

COMMENT ON TABLE daily_summaries IS 'สรุปรายวันสำหรับ dashboard';

-- ============================================================
-- TABLE: user_baselines
-- ============================================================
-- Baseline ของแต่ละผู้ใช้ (สำหรับเปรียบเทียบ Language Drift)

CREATE TABLE user_baselines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Baseline metrics (rolling average)
    baseline_sentiment FLOAT,
    baseline_sentence_length FLOAT,
    baseline_modal_verb_ratio FLOAT,
    baseline_negation_ratio FLOAT,
    baseline_first_person_ratio FLOAT,
    
    -- Calculation metadata
    sample_count INTEGER DEFAULT 0, -- จำนวน entries ที่ใช้คำนวณ
    window_days INTEGER DEFAULT 30, -- ช่วงเวลาที่ใช้
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

CREATE INDEX idx_user_baselines_user_id ON user_baselines(user_id);

COMMENT ON TABLE user_baselines IS 'Baseline ของแต่ละผู้ใช้ สำหรับเปรียบเทียบ Language Drift';
COMMENT ON COLUMN user_baselines.window_days IS 'จำนวนวันที่ใช้ในการคำนวณ baseline (rolling window)';

-- ============================================================
-- TABLE: crisis_keywords
-- ============================================================
-- คำที่บ่งบอกถึง crisis (สำหรับ Safety Layer)

CREATE TABLE crisis_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword VARCHAR(100) NOT NULL,
    keyword_pattern VARCHAR(255), -- Regex pattern (optional)
    severity INTEGER DEFAULT 1 CHECK (severity >= 1 AND severity <= 3), -- 1=low, 2=medium, 3=high
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_crisis_keywords_active ON crisis_keywords(is_active);

COMMENT ON TABLE crisis_keywords IS 'คำที่บ่งบอกถึง crisis สำหรับ Safety Layer';

-- Insert default crisis keywords (Thai)
INSERT INTO crisis_keywords (keyword, severity, is_active) VALUES
    ('อยากตาย', 3, TRUE),
    ('ไม่อยากมีชีวิต', 3, TRUE),
    ('ฆ่าตัวตาย', 3, TRUE),
    ('ทำร้ายตัวเอง', 3, TRUE),
    ('กรีดแขน', 3, TRUE),
    ('ไม่ไหวแล้ว', 2, TRUE),
    ('หมดหวัง', 2, TRUE),
    ('ไม่มีใครเข้าใจ', 2, TRUE),
    ('อยู่คนเดียว', 1, TRUE),
    ('เหนื่อยมาก', 1, TRUE);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trigger_stats_updated_at
    BEFORE UPDATE ON trigger_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_baselines_updated_at
    BEFORE UPDATE ON user_baselines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS
-- ============================================================

-- View: User journal with analysis
CREATE VIEW v_journal_with_analysis AS
SELECT 
    j.id AS entry_id,
    j.user_id,
    j.content,
    j.entry_date,
    j.created_at,
    a.sentiment_score,
    a.dominant_emotion,
    a.avg_sentence_length,
    a.modal_verb_count,
    a.negation_count,
    a.word_count
FROM journal_entries j
LEFT JOIN analysis_snapshots a ON j.id = a.entry_id;

COMMENT ON VIEW v_journal_with_analysis IS 'Journal entries พร้อมผลวิเคราะห์';

-- View: User trigger summary
CREATE VIEW v_user_trigger_summary AS
SELECT 
    ts.user_id,
    t.name AS trigger_name,
    t.name_th AS trigger_name_th,
    t.category,
    ts.occurrence_count,
    ts.avg_sentiment,
    ts.sentiment_volatility,
    ts.last_seen
FROM trigger_stats ts
JOIN triggers t ON ts.trigger_id = t.id
ORDER BY ts.occurrence_count DESC;

COMMENT ON VIEW v_user_trigger_summary IS 'สรุป triggers ของแต่ละผู้ใช้';

-- ============================================================
-- NOTES
-- ============================================================
-- 
-- Design Principles:
-- ❌ No medical labels (เช่น depression_score, anxiety_level)
-- ✅ Store features, not conclusions
-- ✅ Time-series friendly
-- ✅ User data ownership (cascade delete)
-- ✅ Privacy-first
--
-- ============================================================
