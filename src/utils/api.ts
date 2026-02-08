import { useAuthStore } from '@/stores/auth';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
    const authStore = useAuthStore();
    const token = authStore.token;

    // Default headers, can be overridden
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        authStore.logout();
        throw new Error("Session expired");
    }

    return response;
}
