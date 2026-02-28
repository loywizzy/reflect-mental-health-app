// Mock data for Reflect Mental Health AI Web App
// This will be replaced with real API data later

export interface User {
    id: string;
    email: string;
    persona: 'student' | 'worker' | 'teen';
    createdAt: string;
    journalCount: number;
    daysActive: number;
}

export interface JournalEntry {
    id: string;
    content: string;
    entryDate: string;
    createdAt: string;
    emotion?: 'calm' | 'tense' | 'sad' | 'happy' | 'neutral';
    sentimentScore?: number;
}

export interface TrendData {
    date: string;
    sentiment: number;
    label: string;
}

export interface LanguageDrift {
    metric: string;
    value: number;
    delta: number;
    deltaPercent: number;
    direction: 'up' | 'down' | 'stable';
}

export interface Trigger {
    id: string;
    name: string;
    category: string;
    occurrenceCount: number;
    avgSentiment: number;
    emotion: 'calm' | 'tense' | 'sad' | 'happy' | 'neutral';
}

export interface Insight {
    id: string;
    text: string;
    type: 'trend' | 'trigger' | 'language';
}

export interface AIReflection {
    message: string;
    questions: string[];
}

// Mock User
export const mockUser: User = {
    id: '1',
    email: 'user@example.com',
    persona: 'worker',
    createdAt: '2026-01-19',
    journalCount: 12,
    daysActive: 14,
};

// Mock Journal Entries
export const mockJournalEntries: JournalEntry[] = [
    {
        id: '1',
        content: 'วันนี้งานเยอะมาก ต้องทำให้เสร็จก่อน deadline รู้สึกกดดันมาก ไม่รู้จะไหวไหม',
        entryDate: '2026-02-01',
        createdAt: '2026-02-01T10:30:00',
        emotion: 'tense',
        sentimentScore: -0.4,
    },
    {
        id: '2',
        content: 'วันนี้พักผ่อนได้เต็มที่ ไปเดินเล่นกับเพื่อน รู้สึกดีขึ้นมาก',
        entryDate: '2026-01-31',
        createdAt: '2026-01-31T18:00:00',
        emotion: 'happy',
        sentimentScore: 0.7,
    },
    {
        id: '3',
        content: 'ประชุมทั้งวัน เหนื่อยมาก หัวหน้าเรียกไปคุยเรื่องโปรเจค ต้องทำให้ดีกว่านี้',
        entryDate: '2026-01-30',
        createdAt: '2026-01-30T20:15:00',
        emotion: 'tense',
        sentimentScore: -0.3,
    },
    {
        id: '4',
        content: 'วันนี้ทำงานเสร็จตามเป้า รู้สึกโอเค ไม่ได้มีอะไรพิเศษ',
        entryDate: '2026-01-29',
        createdAt: '2026-01-29T19:00:00',
        emotion: 'neutral',
        sentimentScore: 0.1,
    },
    {
        id: '5',
        content: 'รู้สึกเหนื่อยมาก งานสะสมมาหลายวัน ต้องทำให้เสร็จ ไม่รู้จะจัดการยังไง',
        entryDate: '2026-01-28',
        createdAt: '2026-01-28T21:30:00',
        emotion: 'sad',
        sentimentScore: -0.5,
    },
];

// Mock Trend Data (7 days)
export const mockTrendData: TrendData[] = [
    { date: 'จ', sentiment: -0.5, label: '😔' },
    { date: 'อ', sentiment: 0.1, label: '😐' },
    { date: 'พ', sentiment: -0.3, label: '😰' },
    { date: 'พฤ', sentiment: 0.7, label: '😊' },
    { date: 'ศ', sentiment: -0.4, label: '😰' },
    { date: 'ส', sentiment: 0.2, label: '😐' },
    { date: 'อา', sentiment: -0.2, label: '😐' },
];

// Mock Language Drift
export const mockLanguageDrift: LanguageDrift[] = [
    {
        metric: 'ความยาวประโยค',
        value: 12.5,
        delta: -2.3,
        deltaPercent: -15,
        direction: 'down',
    },
    {
        metric: 'การใช้คำ "ต้อง"',
        value: 4.2,
        delta: 1.8,
        deltaPercent: 40,
        direction: 'up',
    },
    {
        metric: 'คำปฏิเสธ',
        value: 2.1,
        delta: 0.5,
        deltaPercent: 12,
        direction: 'up',
    },
];

// Mock Triggers
export const mockTriggers: Trigger[] = [
    {
        id: '1',
        name: 'งาน',
        category: 'work',
        occurrenceCount: 8,
        avgSentiment: -0.4,
        emotion: 'tense',
    },
    {
        id: '2',
        name: 'deadline',
        category: 'work',
        occurrenceCount: 5,
        avgSentiment: -0.5,
        emotion: 'tense',
    },
    {
        id: '3',
        name: 'ความคาดหวัง',
        category: 'work',
        occurrenceCount: 3,
        avgSentiment: -0.3,
        emotion: 'sad',
    },
    {
        id: '4',
        name: 'พักผ่อน',
        category: 'self-care',
        occurrenceCount: 4,
        avgSentiment: 0.6,
        emotion: 'happy',
    },
    {
        id: '5',
        name: 'เพื่อน',
        category: 'relationship',
        occurrenceCount: 2,
        avgSentiment: 0.7,
        emotion: 'happy',
    },
];

// Mock Insights
export const mockInsights: Insight[] = [
    {
        id: '1',
        text: 'ช่วงนี้คุณใช้คำบ่งบอกแรงกดดันบ่อยขึ้น เช่น "ต้อง", "ไม่ไหว"',
        type: 'language',
    },
    {
        id: '2',
        text: 'อารมณ์ตึงเชื่อมโยงกับหัวข้อเรื่องงานบ่อยที่สุด',
        type: 'trigger',
    },
    {
        id: '3',
        text: 'ประโยคที่เขียนสั้นลงเมื่อเทียบกับช่วงก่อนหน้า',
        type: 'trend',
    },
];

// Mock AI Reflection
export const mockAIReflection: AIReflection = {
    message: 'ช่วงนี้ดูเหมือนว่าเรื่องงานเป็นสิ่งที่อยู่ในความคิดบ่อย และมักมาพร้อมกับความรู้สึกกดดัน',
    questions: [
        'คุณคิดว่าอะไรทำให้เรื่องงานรู้สึกหนักกว่าปกติ?',
        'มีอะไรที่ช่วยให้รู้สึกเบาลงได้บ้าง?',
        'ช่วงที่พักผ่อนกับเพื่อน คุณรู้สึกต่างจากตอนทำงานยังไง?',
    ],
};
