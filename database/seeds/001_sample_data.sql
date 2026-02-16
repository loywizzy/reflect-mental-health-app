-- ============================================================
-- Reflect Mental Health AI Web App
-- Seed Data for Development
-- ============================================================
-- Version: 1.0.0
-- Description: Sample data for testing and development
-- ============================================================

-- ============================================================
-- SAMPLE USER
-- ============================================================
-- Password: "password123" (hashed with bcrypt)

INSERT INTO users (id, email, password_hash, persona, is_active) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'demo@reflect.app', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3oP/stEF2W', 'worker', TRUE);

-- User settings
INSERT INTO user_settings (user_id, email_notifications, language, theme) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', TRUE, 'th', 'light');

-- ============================================================
-- SAMPLE JOURNAL ENTRIES (7 days)
-- ============================================================

INSERT INTO journal_entries (id, user_id, content, entry_date, created_at) VALUES
    -- Day 7 (oldest)
    ('11111111-1111-1111-1111-111111111111', 
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'รู้สึกเหนื่อยมาก งานสะสมมาหลายวัน ต้องทำให้เสร็จ ไม่รู้จะจัดการยังไง ไม่มีเวลาพักผ่อนเลย',
     CURRENT_DATE - INTERVAL '7 days',
     CURRENT_TIMESTAMP - INTERVAL '7 days'),

    -- Day 6
    ('22222222-2222-2222-2222-222222222222', 
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'วันนี้ทำงานเสร็จตามเป้า รู้สึกโอเค ไม่ได้มีอะไรพิเศษ กินข้าวกับเพื่อนตอนเที่ยง',
     CURRENT_DATE - INTERVAL '6 days',
     CURRENT_TIMESTAMP - INTERVAL '6 days'),

    -- Day 5
    ('33333333-3333-3333-3333-333333333333', 
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'ประชุมทั้งวัน เหนื่อยมาก หัวหน้าเรียกไปคุยเรื่องโปรเจค ต้องทำให้ดีกว่านี้ รู้สึกกดดัน',
     CURRENT_DATE - INTERVAL '5 days',
     CURRENT_TIMESTAMP - INTERVAL '5 days'),

    -- Day 4
    ('44444444-4444-4444-4444-444444444444', 
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'วันนี้พักผ่อนได้เต็มที่ ไปเดินเล่นกับเพื่อน รู้สึกดีขึ้นมาก ได้คุยเรื่องสนุกๆ ลืมเรื่องงานไปชั่วคราว',
     CURRENT_DATE - INTERVAL '4 days',
     CURRENT_TIMESTAMP - INTERVAL '4 days'),

    -- Day 3
    ('55555555-5555-5555-5555-555555555555', 
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'งานวันนี้หนักมาก deadline กระชั้นชิด ต้องทำให้เสร็จ ไม่รู้จะไหวไหม ไม่มีใครช่วย',
     CURRENT_DATE - INTERVAL '3 days',
     CURRENT_TIMESTAMP - INTERVAL '3 days'),

    -- Day 2
    ('66666666-6666-6666-6666-666666666666', 
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'ส่งงานเสร็จแล้ว โล่งใจมาก แต่ยังเหนื่ออยู่ ต้องพักผ่อนให้เต็มที่วันนี้',
     CURRENT_DATE - INTERVAL '2 days',
     CURRENT_TIMESTAMP - INTERVAL '2 days'),

    -- Day 1 (yesterday)
    ('77777777-7777-7777-7777-777777777777', 
     'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
     'วันนี้งานเยอะมาก ต้องทำให้เสร็จก่อน deadline รู้สึกกดดันมาก ไม่รู้จะไหวไหม',
     CURRENT_DATE - INTERVAL '1 day',
     CURRENT_TIMESTAMP - INTERVAL '1 day');

-- ============================================================
-- SAMPLE ANALYSIS SNAPSHOTS
-- ============================================================

INSERT INTO analysis_snapshots (entry_id, sentiment_score, dominant_emotion, emotion_vector, 
    avg_sentence_length, sentence_length_variance, modal_verb_count, negation_count, 
    first_person_ratio, vocabulary_repetition, word_count, sentence_count) VALUES
    
    ('11111111-1111-1111-1111-111111111111', -0.5, 'sad', 
     '{"calm": 0.1, "tense": 0.3, "sad": 0.5, "happy": 0.0, "neutral": 0.1}',
     12.5, 3.2, 2, 2, 0.15, 0.25, 45, 4),

    ('22222222-2222-2222-2222-222222222222', 0.1, 'neutral', 
     '{"calm": 0.3, "tense": 0.1, "sad": 0.1, "happy": 0.2, "neutral": 0.3}',
     14.0, 2.5, 0, 1, 0.10, 0.15, 28, 2),

    ('33333333-3333-3333-3333-333333333333', -0.3, 'tense', 
     '{"calm": 0.1, "tense": 0.4, "sad": 0.2, "happy": 0.0, "neutral": 0.3}',
     10.8, 4.1, 1, 0, 0.12, 0.20, 32, 3),

    ('44444444-4444-4444-4444-444444444444', 0.7, 'happy', 
     '{"calm": 0.3, "tense": 0.0, "sad": 0.0, "happy": 0.6, "neutral": 0.1}',
     15.5, 2.0, 0, 0, 0.08, 0.10, 35, 3),

    ('55555555-5555-5555-5555-555555555555', -0.5, 'tense', 
     '{"calm": 0.0, "tense": 0.5, "sad": 0.3, "happy": 0.0, "neutral": 0.2}',
     9.2, 3.8, 2, 3, 0.18, 0.30, 38, 4),

    ('66666666-6666-6666-6666-666666666666', 0.2, 'calm', 
     '{"calm": 0.4, "tense": 0.2, "sad": 0.1, "happy": 0.2, "neutral": 0.1}',
     13.0, 2.8, 1, 0, 0.10, 0.12, 26, 2),

    ('77777777-7777-7777-7777-777777777777', -0.4, 'tense', 
     '{"calm": 0.1, "tense": 0.5, "sad": 0.2, "happy": 0.0, "neutral": 0.2}',
     11.0, 3.5, 2, 2, 0.15, 0.22, 33, 3);

-- ============================================================
-- SAMPLE ENTRY TRIGGERS
-- ============================================================

-- Get trigger IDs
-- work, deadline, friend, rest, boss

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '11111111-1111-1111-1111-111111111111', id, 0.9, -0.5 FROM triggers WHERE name = 'work';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '11111111-1111-1111-1111-111111111111', id, 0.7, -0.4 FROM triggers WHERE name = 'tired';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '22222222-2222-2222-2222-222222222222', id, 0.8, 0.3 FROM triggers WHERE name = 'friend';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '33333333-3333-3333-3333-333333333333', id, 0.9, -0.4 FROM triggers WHERE name = 'work';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '33333333-3333-3333-3333-333333333333', id, 0.8, -0.3 FROM triggers WHERE name = 'boss';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '33333333-3333-3333-3333-333333333333', id, 0.7, -0.4 FROM triggers WHERE name = 'pressure';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '44444444-4444-4444-4444-444444444444', id, 0.9, 0.7 FROM triggers WHERE name = 'rest';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '44444444-4444-4444-4444-444444444444', id, 0.8, 0.6 FROM triggers WHERE name = 'friend';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '55555555-5555-5555-5555-555555555555', id, 0.9, -0.5 FROM triggers WHERE name = 'work';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '55555555-5555-5555-5555-555555555555', id, 0.9, -0.5 FROM triggers WHERE name = 'deadline';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '77777777-7777-7777-7777-777777777777', id, 0.9, -0.4 FROM triggers WHERE name = 'work';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '77777777-7777-7777-7777-777777777777', id, 0.8, -0.4 FROM triggers WHERE name = 'deadline';

INSERT INTO entry_triggers (entry_id, trigger_id, relevance_score, sentiment_context)
SELECT '77777777-7777-7777-7777-777777777777', id, 0.7, -0.4 FROM triggers WHERE name = 'pressure';

-- ============================================================
-- SAMPLE TRIGGER STATS
-- ============================================================

INSERT INTO trigger_stats (user_id, trigger_id, occurrence_count, avg_sentiment, sentiment_volatility, first_seen, last_seen)
SELECT 
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    id, 
    5, 
    -0.4, 
    0.2,
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM triggers WHERE name = 'work';

INSERT INTO trigger_stats (user_id, trigger_id, occurrence_count, avg_sentiment, sentiment_volatility, first_seen, last_seen)
SELECT 
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    id, 
    3, 
    -0.45, 
    0.15,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM triggers WHERE name = 'deadline';

INSERT INTO trigger_stats (user_id, trigger_id, occurrence_count, avg_sentiment, sentiment_volatility, first_seen, last_seen)
SELECT 
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    id, 
    2, 
    0.65, 
    0.1,
    CURRENT_TIMESTAMP - INTERVAL '6 days',
    CURRENT_TIMESTAMP - INTERVAL '4 days'
FROM triggers WHERE name = 'friend';

INSERT INTO trigger_stats (user_id, trigger_id, occurrence_count, avg_sentiment, sentiment_volatility, first_seen, last_seen)
SELECT 
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    id, 
    1, 
    0.7, 
    0.0,
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    CURRENT_TIMESTAMP - INTERVAL '4 days'
FROM triggers WHERE name = 'rest';

INSERT INTO trigger_stats (user_id, trigger_id, occurrence_count, avg_sentiment, sentiment_volatility, first_seen, last_seen)
SELECT 
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    id, 
    2, 
    -0.4, 
    0.1,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM triggers WHERE name = 'pressure';

-- ============================================================
-- SAMPLE USER BASELINE
-- ============================================================

INSERT INTO user_baselines (user_id, baseline_sentiment, baseline_sentence_length, 
    baseline_modal_verb_ratio, baseline_negation_ratio, baseline_first_person_ratio, 
    sample_count, window_days) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', -0.1, 12.3, 0.08, 0.05, 0.12, 7, 30);

-- ============================================================
-- Done!
-- ============================================================
