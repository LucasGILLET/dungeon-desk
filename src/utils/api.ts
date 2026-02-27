import { useAuthStore } from '@/stores/auth';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
    const authStore = useAuthStore();
    let token = authStore.token;

    if (!token) {
        token = await authStore.getToken();
    }

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
        // Token might be expired, try to refresh once
        const newToken = await authStore.getToken();
        if (newToken && newToken !== token) {
             headers['Authorization'] = `Bearer ${newToken}`;
             return fetch(url, { ...options, headers });
        } else {
             // Si le refresh échoue ou que le token est le même, c'est une vraie erreur 401
             console.error("401 Unauthorized - Logout triggered");
             // authStore.logout(); // <-- COMMENTÉ: Éviter la déconnexion automatique brutale pour le debug
             throw new Error("Session expired or Unauthorized");
        }
    }

    return response;
}
