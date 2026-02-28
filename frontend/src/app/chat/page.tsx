'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { chatApi } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, User as UserIcon, Bot, MoreVertical, Plus, Menu, X } from 'lucide-react';
import { Navigation } from '@/components/layout/Navigation';

interface Message {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    created_at: string;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
}

import { useLanguage } from '@/contexts/LanguageContext';

export default function ChatPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [input, setInput] = useState('');
    const [prefillContext, setPrefillContext] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPersonaPicker, setShowPersonaPicker] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState<string>(
        user?.persona || 'worker'
    );
    const [showSidebar, setShowSidebar] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    const PERSONAS = [
        { id: 'worker', emoji: '💼', label: 'Assistant', desc: 'เข้าใจเรื่องงาน deadline burnout' },
        { id: 'student', emoji: '🎓', label: 'Student', desc: 'เข้าใจเรื่องการเรียน สอบ ความกดดัน' },
        { id: 'teen', emoji: '🌱', label: 'Teen', desc: 'สบายๆ ไม่ตัดสิน เข้าใจวัยรุ่น' },
    ];

    // รับ ?prefill= จาก Reflection component
    useEffect(() => {
        const prefill = searchParams.get('prefill');
        if (prefill) {
            setInput(prefill);
            setPrefillContext(prefill);
            setCurrentConversation(null);
        }
    }, [searchParams]);

    // รับ ?conv= จาก Reflection (auto-send เสร็จแล้ว → load conversation นั้น)
    useEffect(() => {
        const convId = searchParams.get('conv');
        if (convId) {
            fetchConversationDetails(convId);
        }
    }, [searchParams]);

    // Load conversations on mount
    useEffect(() => {
        fetchConversations();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentConversation?.messages]);

    const fetchConversations = async () => {
        try {
            const data = await chatApi.getConversations();
            setConversations(data);

            const urlConv = searchParams.get('conv');
            const urlPrefill = searchParams.get('prefill');

            if (data.length > 0 && !currentConversation && !urlConv && !urlPrefill) {
                // Load most recent
                fetchConversationDetails(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    };

    const fetchConversationDetails = async (id: string) => {
        try {
            const data = await chatApi.getConversation(id);
            setCurrentConversation(data);
        } catch (error) {
            console.error('Failed to load conversation', error);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const messageText = input;
        setInput('');
        setPrefillContext(null);
        setIsLoading(true);

        // Optimistic update
        const tempMsg: Message = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            content: messageText,
            created_at: new Date().toISOString(),
        };

        if (currentConversation) {
            setCurrentConversation({
                ...currentConversation,
                messages: [...currentConversation.messages, tempMsg]
            });
        }

        try {
            // ส่ง persona เฉพาะ message แรก (new conversation)
            const personaToSend = !currentConversation ? selectedPersona : undefined;
            const updatedConversation = await chatApi.sendMessage(
                messageText,
                currentConversation?.id,
                personaToSend,
            );
            setCurrentConversation(updatedConversation);
            fetchConversations();
        } catch (error) {
            console.error('Error sending message', error);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setShowPersonaPicker(true);
    };

    const confirmPersonaAndStart = (personaId: string) => {
        setSelectedPersona(personaId);
        setCurrentConversation(null);
        setInput('');
        setPrefillContext(null);
        setShowPersonaPicker(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
            <Navigation />

            {/* Persona Picker Modal */}
            {showPersonaPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 animate-fade-in">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">🤖 เลือกบุคลิก AI</h3>
                        <p className="text-sm text-gray-400 mb-5">AI จะปรับโทนภาษาให้เหมาะกับสิ่งที่คุณต้องการคุย</p>

                        <div className="space-y-3">
                            {PERSONAS.map((p) => (
                                <button
                                    key={p.id}
                                    id={`persona-${p.id}`}
                                    onClick={() => confirmPersonaAndStart(p.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/50 ${selectedPersona === p.id
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-100 bg-slate-50'
                                        }`}
                                >
                                    <span className="text-3xl">{p.emoji}</span>
                                    <div>
                                        <p className="font-semibold text-slate-800">{p.label}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                                    </div>
                                    {selectedPersona === p.id && (
                                        <span className="ml-auto text-indigo-500 text-xs font-medium bg-indigo-100 px-2 py-1 rounded-full">ใช้อยู่</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowPersonaPicker(false)}
                            className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 py-2"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden pt-16 md:pl-64 h-[calc(100vh-4rem)] relative">

                {/* Overlay for mobile sidebar */}
                {showSidebar && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setShowSidebar(false)}
                    />
                )}

                {/* Sidebar (Conversations) */}
                <div className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white border-r flex flex-col transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } pt-16 lg:pt-0`}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <button
                            onClick={() => { startNewChat(); setShowSidebar(false); }}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> {t('chat.newChat')}
                        </button>
                        <button
                            className="p-2 ml-2 lg:hidden text-gray-500 hover:bg-gray-100 rounded-lg"
                            onClick={() => setShowSidebar(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {conversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => { fetchConversationDetails(conv.id); setShowSidebar(false); }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm truncate transition-colors ${currentConversation?.id === conv.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {conv.title || t('chat.newChat')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white w-full lg:w-auto overflow-hidden">

                    {/* Header */}
                    <div className="h-16 border-b flex items-center px-4 md:px-6 justify-between flex-shrink-0">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <button
                                className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg flex-shrink-0"
                                onClick={() => setShowSidebar(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <h2 className="font-semibold text-gray-800 truncate mr-2">
                                {currentConversation ? (currentConversation.title || t('chat.newChat')) : t('chat.newChat')}
                            </h2>
                        </div>
                        {/* Active persona badge — กดเพื่อเปลี่ยน (new chat เท่านั้น) */}
                        {!currentConversation ? (
                            <button
                                onClick={startNewChat}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors shadow-sm flex-shrink-0"
                            >
                                <span className="hidden sm:inline">{PERSONAS.find(p => p.id === selectedPersona)?.emoji}</span>
                                <span className="truncate max-w-[80px] sm:max-w-none">{PERSONAS.find(p => p.id === selectedPersona)?.label}</span>
                                <span className="text-indigo-400">▾</span>
                            </button>
                        ) : (
                            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 flex-shrink-0 truncate max-w-[120px] sm:max-w-none">
                                <span className="hidden sm:inline">{PERSONAS.find(p => p.id === selectedPersona)?.emoji}</span>
                                <span className="truncate">{PERSONAS.find(p => p.id === selectedPersona)?.label}</span>
                            </span>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 min-h-0">
                        {/* Prefill context banner */}
                        {prefillContext && !currentConversation && (
                            <div className="mx-4 mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-2">
                                <span className="text-lg">💬</span>
                                <div>
                                    <p className="text-xs font-medium text-indigo-700 mb-0.5">ตอบจาก AI Reflection</p>
                                    <p className="text-xs text-indigo-600 line-clamp-2">{prefillContext}</p>
                                </div>
                                <button
                                    onClick={() => { setPrefillContext(null); setInput(''); }}
                                    className="ml-auto text-indigo-300 hover:text-indigo-500 text-xs"
                                >×</button>
                            </div>
                        )}

                        {!currentConversation && conversations.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Bot className="w-16 h-16 mb-4 opacity-20" />
                                <p>{t('chat.placeholder')}</p>
                            </div>
                        )}

                        {currentConversation?.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-slate-100 text-sage-600'
                                        }`}>
                                        {msg.sender === 'user' ? <UserIcon size={18} /> : <Bot size={20} />}
                                    </div>
                                    <div className={`px-5 py-3.5 rounded-[20px] shadow-sm ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
                                        }`}>
                                        <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="flex max-w-[85%] md:max-w-[75%] gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-slate-100 text-sage-600 flex items-center justify-center shadow-sm">
                                        <Bot size={20} />
                                    </div>
                                    <div className="bg-white border border-slate-100 shadow-sm px-5 py-4 rounded-[20px] rounded-tl-sm flex items-center gap-1.5 h-[52px]">
                                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 md:p-5 border-t border-slate-100 bg-white">
                        <div className="flex gap-3 max-w-4xl mx-auto items-end">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="พิมพ์ข้อความที่นี่... (Shift+Enter เพื่อขึ้นบรรทัดใหม่)"
                                className="flex-1 px-4 py-3 min-h-[52px] max-h-[160px] rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 focus:bg-white resize-none transition-all text-slate-700 placeholder-slate-400"
                                disabled={isLoading}
                                rows={1}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm flex-shrink-0"
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
