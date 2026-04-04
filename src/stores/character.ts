import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import { authenticatedFetch, buildApiUrl } from '@/utils/api';

export const useCharacterStore = defineStore('character', () => {
    const characters = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    
    const authStore = useAuthStore();
    const API_URL = buildApiUrl('/characters');

    const fetchCharacters = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await authenticatedFetch(API_URL);

            if (!response.ok) throw new Error('Failed to fetch characters');

            const rawCharacters = await response.json();
            
            // Map the nested DB structure { id, name, level, data: { ... } } back to UI flat structure
            characters.value = rawCharacters.map((char: any) => ({
                id: char.id,
                name: char.name,
                level: char.level,
                createdAt: char.createdAt,
                updatedAt: char.updatedAt,
                userId: char.userId,
                // Flatten the 'data' JSON content into the top level
                ...char.data
            }));
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
            
            const rawChar = await response.json();
            
            // Return flattened structure
            return {
                id: rawChar.id,
                name: rawChar.name,
                level: rawChar.level,
                createdAt: rawChar.createdAt,
                updatedAt: rawChar.updatedAt,
                userId: rawChar.userId,
                ...rawChar.data
            };
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
            // Prepare payload for backend: { name, level, data: FLATTENED_OBJECT }
            // The backend expects the rich data inside 'data'
            const payload = {
                name: charData.name,
                level: charData.level,
                data: charData // We send the whole object as data, backend will validate
            };

            const response = await authenticatedFetch(API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to save character');
            
            const newRawChar = await response.json();
            
            // Flatten the response before adding to store
            const newChar = {
                id: newRawChar.id,
                name: newRawChar.name,
                level: newRawChar.level,
                createdAt: newRawChar.createdAt,
                updatedAt: newRawChar.updatedAt,
                userId: newRawChar.userId,
                ...newRawChar.data
            };

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
