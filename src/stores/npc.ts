import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import { authenticatedFetch } from '@/utils/api';

export const useNpcStore = defineStore('npc', () => {
    const npcs = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    
    const authStore = useAuthStore();
    const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/npcs`;

    const fetchNpcs = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await authenticatedFetch(API_URL);

            if (!response.ok) throw new Error('Failed to fetch NPCs');

            npcs.value = await response.json();
        } catch (err: any) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    const saveNpc = async (npcData: any) => {
        loading.value = true;
        error.value = null;
        try {
            // Prepare payload
            const payload = {
                name: `${npcData.firstName} ${npcData.lastName}`,
                race: npcData.race.name,
                class: npcData.class?.name,
                data: npcData
            };

            const response = await authenticatedFetch(API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to save NPC');

            const savedNpc = await response.json();
            npcs.value.unshift(savedNpc); // Add to local list
            return { success: true, npc: savedNpc };
        } catch (err: any) {
            error.value = err.message;
            return { success: false, error: err.message };
        } finally {
            loading.value = false;
        }
    };

    const deleteNpc = async (id: number) => {
        loading.value = true;
        try {
            const response = await authenticatedFetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete NPC');

            npcs.value = npcs.value.filter(n => n.id !== id);
        } catch (err: any) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    return { npcs, loading, error, fetchNpcs, saveNpc, deleteNpc };
});
