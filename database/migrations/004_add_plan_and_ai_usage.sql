-- ============================================================
-- Reflect Mental Health AI Web App
-- Migration: 004_add_plan_and_ai_usage.sql
-- Description: Add PlanType to users and table for daily AI usage tracking
-- ============================================================

-- 1. Create PLAN_TYPE enum
CREATE TYPE plan_type AS ENUM ('free', 'pro', 'admin');

-- 2. Add plan column to users table
ALTER TABLE users ADD COLUMN plan plan_type DEFAULT 'free';

COMMENT ON COLUMN users.plan IS 'แผนการใช้งานของผู้ใช้: free, pro, admin';

-- 3. Create TABLE: user_ai_usage
-- ติดตามการใช้งาน AI รายวันต่อผู้ใช้

CREATE TABLE user_ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    call_count INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, usage_date)
);

-- Index for efficient lookup
CREATE INDEX idx_user_ai_usage_user_date ON user_ai_usage(user_id, usage_date DESC);

COMMENT ON TABLE user_ai_usage IS 'ข้อมูลการใช้งาน AI รายวันต่อผู้ใช้';
COMMENT ON COLUMN user_ai_usage.call_count IS 'จำนวนครั้งที่เรียกใช้ Gemini API ในวันที่ระบุ';

-- 4. Add updated_at trigger
CREATE TRIGGER update_user_ai_usage_updated_at
    BEFORE UPDATE ON user_ai_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
