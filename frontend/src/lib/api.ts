/**
 * API Client for Reflect Backend
 * Base URL: http://localhost:8000/api/v1
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ============================================================
// TOKEN MANAGEMENT
// ============================================================

let accessToken: string | null = null;

export function setToken(token: string) {
    accessToken = token;
    if (typeof window !== 'undefined') {
        localStorage.setItem('reflect_token', token);
    }
}

export function getToken(): string | null {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('reflect_token');
    }
    return accessToken;
}

export function clearToken() {
    accessToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('reflect_token');
    }
}

// ============================================================
// FETCH WRAPPER
// ============================================================

async function apiFetch(path: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        clearToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
        throw new Error('Unauthorized');
    }

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `API Error ${res.status}`);
    }

    if (res.status === 204) return null;
    return res.json();
}

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
    async register(email: string, password: string, persona: string = 'worker') {
        const data = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, persona }),
        });
        return data;
    },

    async login(email: string, password: string) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Login failed' }));
            throw new Error(error.detail);
        }

        const data = await res.json();
        setToken(data.access_token);
        return data;
    },

    async me() {
        return apiFetch('/auth/me');
    },

    logout() {
        clearToken();
    },
};

// ============================================================
// JOURNAL API
// ============================================================

export const journalApi = {
    async getEntries(params?: { skip?: number; limit?: number; start_date?: string; end_date?: string }) {
        const query = new URLSearchParams();
        if (params?.skip) query.set('skip', String(params.skip));
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.start_date) query.set('start_date', params.start_date);
        if (params?.end_date) query.set('end_date', params.end_date);

        const qs = query.toString();
        return apiFetch(`/journal${qs ? `?${qs}` : ''}`);
    },

    async getEntry(id: string) {
        return apiFetch(`/journal/${id}`);
    },

    async createEntry(content: string, entry_date?: string) {
        return apiFetch('/journal', {
            method: 'POST',
            body: JSON.stringify({ content, entry_date }),
        });
    },

    async updateEntry(id: string, content: string) {
        return apiFetch(`/journal/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ content }),
        });
    },

    async deleteEntry(id: string) {
        return apiFetch(`/journal/${id}`, { method: 'DELETE' });
    },

    async analyzeText(content: string) {
        return apiFetch('/journal/analyze', {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    },
};

// ============================================================
// USER API
// ============================================================

export const userApi = {
    async getProfile() {
        return apiFetch('/users/me');
    },

    async updateProfile(data: { persona?: string }) {
        return apiFetch('/users/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async getSettings() {
        return apiFetch('/users/me/settings');
    },

    async updateSettings(data: { email_notifications?: boolean; language?: string; theme?: string }) {
        return apiFetch('/users/me/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async exportData() {
        return apiFetch('/users/me/export', { method: 'POST' });
    },

    async deleteAccount() {
        return apiFetch('/users/me', { method: 'DELETE' });
    },
};

// ============================================================
// INSIGHTS API
// ============================================================

export const insightsApi = {
    async getDashboard(days: number = 7) {
        return apiFetch(`/insights/dashboard?days=${days}`);
    },

    async getTriggers() {
        return apiFetch('/insights/triggers');
    },
};

// ============================================================
// REFLECTION API
// ============================================================

export const reflectionApi = {
    async generate(entry_id: string, force_regenerate: boolean = false) {
        return apiFetch('/reflections/generate', {
            method: 'POST',
            body: JSON.stringify({ entry_id, force_regenerate }),
        });
    },

    async get(entry_id: string) {
        return apiFetch(`/reflections/${entry_id}`);
    }
};

// ============================================================
// CHAT API
// ============================================================

export const chatApi = {
    async getConversations() {
        return apiFetch('/chat');
    },

    async getConversation(id: string) {
        return apiFetch(`/chat/${id}`);
    },

    async sendMessage(message: string, conversation_id?: string, persona?: string) {
        return apiFetch('/chat/message', {
            method: 'POST',
            body: JSON.stringify({ message, conversation_id, persona }),
        });
    }
};
