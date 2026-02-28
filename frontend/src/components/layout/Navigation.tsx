'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, User, LogOut, Menu, X, MessageSquare, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';



import { useLanguage } from '@/contexts/LanguageContext';

export function Navigation() {
    const pathname = usePathname();
    const { t, language, setLanguage } = useLanguage();

    const navItems = [
        { label: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { label: t('nav.journal'), href: '/journal', icon: BookOpen },
        { label: t('nav.chat'), href: '/chat', icon: MessageSquare },
        { label: t('nav.settings'), href: '/profile', icon: User },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-sage-200 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Leaf className="h-7 w-7 text-sage-600" />
                    <span className="text-xl font-semibold text-sage-800">Reflect</span>
                </Link>

                <div className="flex items-center gap-4">
                    {/* Navigation */}
                    <nav className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-sage-100 text-sage-800'
                                            : 'text-gray-600 hover:bg-sage-50 hover:text-sage-700'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Language Toggle */}
                    <button
                        onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                        className="flex items-center gap-1 rounded-full border border-sage-200 bg-white px-3 py-1 text-sm font-medium text-sage-600 hover:bg-sage-50 transition-colors"
                    >
                        <span>{language === 'th' ? '🇹🇭' : '🇬🇧'}</span>
                        <span className="uppercase">{language}</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
