'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { reflectionApi, chatApi } from '@/lib/api';
import {
    RefreshCw, Sparkles, MessageCircleQuestion,
    AlertCircle, Send, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReflectionProps {
    entryId: string;
    initialData?: any;
    initialMode?: 'view' | 'generate';
}

export default function Reflection({ entryId, initialData, initialMode = 'view' }: ReflectionProps) {
    const router = useRouter();
    const { t } = useLanguage();

    const [reflection, setReflection] = useState<any>(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [regenerating, setRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inline reply state
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [activeQ, setActiveQ] = useState<number | null>(null);
    const [sending, setSending] = useState<number | null>(null); // index ที่กำลัง send
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!initialData && entryId) loadReflection();
    }, [entryId, initialData]);

    // focus textarea เมื่อ expand คำถาม
    useEffect(() => {
        if (activeQ !== null && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [activeQ]);

    const loadReflection = async () => {
        setLoading(true);
        setError(null);
        try {
            if (initialMode === 'generate') {
                setReflection(await reflectionApi.generate(entryId));
                return;
            }
            try {
                setReflection(await reflectionApi.get(entryId));
            } catch {
                setReflection(await reflectionApi.generate(entryId));
            }
        } catch {
            setError(t('reflection.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        setError(null);
        try {
            setReflection(await reflectionApi.generate(entryId, true));
            setAnswers({});
            setActiveQ(null);
        } catch {
            setError(t('settings.saveError'));
        } finally {
            setRegenerating(false);
        }
    };

    // ส่งคำตอบไปหา AI โดยตรง — สร้าง conversation แล้ว navigate ไป Chat
    const handleSendAnswer = async (questionIndex: number) => {
        const question = reflection?.questions?.[questionIndex] || '';
        const answer = answers[questionIndex]?.trim();
        if (!answer || sending !== null) return;

        setSending(questionIndex);
        try {
            // รวมคำถาม AI + คำตอบ user เป็น 1 message ที่มี context ครบ
            const messageWithContext = question
                ? `[ต่อจาก Reflection] AI ถามว่า: "${question}"

${answer}`
                : answer;

            // ส่งไปหา chat API ทันที — สร้าง conversation ใหม่
            const conv = await chatApi.sendMessage(messageWithContext);

            // navigate ไปหน้า Chat พร้อม conversation ที่เริ่มแล้ว
            router.push(`/chat?conv=${conv.id}`);
        } catch (e) {
            console.error('Send answer failed', e);
            setSending(null);
        }
    };

    const toggleQuestion = (i: number) => {
        setActiveQ(prev => prev === i ? null : i);
    };

    // ——— Loading skeleton ———
    if (loading) {
        return (
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-slate-200 rounded-full" />
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                    <div className="h-3 bg-slate-200 rounded w-4/6" />
                </div>
            </div>
        );
    }

    // ——— Error state ———
    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
                <button onClick={loadReflection} className="ml-auto underline hover:text-red-700">
                    {t('reflection.retry')}
                </button>
            </div>
        );
    }

    if (!reflection) return null;

    const questions: string[] = reflection.questions || [];

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm p-6">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-indigo-500" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                    <Sparkles className="w-5 h-5" />
                    <h3>{t('reflection.title')}</h3>
                </div>
                <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-white/50"
                    title={t('reflection.regenerate')}
                >
                    <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4 relative z-10">

                {/* Fallback badge */}
                {reflection.is_fallback && (
                    <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit">
                        {t('reflection.fallback')}
                    </div>
                )}

                {/* Reflection text */}
                <p className="text-slate-700 leading-relaxed text-sm lg:text-base whitespace-pre-wrap">
                    {reflection.reflection_text}
                </p>

                {/* Questions — แต่ละข้อมี inline reply */}
                {questions.length > 0 && (
                    <div className="mt-5 space-y-2">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                            <MessageCircleQuestion className="w-4 h-4 text-indigo-400" />
                            ชวนคิดต่อ — กดคำถามเพื่อตอบได้เลย
                        </h4>

                        {questions.map((q, i) => {
                            const isOpen = activeQ === i;
                            const hasAnswer = !!answers[i]?.trim();

                            return (
                                <div
                                    key={i}
                                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${isOpen
                                        ? 'border-indigo-300 bg-white shadow-md'
                                        : 'border-indigo-100 bg-white/60 hover:bg-white hover:border-indigo-200'
                                        }`}
                                >
                                    {/* Question row — กดเพื่อ toggle */}
                                    <button
                                        className="w-full flex items-start gap-3 p-3 text-left"
                                        onClick={() => toggleQuestion(i)}
                                    >
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-500 text-xs font-bold flex items-center justify-center mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="flex-1 text-sm text-slate-700 leading-relaxed">{q}</span>
                                        <span className="flex-shrink-0 text-indigo-300 mt-0.5">
                                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </span>
                                    </button>

                                    {/* Inline reply area */}
                                    {isOpen && (
                                        <div className="px-3 pb-3 border-t border-indigo-50">
                                            <p className="text-[11px] text-indigo-400 mt-2 mb-1.5">
                                                พิมพ์ความคิดของคุณ — จะส่งไปคุยต่อกับ AI
                                            </p>
                                            <div className="flex gap-2">
                                                <textarea
                                                    ref={activeQ === i ? textareaRef : null}
                                                    rows={3}
                                                    value={answers[i] || ''}
                                                    onChange={(e) => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                            e.preventDefault();
                                                            handleSendAnswer(i);
                                                        }
                                                    }}
                                                    placeholder="พิมพ์คำตอบของคุณที่นี่... (Ctrl+Enter เพื่อส่ง)"
                                                    className="flex-1 text-sm text-slate-700 placeholder-slate-400 bg-slate-50 border border-slate-200
                                                               rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
                                                />
                                                <button
                                                    id={`send-answer-${i}`}
                                                    onClick={() => handleSendAnswer(i)}
                                                    disabled={!answers[i]?.trim() || sending !== null}
                                                    className="self-end flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium
                                                               hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm min-w-[56px] justify-center"
                                                >
                                                    {sending === i ? (
                                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                        </svg>
                                                    ) : (
                                                        <Send className="w-3.5 h-3.5" />
                                                    )}
                                                    {sending === i ? 'กำลังส่ง...' : 'ส่ง'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-indigo-50 flex items-center text-[10px] text-slate-400 gap-2">
                <span>Model: {reflection.model_used}</span>
                {reflection.persona && <span>• Persona: {reflection.persona}</span>}
            </div>
        </div>
    );
}
