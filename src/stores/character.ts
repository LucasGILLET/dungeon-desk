import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import {
    getCharacter,
    getCharacters,
    getGetCharactersQueryKey,
    useCreateCharacter,
    useUpdateCharacter,
} from '@/api/generated/endpoints';
import {
    toCharacterCreateInput,
    type Character,
    type CharacterSummary,
    type SavedCharacter,
} from '@/types/character';

// Message lisible : erreur réseau, ou erreurs de validation renvoyées par l'API
export const getErrorMessage = (err: unknown, fallback = 'Failed to load characters') => {
    if (err instanceof Error) return err.message;
    const body = err as { message?: string; errors?: { path: string; message: string }[] } | null;
    if (body?.errors?.length) return body.errors.map((e) => e.message).join(' · ');
    return body?.message ?? fallback;
};

const toSummary = (c: SavedCharacter): CharacterSummary => ({
    id: c.id,
    name: c.name,
    edition: c.edition ?? '2014',
    race: c.race,
    subrace: c.subrace ?? null,
    classes: c.classes.map((cc) => ({ class: cc.class, subclass: cc.subclass ?? null, level: cc.levels.length })),
    level: c.sheet?.level ?? c.classes.reduce((sum, cc) => sum + cc.levels.length, 0),
    names: c.names,
    updatedAt: c.updatedAt,
});

export const useCharacterStore = defineStore('character', () => {
    const queryClient = useQueryClient();
    const characters = ref<CharacterSummary[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const createCharacterMutation = useCreateCharacter();
    const updateCharacterMutation = useUpdateCharacter();

    const upsertCharacter = (next: CharacterSummary) => {
        const index = characters.value.findIndex((char) => char.id === next.id);
        if (index === -1) characters.value.unshift(next);
        else characters.value[index] = next;
    };

    const fetchCharacters = async () => {
        loading.value = true;
        error.value = null;
        try {
            const fetched = await queryClient.fetchQuery<CharacterSummary[]>({
                queryKey: getGetCharactersQueryKey(),
                queryFn: async () => (await getCharacters()).data as unknown as CharacterSummary[],
            });
            characters.value = fetched;
            return fetched;
        } catch (err) {
            error.value = getErrorMessage(err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchCharacter = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            return await queryClient.fetchQuery<SavedCharacter>({
                queryKey: ['characters', String(id)],
                queryFn: async () => (await getCharacter(String(id))).data as unknown as SavedCharacter,
            });
        } catch (err) {
            error.value = getErrorMessage(err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const saveCharacter = async (charData: Character) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await createCharacterMutation.mutateAsync({ data: toCharacterCreateInput(charData) });
            const saved = response.data as unknown as SavedCharacter;
            upsertCharacter(toSummary(saved));
            await queryClient.invalidateQueries({ queryKey: getGetCharactersQueryKey() });
            return { success: true, char: saved };
        } catch (err) {
            const message = getErrorMessage(err, 'Error creating character');
            error.value = message;
            return { success: false, error: message };
        } finally {
            loading.value = false;
        }
    };

    const updateCharacter = async (id: number | string, charData: Character) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await updateCharacterMutation.mutateAsync({ id: String(id), data: toCharacterCreateInput(charData) });
            const saved = response.data as unknown as SavedCharacter;
            upsertCharacter(toSummary(saved));
            await queryClient.invalidateQueries({ queryKey: getGetCharactersQueryKey() });
            queryClient.removeQueries({ queryKey: ['characters', String(id)] });
            return { success: true, char: saved };
        } catch (err) {
            const message = getErrorMessage(err, 'Error updating character');
            error.value = message;
            return { success: false, error: message };
        } finally {
            loading.value = false;
        }
    };

    return { characters, loading, error, fetchCharacters, fetchCharacter, saveCharacter, updateCharacter };
});
