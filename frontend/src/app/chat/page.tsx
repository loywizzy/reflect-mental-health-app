'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { chatApi } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, User as UserIcon, Bot, Plus, Menu, X, Sparkles, History, MessageCircle } from 'lucide-react';
import { Navigation } from '@/components/layout/Navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

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

    useEffect(() => {
        const prefill = searchParams.get('prefill');
        if (prefill) {
            setInput(prefill);
            setPrefillContext(prefill);
            setCurrentConversation(null);
        }
    }, [searchParams]);

    useEffect(() => {
        const convId = searchParams.get('conv');
        if (convId) {
            fetchConversationDetails(convId);
        }
    }, [searchParams]);

    useEffect(() => {
        const initChat = async () => {
            await fetchConversations();
            
            const urlConv = searchParams.get('conv');
            const urlPrefill = searchParams.get('prefill');
            
            // Auto-load most recent if nothing specified
            if (!urlConv && !urlPrefill) {
                const data = await chatApi.getConversations();
                if (data.length > 0) {
                    fetchConversationDetails(data[0].id);
                }
            }
        };
        initChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentConversation?.messages, isLoading]);

    const fetchConversations = async () => {
        try {
            const data = await chatApi.getConversations();
            setConversations(data);
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

    const getPersonaInfo = (id: string) => PERSONAS.find(p => p.id === id) || PERSONAS[0];

    return (
        <div className="flex flex-col h-screen bg-white">
            <Navigation />

            {/* Persona Picker Overlay */}
            {showPersonaPicker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-sage-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">เลือกบุคลิก AI</h3>
                            <p className="text-sm text-gray-500 mt-1">ให้ AI ปรับโทนให้เหมาะกับเรื่องที่คุณต้องการปรึกษา</p>
                        </div>

                        <div className="space-y-3">
                            {PERSONAS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => confirmPersonaAndStart(p.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                                        selectedPersona === p.id
                                            ? "border-sage-500 bg-sage-50 ring-4 ring-sage-500/10"
                                            : "border-gray-100 bg-gray-50 hover:border-sage-200"
                                    )}
                                >
                                    <span className="text-3xl">{p.emoji}</span>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{p.label}</p>
                                        <p className="text-[11px] text-gray-500 leading-tight">{p.desc}</p>
                                    </div>
                                    {selectedPersona === p.id && (
                                        <div className="w-5 h-5 bg-sage-500 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowPersonaPicker(false)}
                            className="mt-6 w-full py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Mobile Sidebar Toggle - Floating */}
                {!showSidebar && (
                    <button 
                        onClick={() => setShowSidebar(true)}
                        className="lg:hidden fixed bottom-24 left-4 z-40 bg-sage-600 text-white p-3 rounded-2xl shadow-lg animate-in slide-in-from-left duration-300"
                    >
                        <History className="w-6 h-6" />
                    </button>
                )}

                {/* Sidebar (Conversations History) */}
                <aside className={cn(
                    "fixed lg:relative inset-y-0 left-0 z-50 w-80 lg:w-72 bg-gray-50 border-r border-gray-100 flex flex-col transform transition-transform duration-300 ease-out",
                    showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}>
                    <div className="p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <History className="w-4 h-4 text-gray-400" />
                                {t('chat.title')}
                            </h2>
                            <button onClick={() => setShowSidebar(false)} className="lg:hidden p-1 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <Button 
                            onClick={() => { startNewChat(); setShowSidebar(false); }}
                            className="w-full justify-start gap-2 mb-6 shadow-sm py-6 bg-sage-600 hover:bg-sage-700"
                        >
                            <Plus className="w-4 h-4" /> {t('chat.newChat')}
                        </Button>

                        <div className="flex-1 overflow-y-auto space-y-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => { fetchConversationDetails(conv.id); setShowSidebar(false); }}
                                    className={cn(
                                        "w-full text-left px-4 py-3.5 rounded-2xl text-sm transition-all flex items-center gap-3",
                                        currentConversation?.id === conv.id 
                                            ? "bg-white text-sage-700 font-bold shadow-sm ring-1 ring-black/5" 
                                            : "text-gray-500 hover:bg-white/50 hover:text-gray-700"
                                    )}
                                >
                                    <MessageCircle className={cn("w-4 h-4 flex-shrink-0", currentConversation?.id === conv.id ? "text-sage-500" : "text-gray-300")} />
                                    <span className="truncate">{conv.title || t('chat.newChat')}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 p-4 rounded-2xl bg-sage-100/50 border border-sage-200/50">
                            <p className="text-[10px] font-bold text-sage-700 uppercase tracking-widest mb-1">Your AI Persona</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{getPersonaInfo(selectedPersona).emoji}</span>
                                <span className="text-xs font-semibold text-sage-800">{getPersonaInfo(selectedPersona).label}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-white relative">
                    
                    {/* Chat Header */}
                    <div className="h-16 border-b border-gray-100 flex items-center px-6 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                className="lg:hidden p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-xl"
                                onClick={() => setShowSidebar(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="flex flex-col min-w-0">
                                <h2 className="font-bold text-gray-900 truncate">
                                    {currentConversation ? (currentConversation.title || t('chat.newChat')) : t('chat.newChat')}
                                </h2>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    AI Reflection Mode
                                </div>
                            </div>
                        </div>

                        {/* Active Persona Badge */}
                        <button
                            onClick={startNewChat}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 transition-all group"
                        >
                            <span className="text-sm">{getPersonaInfo(selectedPersona).emoji}</span>
                            <span className="text-xs font-bold hidden sm:inline">{getPersonaInfo(selectedPersona).label}</span>
                            {!currentConversation && <Sparkles className="w-3 h-3 text-sage-500 group-hover:rotate-12 transition-transform" />}
                        </button>
                    </div>

                    {/* Messages Window */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-white scroll-smooth">
                        
                        {/* Context Banner */}
                        {prefillContext && !currentConversation && (
                            <div className="max-w-2xl mx-auto p-4 rounded-3xl bg-sage-50 border border-sage-100 flex items-start gap-4 animate-in slide-in-from-top duration-500">
                                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                                    <Sparkles className="w-5 h-5 text-sage-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-sage-600 uppercase tracking-widest mb-1">Context from Reflection</p>
                                    <p className="text-sm text-sage-800 leading-relaxed italic">&quot;{prefillContext}&quot;</p>
                                </div>
                                <button
                                    onClick={() => { setPrefillContext(null); setInput(''); }}
                                    className="p-1 text-sage-300 hover:text-sage-500 transition-colors"
                                ><X className="w-4 h-4" /></button>
                            </div>
                        )}

                        {/* Welcome State */}
                        {!currentConversation && conversations.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-in fade-in zoom-in duration-700">
                                <div className="w-20 h-20 bg-sage-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
                                    <Bot className="w-10 h-10 text-sage-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">เริ่มบทสนทนาใหม่</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">พิมพ์ความรู้สึกหรือเรื่องที่คุณอยากคุยได้เลย AI พร้อมรับฟังและสะท้อนมุมมองที่ช่วยให้คุณเข้าใจตัวเองมากขึ้น</p>
                            </div>
                        )}

                        {/* Messages List */}
                        <div className="max-w-3xl mx-auto space-y-8">
                            {currentConversation?.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-full animate-in duration-300",
                                        msg.sender === 'user' ? "justify-end slide-in-from-right-4" : "justify-start slide-in-from-left-4"
                                    )}
                                >
                                    <div className={cn(
                                        "flex gap-3 md:gap-4 max-w-[90%] md:max-w-[80%]",
                                        msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        <div className={cn(
                                            "w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                                            msg.sender === 'user' ? "bg-sage-600 text-white" : "bg-white border border-gray-100 text-sage-600"
                                        )}>
                                            {msg.sender === 'user' ? <UserIcon size={16} className="md:w-5 md:h-5" /> : <Bot size={18} className="md:w-6 md:h-6" />}
                                        </div>
                                        <div className={cn(
                                            "px-5 py-3.5 rounded-[2rem] shadow-sm text-[15px] leading-relaxed",
                                            msg.sender === 'user'
                                                ? "bg-sage-600 text-white rounded-tr-sm"
                                                : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm"
                                        )}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            <p className={cn(
                                                "text-[9px] mt-2 opacity-50 font-medium uppercase tracking-tighter",
                                                msg.sender === 'user' ? "text-right" : "text-left"
                                            )}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Thinking State */}
                            {isLoading && (
                                <div className="flex w-full justify-start animate-in fade-in duration-300">
                                    <div className="flex gap-3 md:gap-4">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-white border border-gray-100 text-sage-600 flex items-center justify-center shadow-sm">
                                            <Bot size={18} className="md:w-6 md:h-6" />
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 shadow-sm px-6 py-4 rounded-[2rem] rounded-tl-sm flex items-center gap-1.5 h-[52px]">
                                            <div className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce duration-700" />
                                            <div className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce duration-700 [animation-delay:0.2s]" />
                                            <div className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce duration-700 [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div ref={messagesEndRef} className="h-4" />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-8 bg-white border-t border-gray-100">
                        <div className="max-w-3xl mx-auto relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-sage-200 to-sage-100 rounded-[3rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
                            <div className="relative flex gap-3 items-end bg-gray-50 border border-gray-200 rounded-[3rem] p-2 pr-3 focus-within:bg-white focus-within:border-sage-400 transition-all shadow-inner-sm">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="เล่าความรู้สึกของคุณให้ AI ฟัง..."
                                    className="flex-1 px-5 py-3 min-h-[56px] max-h-[200px] bg-transparent border-none focus:ring-0 text-[15px] text-gray-800 placeholder-gray-400 resize-none scrollbar-none"
                                    disabled={isLoading}
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="p-3.5 bg-sage-600 text-white rounded-full hover:bg-sage-700 disabled:opacity-30 disabled:grayscale transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </div>
                            <p className="mt-3 text-center text-[10px] text-gray-400 font-medium">
                                AI Reflection is here to listen and reflect, not to diagnose or advise.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
