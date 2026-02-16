-- ============================================================
-- Add Reflections Table for Phase 5
-- Gemini AI Reflections
-- ============================================================

CREATE TABLE IF NOT EXISTS reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Reflection content
    reflection_text TEXT NOT NULL,
    questions JSONB, -- Array of questions extracted from reflection
    
    -- Metadata
    persona persona_type NOT NULL,
    model_used VARCHAR(50) DEFAULT 'gemini-1.5-flash',
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    is_fallback BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
   -- One reflection per entry
    UNIQUE(entry_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_reflections_entry_id ON reflections(entry_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user_created ON reflections(user_id, created_at DESC);

COMMENT ON TABLE reflections IS 'AI-generated reflections สำหรับแต่ละ journal entry';
COMMENT ON COLUMN reflections.reflection_text IS 'ข้อความสะท้อนจาก AI';
COMMENT ON COLUMN reflections.questions IS 'คำถามปลายเปิดที่สกัดจาก reflection (JSON array)';
COMMENT ON COLUMN reflections.is_fallback IS 'true ถ้าใช้ fallback message (LLM failed or unsafe)';
