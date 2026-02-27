import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';

export const useAuthStore = defineStore('auth', () => {
    const { loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();

    const token = ref<string | null>(null);

    const login = async (options?: any) => {
        await loginWithRedirect(options);
    };

    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin } });
    };

    const getToken = async () => {
        try {
            const accessToken = await getAccessTokenSilently();
            token.value = accessToken;
            return accessToken;
        } catch (e) {
            console.error("Erreur lors de la récupération du token:", e);
            return null;
        }
    };

    return {
        user,
        isAuthenticated,
        login,
        logout: handleLogout,
        getToken,
        token
    };
});
