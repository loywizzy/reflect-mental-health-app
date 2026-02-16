"""
Crisis Detector — Safety Layer
- Checks text for crisis-related keywords
- Returns severity level and matched keywords
- ⚠️ This is the first check before any AI processing
"""

import re

# Crisis keywords with severity levels (1=low, 2=medium, 3=high)
CRISIS_PATTERNS: list[dict] = [
    # Severity 3 — Immediate danger
    {"pattern": "อยากตาย", "severity": 3},
    {"pattern": "ไม่อยากมีชีวิต", "severity": 3},
    {"pattern": "ฆ่าตัวตาย", "severity": 3},
    {"pattern": "ทำร้ายตัวเอง", "severity": 3},
    {"pattern": "กรีดแขน", "severity": 3},
    {"pattern": "จบชีวิต", "severity": 3},
    {"pattern": "ตายดีกว่า", "severity": 3},
    {"pattern": "ไม่อยากตื่น", "severity": 3},
    # Severity 2 — Warning signs
    {"pattern": "ไม่ไหวแล้ว", "severity": 2},
    {"pattern": "หมดหวัง", "severity": 2},
    {"pattern": "ไม่มีใครเข้าใจ", "severity": 2},
    {"pattern": "ไม่มีทางออก", "severity": 2},
    {"pattern": "ไม่อยากทำอะไร", "severity": 2},
    {"pattern": "ไร้ค่า", "severity": 2},
    {"pattern": "ไม่มีใครรัก", "severity": 2},
    # Severity 1 — Monitor
    {"pattern": "อยู่คนเดียว", "severity": 1},
    {"pattern": "เหนื่อยมาก", "severity": 1},
    {"pattern": "ไม่มีกำลังใจ", "severity": 1},
    {"pattern": "เบื่อชีวิต", "severity": 1},
]


def check_crisis(text: str) -> dict:
    """
    Check text for crisis-related content.

    Returns:
        {
            "is_crisis": bool,
            "max_severity": int (0-3),
            "matched_keywords": list[str],
            "should_redirect": bool  (severity >= 2)
        }
    """
    matched = []
    max_severity = 0

    for entry in CRISIS_PATTERNS:
        if entry["pattern"] in text:
            matched.append(entry["pattern"])
            if entry["severity"] > max_severity:
                max_severity = entry["severity"]

    return {
        "is_crisis": len(matched) > 0,
        "max_severity": max_severity,
        "matched_keywords": matched,
        "should_redirect": max_severity >= 2,
    }
