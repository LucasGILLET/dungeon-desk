import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
    getNpcs,
    getGetNpcsQueryKey,
    usePostNpcs,
} from '@/api/generated/endpoints';
import { authenticatedFetch, buildApiUrl } from '@/utils/api';

export const useNpcStore = defineStore('npc', () => {
    const queryClient = useQueryClient();
    const npcs = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const createNpcMutation = usePostNpcs();
    const deleteNpcMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await authenticatedFetch(buildApiUrl(`/npcs/${id}`), {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete NPC');
            }

            return response.json();
        },
    });

    const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : 'Failed to load NPCs';

    const upsertNpc = (nextNpc: any) => {
        const index = npcs.value.findIndex((npc) => npc.id === nextNpc.id);

        if (index === -1) {
            npcs.value.unshift(nextNpc);
            return;
        }

        npcs.value[index] = nextNpc;
    };

    const fetchNpcs = async () => {
        loading.value = true;
        error.value = null;
        try {
            const fetchedNpcs = await queryClient.fetchQuery<any[]>({
                queryKey: getGetNpcsQueryKey(),
                queryFn: async () => {
                    const response = await getNpcs();
                    return response.data as unknown as any[];
                },
            });

            npcs.value = fetchedNpcs;
            return fetchedNpcs;
        } catch (err) {
            error.value = getErrorMessage(err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const saveNpc = async (npcData: any) => {
        loading.value = true;
        error.value = null;
        try {
            const payload = {
                name: `${npcData.firstName} ${npcData.lastName}`,
                race: npcData.race.name,
                class: npcData.class?.name,
                data: npcData
            };

            const response = await createNpcMutation.mutateAsync({
                data: payload,
            });
            const savedNpc = response.data;

            upsertNpc(savedNpc);
            await queryClient.invalidateQueries({ queryKey: getGetNpcsQueryKey() });

            return { success: true, npc: savedNpc };
        } catch (err) {
            const message = getErrorMessage(err);
            error.value = message;
            return { success: false, error: message };
        } finally {
            loading.value = false;
        }
    };

    const deleteNpc = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            await deleteNpcMutation.mutateAsync(id);

            npcs.value = npcs.value.filter((npc) => npc.id !== id);
            await queryClient.invalidateQueries({ queryKey: getGetNpcsQueryKey() });
        } catch (err) {
            error.value = getErrorMessage(err);
        } finally {
            loading.value = false;
        }
    };

    return { npcs, loading, error, fetchNpcs, saveNpc, deleteNpc };
});
