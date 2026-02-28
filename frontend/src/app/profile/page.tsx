'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Settings, Download, Trash2, Shield, Loader2, Zap, Check, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { userApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Modal } from '@/components/ui/Modal';

const PERSONA_OPTIONS = ['student', 'worker', 'teen'];
const PLAN_OPTIONS = ['free', 'pro'];

export default function ProfilePage() {
    const { user, isLoading: authLoading, isLoggedIn, logout, refreshUser } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPersona, setSelectedPersona] = useState('worker');
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingPlan, setPendingPlan] = useState<string | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push('/');
            return;
        }
        if (isLoggedIn) {
            loadProfile();
        }
    }, [authLoading, isLoggedIn, router]);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await userApi.getProfile();
            setProfile(data);
            setSelectedPersona(data.persona);
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePersonaChange = async (persona: string) => {
        try {
            setIsSaving(true);
            setSelectedPersona(persona);
            await userApi.updateProfile({ persona });
            await refreshUser();
        } catch (err) {
            console.error('Failed to update persona:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenUpgradeModal = (plan: string) => {
        if (plan === 'pro' && profile?.plan === 'free') {
            setPendingPlan(plan);
            setIsModalOpen(true);
        } else {
            handlePlanChange(plan);
        }
    };

    const confirmUpgrade = async () => {
        if (!pendingPlan) return;
        await handlePlanChange(pendingPlan);
        setIsModalOpen(false);
        setPendingPlan(null);
    };

    const handlePlanChange = async (plan: string) => {
        try {
            setIsSaving(true);
            await userApi.updateProfile({ plan });
            await loadProfile();
            await refreshUser();
        } catch (err) {
            console.error('Failed to update plan:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        try {
            const data = await userApi.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reflect-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export:', err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t('profile.deleteConfirm'))) return;
        try {
            await userApi.deleteAccount();
            logout();
            router.push('/');
        } catch (err) {
            console.error('Failed to delete account:', err);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-sage-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-sage-600 animate-spin" />
            </div>
        );
    }

    const usagePercent = profile ? Math.min((profile.ai_usage_count / profile.ai_usage_limit) * 100, 100) : 0;
    const isOverLimit = usagePercent >= 100;

    return (
        <div className="min-h-screen bg-sage-50">
            <Navigation />

            <main className="container mx-auto max-w-2xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">👤 {t('profile.title')}</h1>
                    <p className="text-gray-600">{t('profile.manageAccount')}</p>
                </div>

                {/* User Info */}
                <Card className="mb-6 animate-fade-in">
                    <CardHeader>
                        <CardTitle icon={<User className="h-5 w-5 text-sage-600" />}>
                            {t('profile.yourInfo')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('profile.email')}</p>
                                <p className="text-gray-800 font-medium">{user?.email || '-'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">{t('profile.journalCount')}</p>
                                    <p className="text-2xl font-bold text-sage-700">{profile?.journal_count || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('profile.memberSince')}</p>
                                    <p className="text-2xl font-bold text-sage-700">{profile?.days_active || 0} {t('profile.unitDays')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Plan & AI Usage */}
                <Card className="mb-6 animate-fade-in border-sage-200 bg-gradient-to-br from-white to-sage-50/30">
                    <CardHeader>
                        <CardTitle icon={<Zap className="h-5 w-5 text-sage-600" />}>
                            {t('profile.plan')} & {t('profile.aiUsage')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        profile?.plan === 'pro' ? 'bg-purple-100 text-purple-700' : 
                                        profile?.plan === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-sage-100 text-sage-700'
                                    }`}>
                                        {profile?.plan === 'pro' ? t('profile.pro') : profile?.plan === 'admin' ? 'Admin' : t('profile.free')}
                                    </span>
                                    {profile?.plan === 'free' && (
                                        <button className="text-xs font-semibold text-sage-600 hover:text-sage-800 transition-colors">
                                            ✨ {t('profile.upgrade')}
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-gray-600">
                                    {profile?.ai_usage_count} / {profile?.ai_usage_limit}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className={`h-full transition-all duration-500 ease-out ${
                                            isOverLimit ? 'bg-orange-500' : usagePercent > 80 ? 'bg-yellow-500' : 'bg-sage-500'
                                        }`}
                                        style={{ width: `${usagePercent}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 text-right">
                                    {isOverLimit ? 'โควต้าเต็มแล้วสำหรับวันนี้' : `เหลืออีก ${profile?.ai_usage_limit - profile?.ai_usage_count} ครั้งของวันนี้`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Plan Selection */}
                <Card className="mb-6 animate-fade-in">
                    <CardHeader>
                        <CardTitle icon={<Zap className="h-5 w-5 text-sage-600" />}>
                            {t('profile.plan')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Free Plan */}
                            <div className={cn(
                                "relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between",
                                profile?.plan === 'free' ? "border-sage-400 bg-sage-50/50 shadow-sm" : "border-gray-100 hover:border-sage-200"
                            )}>
                                {profile?.plan === 'free' && (
                                    <span className="absolute -top-2.5 -right-2.5 bg-sage-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <Check className="w-3 h-3" /> {t('profile.currentPlan')}
                                    </span>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-1">{t('profile.free')}</h3>
                                    <p className="text-2xl font-black text-gray-900 mb-3">{t('profile.planPriceFree')}</p>
                                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                        {t('profile.planFreeDesc')}
                                    </p>
                                </div>
                                <Button 
                                    variant={profile?.plan === 'free' ? "secondary" : "outline"}
                                    disabled={profile?.plan === 'free' || isSaving}
                                    className="w-full text-xs py-2 h-auto"
                                    onClick={() => handlePlanChange('free')}
                                >
                                    {profile?.plan === 'free' ? t('profile.currentPlan') : t('profile.selectPlan')}
                                </Button>
                            </div>

                            {/* Pro Plan */}
                            <div className={cn(
                                "relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between",
                                profile?.plan === 'pro' ? "border-purple-400 bg-purple-50/50 shadow-sm" : "border-gray-100 hover:border-purple-200"
                            )}>
                                {profile?.plan === 'pro' && (
                                    <span className="absolute -top-2.5 -right-2.5 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <Check className="w-3 h-3" /> {t('profile.currentPlan')}
                                    </span>
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-800 text-lg">{t('profile.pro')}</h3>
                                        <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded uppercase">Best Value</span>
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 mb-3">{t('profile.planPricePro')}</p>
                                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                        {t('profile.planProDesc')}
                                    </p>
                                </div>
                                <Button 
                                    variant={profile?.plan === 'pro' ? "secondary" : "primary"}
                                    disabled={profile?.plan === 'pro' || isSaving}
                                    className={cn("w-full text-xs py-2 h-auto", profile?.plan !== 'pro' && "bg-purple-600 hover:bg-purple-700 border-none")}
                                    onClick={() => handleOpenUpgradeModal('pro')}
                                >
                                    {profile?.plan === 'pro' ? t('profile.currentPlan') : t('profile.selectPlan')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Persona */}
                <Card className="mb-6 animate-fade-in">
                    <CardHeader>
                        <CardTitle icon={<Settings className="h-5 w-5 text-sage-600" />}>
                            {t('settings.persona')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            {t('profile.personaHelp')}
                        </p>
                        <div className="space-y-3">
                            {PERSONA_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handlePersonaChange(option)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedPersona === option
                                        ? 'border-sage-400 bg-sage-50'
                                        : 'border-gray-200 bg-white hover:border-sage-200'
                                        }`}
                                >
                                    <div className="font-medium text-gray-800">{t(`persona.${option}.label`)}</div>
                                    <div className="text-sm text-gray-500">{t(`persona.${option}.desc`)}</div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="mb-6 animate-fade-in">
                    <CardHeader>
                        <CardTitle icon={<Shield className="h-5 w-5 text-sage-600" />}>
                            {t('profile.yourInfo')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            {t('profile.dataOwner')}
                        </p>
                        <div className="space-y-3">
                            <Button variant="secondary" className="w-full justify-center" onClick={handleExport}>
                                <Download className="h-4 w-4" /> {t('profile.downloadData')}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-center text-red-500 border-red-200 hover:bg-red-50"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-4 w-4" /> {t('profile.deleteAccount')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Logout */}
                <div className="text-center">
                    <Button variant="ghost" onClick={() => { logout(); router.push('/'); }}>
                        {t('nav.logout')}
                    </Button>
                </div>

                {/* Upgrade Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={t('profile.upgradeTitle')}
                    description={t('profile.upgradeDesc')}
                    footer={
                        <>
                            <Button 
                                className="bg-purple-600 hover:bg-purple-700 border-none text-white w-full sm:w-auto"
                                onClick={confirmUpgrade}
                                isLoading={isSaving}
                            >
                                {t('profile.upgradeConfirm')}
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="w-full sm:w-auto"
                                onClick={() => setIsModalOpen(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-4 py-2">
                        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                            <span className="font-bold text-purple-700">{t('profile.pro')} Plan</span>
                            <span className="text-xl font-black text-purple-900">{t('profile.planPricePro')}</span>
                        </div>
                        
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                    <CheckCircle className="w-5 h-5 text-purple-500 shrink-0" />
                                    <span>{t(`profile.upgradeFeature${i}` as any)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            </main>
        </div>
    );
}
