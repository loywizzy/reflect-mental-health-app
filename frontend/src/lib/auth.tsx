'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getToken, clearToken } from '@/lib/api';

interface User {
    id: string;
    email: string;
    persona: string;
    plan: 'free' | 'pro' | 'admin';
    ai_usage_count: number;
    ai_usage_limit: number;
    is_active: boolean;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, persona?: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const token = getToken();
            if (!token) {
                setUser(null);
                return;
            }
            const userData = await authApi.me();
            setUser(userData);
        } catch {
            setUser(null);
            clearToken();
        }
    };

    useEffect(() => {
        refreshUser().finally(() => setIsLoading(false));
    }, []);

    const login = async (email: string, password: string) => {
        await authApi.login(email, password);
        await refreshUser();
    };

    const register = async (email: string, password: string, persona: string = 'worker') => {
        await authApi.register(email, password, persona);
        await authApi.login(email, password);
        await refreshUser();
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isLoggedIn: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
