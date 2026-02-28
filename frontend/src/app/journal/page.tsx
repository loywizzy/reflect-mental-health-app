'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, Calendar, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { journalApi } from '@/lib/api';
import { formatRelativeDate, getEmotionEmoji } from '@/lib/utils';
import Reflection from '@/components/Reflection';

interface JournalEntry {
    id: string;
    content: string;
    entry_date: string;
    created_at: string;
    sentiment_score?: number;
    dominant_emotion?: string;
}

import { useLanguage } from '@/contexts/LanguageContext';

export default function JournalPage() {
    const { user, isLoading: authLoading, isLoggedIn } = useAuth();
    const router = useRouter();
    const [content, setContent] = useState('');
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [crisisWarning, setCrisisWarning] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
    const { t } = useLanguage();

    const fetchEntries = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await journalApi.getEntries({ limit: 20 });
            setEntries(data);
        } catch (err) {
            console.error('Failed to fetch entries:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push('/');
            return;
        }
        if (isLoggedIn) {
            fetchEntries();
        }
    }, [authLoading, isLoggedIn, router, fetchEntries]);

    const handleSave = async () => {
        if (!content.trim() || isSaving) return;

        try {
            setIsSaving(true);
            setCrisisWarning(null);
            setSaveMessage(null);

            const result = await journalApi.createEntry(content);

            // Check for crisis
            if (result.crisis?.should_redirect) {
                router.push('/crisis');
                return;
            }

            if (result.crisis?.is_crisis) {
                setCrisisWarning('หากคุณต้องการความช่วยเหลือ สายด่วนสุขภาพจิต 1323');
            }

            // Show analysis feedback
            const emotion = result.analysis?.dominant_emotion || 'neutral';
            const emoji = getEmotionEmoji(emotion);
            setSaveMessage(`${t('journal.saveEntry')} ${emoji}`);
            setCurrentEntryId(result.entry.id);

            setContent('');
            await fetchEntries();

            // Clear message after 3 seconds
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (err) {
            console.error('Failed to save:', err);
            setSaveMessage(t('common.error'));
        } finally {
            setIsSaving(false);
        }
    };

    const today = new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    if (authLoading) {
        return (
            <div className="min-h-screen bg-sage-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-sage-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sage-50">
            <Navigation />

            <main className="container mx-auto max-w-3xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">📝 {t('journal.title')}</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {today}
                    </p>
                </div>

                {/* Crisis Warning */}
                {crisisWarning && (
                    <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3 animate-fade-in">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-orange-800 font-medium">เราห่วงใยคุณ</p>
                            <p className="text-orange-700 text-sm">{crisisWarning}</p>
                        </div>
                    </div>
                )}

                {/* Write Section */}
                <Card className="mb-8 animate-fade-in">
                    <CardContent>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={t('journal.placeholder')}
                            maxLength={5000}
                            className="w-full min-h-[200px] p-4 rounded-xl border border-sage-200 bg-sage-50 
                         text-gray-700 placeholder-gray-400 resize-none
                         focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent
                         transition-all"
                        />
                        <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs ${content.length > 4500 ? 'text-orange-500' : 'text-gray-400'}`}>
                                {content.length}/5000
                            </span>
                            {saveMessage && (
                                <p className="text-sm text-sage-700 animate-fade-in">{saveMessage}</p>
                            )}
                            <div className="ml-auto">
                                <Button onClick={handleSave} disabled={!content.trim() || isSaving}>
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {isSaving ? t('journal.saving') : t('journal.saveEntry')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {currentEntryId && (
                    <div className="mb-8 animate-fade-in">
                        <Reflection entryId={currentEntryId} initialMode="generate" />
                    </div>
                )}

                {/* Previous Entries */}
                <div className="animate-fade-in">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        📜 {t('nav.history')}
                    </h2>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 text-sage-600 animate-spin" />
                        </div>
                    ) : entries.length === 0 ? (
                        <Card>
                            <CardContent>
                                <p className="text-center text-gray-500 py-4">
                                    {t('journal.noEntries')}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {entries.map((entry) => (
                                <Card key={entry.id} hover className="cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            {formatRelativeDate(entry.entry_date)}
                                        </div>
                                        {entry.dominant_emotion && (
                                            <span className="text-2xl" title={entry.dominant_emotion}>
                                                {getEmotionEmoji(entry.dominant_emotion)}
                                            </span>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 line-clamp-3">{entry.content}</p>
                                        {entry.sentiment_score !== undefined && entry.sentiment_score !== null && (
                                            <div className="mt-2 text-xs">
                                                <span className={`px-2 py-0.5 rounded-full ${entry.sentiment_score >= 0.2 ? 'bg-green-100 text-green-700' :
                                                    entry.sentiment_score <= -0.2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {entry.sentiment_score >= 0.2 ? '😊 รู้สึกดี' :
                                                        entry.sentiment_score <= -0.2 ? '😔 รู้สึกหนักใจ' :
                                                            '😐 รู้สึกปกติ'}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
