import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import { authenticatedFetch } from '@/utils/api';

export const useCharacterStore = defineStore('character', () => {
    const characters = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    
    const authStore = useAuthStore();
    const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/characters`;

    const fetchCharacters = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await authenticatedFetch(API_URL);

            if (!response.ok) throw new Error('Failed to fetch characters');

            characters.value = await response.json();
        } catch (err: any) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    const fetchCharacter = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await authenticatedFetch(`${API_URL}/${id}`);

            if (!response.ok) throw new Error('Failed to fetch character');
            
            return await response.json();
        } catch(err: any){
            error.value = err.message;
             throw err;
        } finally {
            loading.value = false;
        }
    }

    const saveCharacter = async (charData: any) => {
        loading.value = true;
        error.value = null;
        try {
            // Extract main fields for the DB columns
            const payload = {
                name: charData.name,
                race: charData.race.name,
                class: charData.class.name,
                level: charData.level,
                data: charData
            };

            const response = await authenticatedFetch(API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to save character');
            
            const newChar = await response.json();
            characters.value.push(newChar);
            return { success: true, char: newChar };
        } catch (err: any) {
            error.value = err.message;
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    return { characters, loading, error, fetchCharacters, fetchCharacter, saveCharacter };
});
