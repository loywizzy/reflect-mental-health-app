'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
    TrendingUp,
    MessageCircle,
    Target,
    BarChart3,
    Lightbulb,
    Loader2,
    Info,
    Calendar,
    Send,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { insightsApi } from '@/lib/api';
import type { TrendData, Trigger } from '@/data/mockData';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface ApiLanguageDrift {
    metric: string;
    value: number;
    delta: number;
    delta_percent: number;
    direction: string;
}

interface BaselineData {
    baseline_sentiment: number;
    baseline_sentence_length: number;
    sample_count: number;
}

interface DashboardData {
    trend_data: TrendData[];
    language_drift: ApiLanguageDrift[];
    trigger_stats: Array<{
        trigger: { name: string; name_th: string; category: string };
        occurrence_count: number;
        avg_sentiment: number;
    }>;
    insights: string[];
    latest_reflection?: {
        id: string;
        reflection_text: string;
        questions?: string[];
        persona: string;
        model_used: string;
        is_fallback: boolean;
        created_at: string;
    } | null;
    baseline?: BaselineData | null;
}

// ============================================================
// HELPERS — แปลงตัวเลขเป็นภาษาคน
// ============================================================

function getDriftMessage(metric: string, deltaPercent: number, direction: string): {
    emoji: string;
    message: string;
    meaning: string;
    color: string;
    bg: string;
    action?: string;
} {
    const pct = Math.abs(deltaPercent);
    const isUp = direction === 'up';
    const isStable = direction === 'stable' || pct < 10;

    if (metric.includes('ความยาวประโยค')) {
        if (isStable) return { emoji: '📝', message: 'เขียนปกติ', meaning: 'ความยาวประโยคปกติเหมือนเดิม', color: 'text-gray-600', bg: 'bg-gray-50' };
        if (isUp) return { emoji: '📝', message: `เขียนยาวขึ้น ${pct}%`, meaning: 'คุณอธิบายความรู้สึกละเอียดขึ้น — อาจมีสิ่งที่อยากระบาย', color: 'text-blue-600', bg: 'bg-blue-50', action: 'ลองแบ่งเวลาคุยกับเพื่อนหรือคนที่ไว้ใจเพื่อระบายดูไหม?' };
        return { emoji: '📝', message: `เขียนสั้นลง ${pct}%`, meaning: 'ช่วงนี้คุณเขียนน้อยกว่าปกติ — บางทีรู้สึกไม่อยากพูดมาก', color: 'text-blue-600', bg: 'bg-blue-50', action: 'หากรู้สึกเหนื่อยเกินไป การพักผ่อนเงียบๆ คนเดียวก็เป็นการชาร์จพลังที่ดีนะ' };
    }

    if (metric.includes('ต้อง')) {
        if (isStable) return { emoji: '⚖️', message: 'ปกติดี', meaning: 'คุณไม่ได้รู้สึกกดดันมาก', color: 'text-gray-600', bg: 'bg-gray-50' };
        if (isUp) return {
            emoji: pct >= 30 ? '🟠' : '🟡',
            message: `ใช้คำ "ต้อง" บ่อยขึ้น ${pct}%`,
            meaning: pct >= 30
                ? 'คุณอาจรู้สึกมีภาระมากกว่าปกติ ลองหยุดพักดูนะ'
                : 'มีบางอย่างที่รู้สึกว่าต้องรีบทำ',
            color: pct >= 30 ? 'text-orange-600' : 'text-yellow-600',
            bg: pct >= 30 ? 'bg-orange-50' : 'bg-yellow-50',
            action: 'ลองพักสายตาและสูดหายใจลึกๆ 1 นาที เพื่อคลายความกดดันดูไหม?'
        };
        return { emoji: '🟢', message: `ใช้คำ "ต้อง" น้อยลง ${pct}%`, meaning: 'ดูเหมือนช่วงนี้แรงกดดันน้อยลง', color: 'text-green-600', bg: 'bg-green-50' };
    }

    if (metric.includes('ปฏิเสธ') || metric.includes('ไม่')) {
        if (isStable) return { emoji: '😌', message: 'ปกติดี', meaning: 'คุณไม่ได้ปฏิเสธอะไรมากผิดปกติ', color: 'text-gray-600', bg: 'bg-gray-50' };
        if (isUp) return { emoji: '😟', message: `พูดว่า "ไม่" บ่อยขึ้น ${pct}%`, meaning: 'ช่วงนี้อาจมีสิ่งที่รู้สึกขัดใจ หรือไม่อยากทำมากขึ้น', color: 'text-purple-600', bg: 'bg-purple-50', action: 'เป็นเรื่องปกติที่จะปฏิเสธในสิ่งที่ไม่พร้อม ลองอนุญาตให้ตัวเองได้พักจากสิ่งที่ไม่อยากทำบ้างนะ' };
        return { emoji: '😊', message: `พูดว่า "ไม่" น้อยลง ${pct}%`, meaning: 'ช่วงนี้ดูเปิดรับมากขึ้น', color: 'text-green-600', bg: 'bg-green-50' };
    }

    return { emoji: '📊', message: `${isUp ? '+' : '-'}${pct}%`, meaning: metric, color: 'text-gray-600', bg: 'bg-gray-50' };
}

function getBaselineSummary(currentSentiment: number, baselineSentiment: number) {
    const diff = currentSentiment - baselineSentiment;
    // ป้องกันการหารด้วยเลขที่ใกล้ 0 มากๆ ซึ่งจะทำให้ % พุ่งสูงผิดปกติ (เช่น 22106%)
    // โดยการกำหนดค่าตัวหารขั้นต่ำที่ 0.1
    const pct = Math.abs((diff / Math.max(Math.abs(baselineSentiment), 0.1)) * 100);

    if (Math.abs(diff) < 0.05) {
        // ตรวจสอบ Stable-Bad: ถ้านิ่งแต่ความรู้สึกพื้นฐานติดลบเยอะ
        if (baselineSentiment < -0.3) {
             return { 
                 emoji: '🫂', 
                 label: 'ยังมีเรื่องหนักใจ', 
                 color: 'text-purple-700', 
                 bg: 'bg-purple-100', 
                 pctText: '',
                 message: 'ช่วงนี้ความรู้สึกยังคงหนักหน่วง อย่าลืมใจดีกับตัวเองให้มากๆ นะ' 
             };
        }
        return { emoji: '😌', label: 'ปกติเหมือนเคย', color: 'text-gray-700', bg: 'bg-gray-100', pctText: '' };
    }
    if (diff > 0) {
        return {
            emoji: '😊',
            label: 'ดีกว่าปกติ',
            color: 'text-green-700',
            bg: 'bg-green-100',
            pctText: `+${pct.toFixed(0)}%`,
        };
    }
    return {
        emoji: '😔',
        label: 'ต่ำกว่าปกติ',
        color: 'text-orange-700',
        bg: 'bg-orange-100',
        pctText: `-${pct.toFixed(0)}%`,
    };
}

// Emotion colors for pie chart
const EMOTION_COLORS: Record<string, string> = {
    calm: '#768568',
    happy: '#4ade80',
    neutral: '#94a3b8',
    tense: '#fb923c',
    sad: '#818cf8',
};

const EMOTION_LABELS: Record<string, string> = {
    calm: 'สงบ',
    happy: 'มีความสุข',
    neutral: 'ปกติ',
    tense: 'เครียด',
    sad: 'เศร้า',
};

export default function DashboardPage() {
    const { isLoading: authLoading, isLoggedIn } = useAuth();
    const router = useRouter();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showBaselineInfo, setShowBaselineInfo] = useState(false);
    const [period, setPeriod] = useState<7 | 30>(7);
    const [reflectionReply, setReflectionReply] = useState('');
    const { t, language } = useLanguage();

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push('/');
            return;
        }
        if (isLoggedIn) {
            loadDashboard();
        }
    }, [authLoading, isLoggedIn, router, period]);

    const loadDashboard = async () => {
        try {
            setIsLoading(true);
            const data = await insightsApi.getDashboard(period);
            setDashboard(data);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const rawTrendData = dashboard?.trend_data || [];

    // จัดกลุ่มกราฟให้มีแค่วันละ 1 อัน โดยนำ sentiment ของวันเดียวกันมาหาค่าเฉลี่ย
    const trendData = rawTrendData.reduce((acc: any[], curr) => {
        const existing = acc.find((item: any) => item.date === curr.date);
        if (existing) {
            existing.sumSentiment += curr.sentiment;
            existing.count += 1;
            existing.sentiment = existing.sumSentiment / existing.count;
        } else {
            acc.push({ ...curr, sumSentiment: curr.sentiment, count: 1 });
        }
        return acc;
    }, []).map((item: any) => ({
        date: item.date,
        sentiment: item.sentiment,
        label: item.label
    }));
    const languageDrift = dashboard?.language_drift?.map(d => ({
            metric: d.metric,
            value: d.value,
            delta: d.delta,
            deltaPercent: d.delta_percent,
            direction: d.direction as 'up' | 'down' | 'stable',
        })) || [];

    const triggerDataForBubbles = dashboard?.trigger_stats?.map((t, i) => ({
            id: String(i),
            name: language === 'th' ? (t.trigger.name_th || t.trigger.name) : t.trigger.name,
            category: t.trigger.category,
            occurrenceCount: t.occurrence_count,
            avgSentiment: t.avg_sentiment || 0,
            emotion: (t.avg_sentiment < -0.2 ? 'tense' : t.avg_sentiment > 0.2 ? 'happy' : 'neutral') as Trigger['emotion'],
        })) || [];

    // หาค่าสูงสุดเพื่อทำ Scaling ขนาด Bubble
    const maxOccurrences = Math.max(...triggerDataForBubbles.map(t => t.occurrenceCount), 1);

    const insights = dashboard?.insights || [];

    // Baseline summary — ต้องมีข้อมูลอย่างน้อย 5 รายการถึงจะมีความหมาย
    const MIN_BASELINE_SAMPLES = 5;
    const baselineSampleCount = dashboard?.baseline?.sample_count ?? 0;
    const hasEnoughBaseline = baselineSampleCount >= MIN_BASELINE_SAMPLES;

    const lastSentiment = trendData.length > 0 ? trendData[trendData.length - 1].sentiment : null;
    const baselineSentiment = dashboard?.baseline?.baseline_sentiment ?? null;
    const baselineSummary = (hasEnoughBaseline && lastSentiment !== null && baselineSentiment !== null)
        ? getBaselineSummary(lastSentiment, baselineSentiment)
        : null;

    // Progress toward reliable baseline
    const baselineProgress = Math.min(Math.round((baselineSampleCount / MIN_BASELINE_SAMPLES) * 100), 100);

    // Emotion distribution from trend data
    const emotionCounts: Record<string, number> = {};
    trendData.forEach(d => {
        const s = d.sentiment;
        const emo = s >= 0.3 ? 'happy' : s >= 0.05 ? 'calm' : s <= -0.3 ? 'sad' : s <= -0.05 ? 'tense' : 'neutral';
        emotionCounts[emo] = (emotionCounts[emo] || 0) + 1;
    });
    const emotionPieData = Object.entries(emotionCounts)
        .map(([name, value]) => ({ name: EMOTION_LABELS[name] || name, value, key: name }))
        .sort((a, b) => b.value - a.value);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-sage-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-sage-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sage-50">
            <Navigation />

            <main className="container mx-auto max-w-6xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">
                                📊 {t('dashboard.title')}
                            </h1>
                            <p className="text-gray-500 text-sm flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {trendData.length > 0 ? `${trendData.length} วันในช่วงนี้` : t('dashboard.last7days')}
                            </p>
                        </div>
                        {/* Period Toggle */}
                        <div className="flex items-center bg-white border border-sage-200 rounded-xl p-1 gap-1 shadow-sm">
                            {([7, 30] as const).map((d) => (
                                <button
                                    key={d}
                                    id={`period-${d}d`}
                                    onClick={() => setPeriod(d)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${period === d
                                        ? 'bg-sage-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-sage-50'
                                        }`}
                                >
                                    {d === 7 ? '7 วัน' : '30 วัน'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Mood Trend Chart */}
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle icon={<BarChart3 className="h-5 w-5 text-sage-600" />}>
                                    {t('dashboard.moodTrend')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Baseline — แสดงตาม sample count */}
                                {dashboard?.baseline && !hasEnoughBaseline && (
                                    <div className="mb-4 p-4 bg-white rounded-xl border border-sage-100 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">📊</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-700 text-sm">
                                                    กำลังสะสมข้อมูลเพื่อเทียบ &quot;ปกติของคุณ&quot;
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    เขียนบันทึกอีก {MIN_BASELINE_SAMPLES - baselineSampleCount} ครั้ง จะเริ่มเห็นว่าช่วงนี้รู้สึกดีขึ้น/แย่ลงกว่าปกติของคุณ
                                                </p>
                                                {/* Progress bar */}
                                                <div className="mt-2 h-1.5 bg-sage-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-sage-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${baselineProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-sage-500 mt-1">
                                                    {baselineSampleCount}/{MIN_BASELINE_SAMPLES} รายการ
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Baseline Badge - แสดงเมื่อมีข้อมูลเพียงพอ */}
                                {baselineSummary && (
                                    <div className="mb-4 p-4 bg-white rounded-xl border border-sage-100 shadow-sm">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{baselineSummary.emoji}</span>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-base">
                                                        ช่วงนี้รู้สึก
                                                        <span className={`ml-1 px-2 py-0.5 rounded-full text-sm font-medium ${baselineSummary.bg} ${baselineSummary.color}`}>
                                                            {baselineSummary.label}
                                                            {baselineSummary.pctText && ` (${baselineSummary.pctText})`}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">เทียบกับ {baselineSampleCount} รายการใน 30 วันที่ผ่านมาของคุณ</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowBaselineInfo(!showBaselineInfo)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                title="baseline คืออะไร?"
                                            >
                                                <Info className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {showBaselineInfo && (
                                            <div className="mt-3 p-3 bg-sage-50 rounded-lg text-xs text-gray-600 leading-relaxed border border-sage-100">
                                                <strong>เปรียบเทียบกับอะไร?</strong><br />
                                                ระบบจำ {baselineSampleCount} รายการที่คุณเขียนใน 30 วันที่ผ่านมา แล้วหาค่าเฉลี่ยอารมณ์ของ<em>ตัวคุณเอง</em>
                                                — ไม่ได้เทียบกับคนอื่น ถ้าคุณปกติรู้สึกเครียดอยู่แล้ว
                                                และวันนี้รู้สึกเครียดเท่าเดิม ก็จะขึ้นว่า &quot;ปกติเหมือนเคย&quot;
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="h-64">
                                    {trendData.length === 0 ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <p className="text-sm">ยังไม่มีข้อมูลเพียงพอ</p>
                                            <p className="text-xs mt-1 opacity-70">เริ่มบันทึกเพื่อให้เห็นแนวโน้มอารมณ์ของคุณ</p>
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                            <LineChart data={trendData}>
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                <YAxis domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} axisLine={false} tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                                    tickFormatter={(v) => v >= 0.5 ? '😊' : v <= -0.5 ? '😔' : '😐'}
                                                />
                                                <Tooltip content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        const s = data.sentiment;
                                                        const feel = s >= 0.5 ? 'รู้สึกดีมาก' : s >= 0.1 ? 'รู้สึกโอเค' : s <= -0.5 ? 'รู้สึกไม่ค่อยดี' : s <= -0.1 ? 'รู้สึกหนักใจนิดหน่อย' : 'รู้สึกปกติ';
                                                        return (
                                                            <div className="bg-white p-3 rounded-lg shadow-lg border border-sage-100">
                                                                <p className="text-lg">{data.label}</p>
                                                                <p className="text-sm text-gray-600">{feel}</p>
                                                                <p className="text-xs text-gray-400">วัน{data.date}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }} />
                                                <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />
                                                {baselineSentiment !== null && (
                                                    <ReferenceLine
                                                        y={baselineSentiment}
                                                        stroke="#94a185"
                                                        strokeDasharray="6 3"
                                                        strokeWidth={1.5}
                                                        label={{ value: 'ปกติของคุณ', position: 'right', fontSize: 10, fill: '#94a185' }}
                                                    />
                                                )}
                                                <Line type="monotone" dataKey="sentiment" stroke="#5c6a52" strokeWidth={3}
                                                    dot={{ fill: '#5c6a52', strokeWidth: 2, r: 5 }}
                                                    activeDot={{ r: 8, fill: '#5c6a52' }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Language Drift — Human Readable */}
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <div className="flex items-start justify-between w-full">
                                    <CardTitle icon={<TrendingUp className="h-5 w-5 text-sage-600" />}>
                                        สัญญาณจากภาษาของคุณ
                                    </CardTitle>
                                    <div className="group relative">
                                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                        <div className="absolute right-0 top-6 w-64 p-3 bg-gray-800 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                                            <b>Baseline คืออะไร?</b><br />
                                            คือ "ค่าเฉลี่ยปกติของคุณ" ที่ระบบคำนวณจากบันทึกในอดีต (30 วัน) เพื่อใช้เป็นเกณฑ์มาตรฐานในการเปรียบเทียบว่าช่วงนี้คุณเปลี่ยนไปอย่างไร
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 ml-7">
                                    วิเคราะห์จากสิ่งที่คุณเขียนใน {period} วันนี้ เทียบกับนิสัยการเขียนปกติของคุณ (Baseline)
                                </p>
                            </CardHeader>
                            <CardContent>
                                {languageDrift.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        เขียนบันทึกอย่างน้อย 3 วัน เพื่อดูสัญญาณนี้
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {languageDrift.map((drift, index) => {
                                            const info = getDriftMessage(drift.metric, drift.deltaPercent, drift.direction);
                                            return (
                                                <div key={index} className={`p-4 rounded-xl ${info.bg} border border-opacity-50`}>
                                                    <div className="flex items-start gap-3">
                                                        <span className="text-xl mt-0.5">{info.emoji}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`font-semibold text-sm ${info.color}`}>{info.message}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{info.meaning}</p>
                                                            {info.action && (
                                                                <div className={`mt-2 p-2 rounded-lg bg-white/60 border border-white/50 text-xs font-medium text-gray-700 flex items-start gap-2 shadow-sm`}>
                                                                    <span className="text-sage-500 mt-0.5">💡</span>
                                                                    <span>{info.action}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <p className="text-xs text-gray-400 text-center pt-1">
                                            💡 สัญญาณเหล่านี้มาจากรูปแบบภาษาของคุณ ไม่ใช่การวินิจฉัย
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Trigger Map */}
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle icon={<Target className="h-5 w-5 text-sage-600" />}>
                                    {t('dashboard.triggerMap')}
                                </CardTitle>
                                <p className="text-xs text-gray-400 mt-1 ml-7">
                                    หัวข้อที่ปรากฏในบันทึกของคุณบ่อยๆ — สีแสดงถึงอารมณ์ที่มักมาด้วยกัน
                                </p>
                            </CardHeader>
                            <CardContent>
                                {triggerDataForBubbles.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        ยังไม่พบหัวข้อที่ถูกพูดถึงบ่อยในช่วงนี้
                                    </p>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap items-center justify-center gap-4 py-4">
                                            {triggerDataForBubbles.map((trigger) => {
                                                // คำนวณขนาดตามจำนวนครั้ง (14px - 24px)
                                                const scale = 0.8 + (trigger.occurrenceCount / maxOccurrences) * 0.7;
                                                const fontSize = Math.min(Math.max(12 * scale, 12), 24);

                                                return (
                                                    <div
                                                        key={trigger.id}
                                                        style={{ fontSize: `${fontSize}px` }}
                                                        className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 transition-transform hover:scale-105 cursor-default ${trigger.avgSentiment < -0.2
                                                            ? 'border-orange-200 bg-orange-50 text-orange-700'
                                                            : trigger.avgSentiment > 0.2
                                                                ? 'border-green-200 bg-green-50 text-green-700'
                                                                : 'border-gray-200 bg-gray-50 text-gray-700'
                                                            }`}
                                                    >
                                                        <span className="shrink-0">
                                                            {trigger.emotion === 'tense' ? '😰' :
                                                                trigger.emotion === 'happy' ? '😊' :
                                                                    trigger.emotion === 'sad' ? '😔' : '😐'}
                                                        </span>
                                                        <span className="font-semibold whitespace-nowrap">{trigger.name}</span>
                                                        <span className="text-[10px] opacity-60 font-normal">x{trigger.occurrenceCount}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-4 flex gap-4 text-xs text-gray-400">
                                            <span>🟠 มักมาพร้อมความเครียด</span>
                                            <span>🟢 มักมาพร้อมความสุข</span>
                                            <span>⚪ กลางๆ</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">

                        {/* Emotion Distribution */}
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle icon={<span className="text-base">🎭</span>}>
                                    อารมณ์ที่พบบ่อย
                                </CardTitle>
                                <p className="text-xs text-gray-400 mt-1 ml-7">
                                    ใน {period} วันที่ผ่านมา
                                </p>
                            </CardHeader>
                            <CardContent>
                                {emotionPieData.length === 0 ? (
                                    <div className="h-44 flex flex-col items-center justify-center text-gray-400">
                                        <p className="text-sm">ยังไม่มีข้อมูลอารมณ์</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-44">
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                                <PieChart>
                                                    <Pie
                                                        data={emotionPieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={40}
                                                        outerRadius={65}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                    >
                                                        {emotionPieData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={EMOTION_COLORS[entry.key] || '#94a3b8'}
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value: number | undefined) => [`${value ?? 0} วัน`, '']}
                                                    />
                                                    <Legend
                                                        formatter={(value) => (
                                                            <span className="text-xs text-gray-600">{value}</span>
                                                        )}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        {/* Top emotion highlight */}
                                        {emotionPieData[0] && (
                                            <p className="text-center text-xs text-gray-500 mt-1">
                                                อารมณ์ที่พบมากที่สุด: <span className="font-medium text-gray-700">{emotionPieData[0].name}</span> ({emotionPieData[0].value} วัน)
                                            </p>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Insights */}
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle icon={<Lightbulb className="h-5 w-5 text-sage-600" />}>
                                    ข้อสังเกตจากบันทึกของคุณ
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {insights.length === 0 ? (
                                    <p className="text-sm text-gray-400">เขียนบันทึกเพิ่มอีกนิด เพื่อให้เราเริ่มสังเกตและสะท้อนข้อมูลให้คุณนะ</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {insights.map((insight, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                <span className="mt-1 w-2 h-2 rounded-full bg-sage-400 flex-shrink-0" />
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>

                        {/* AI Reflection */}
                        {dashboard?.latest_reflection ? (
                            <Card className="animate-fade-in border-sage-200 bg-gradient-to-br from-white to-sage-50">
                                <CardHeader>
                                    <CardTitle icon={<MessageCircle className="h-5 w-5 text-sage-600" />}>
                                        {t('dashboard.aiReflection')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 p-4 rounded-xl bg-white border border-sage-100">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            &quot;{dashboard.latest_reflection.reflection_text}&quot;
                                        </p>
                                    </div>
                                    {dashboard.latest_reflection.questions && dashboard.latest_reflection.questions.length > 0 && (
                                        <div className="space-y-3 mb-4">
                                            {dashboard.latest_reflection.questions.map((q, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-lavender-50 border border-lavender-100 text-sm text-gray-700">
                                                    💭 {q}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-4 relative">
                                        <input 
                                            type="text" 
                                            placeholder="พิมพ์ตอบกลับ AI เพื่อเริ่มพูดคุย..." 
                                            className="flex-1 pl-4 pr-10 py-2.5 rounded-xl border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400 text-sm bg-white shadow-sm transition-all"
                                            value={reflectionReply}
                                            onChange={(e) => setReflectionReply(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && reflectionReply.trim()) {
                                                    router.push(`/chat?prefill=${encodeURIComponent(reflectionReply)}`);
                                                }
                                            }}
                                        />
                                        <button 
                                            onClick={() => reflectionReply.trim() && router.push(`/chat?prefill=${encodeURIComponent(reflectionReply)}`)}
                                            disabled={!reflectionReply.trim()}
                                            className="absolute right-1.5 top-1.5 p-1.5 text-sage-600 hover:text-sage-800 disabled:opacity-40 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="animate-fade-in border-sage-200 bg-gradient-to-br from-white to-sage-50 opacity-70">
                                <CardHeader>
                                    <CardTitle icon={<MessageCircle className="h-5 w-5 text-sage-600" />}>
                                        {t('dashboard.aiReflection')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm">เขียนบันทึกเพื่อให้ AI เริ่มทบทวนความคิดให้คุณ</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
