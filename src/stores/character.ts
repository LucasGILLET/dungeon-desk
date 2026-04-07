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
    mapApiCharacterToCharacter,
    toCharacterCreateInput,
    type ApiCharacterModel,
    type Character,
} from '@/types/character';

export const useCharacterStore = defineStore('character', () => {
    const queryClient = useQueryClient();
    const characters = ref<Character[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const createCharacterMutation = useCreateCharacter();
    const updateCharacterMutation = useUpdateCharacter();

    const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : 'Failed to load characters';

    const upsertCharacter = (nextCharacter: Character) => {
        const index = characters.value.findIndex((char) => char.id === nextCharacter.id);

        if (index === -1) {
            characters.value.unshift(nextCharacter);
            return;
        }

        characters.value[index] = nextCharacter;
    };

    const fetchCharacters = async () => {
        loading.value = true;
        error.value = null;
        try {
            const fetchedCharacters = await queryClient.fetchQuery<Character[]>({
                queryKey: getGetCharactersQueryKey(),
                queryFn: async () => {
                    const response = await getCharacters();
                    return response.data.map((character) => mapApiCharacterToCharacter(character as ApiCharacterModel));
                },
            });

            characters.value = fetchedCharacters;
            return fetchedCharacters;
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
            return await queryClient.fetchQuery<Character>({
                queryKey: ['characters', String(id)],
                queryFn: async () => {
                    const response = await getCharacter(String(id));
                    return mapApiCharacterToCharacter(response.data as ApiCharacterModel);
                },
            });
        } catch (err) {
            error.value = getErrorMessage(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    const saveCharacter = async (charData: Character) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await createCharacterMutation.mutateAsync({
                data: toCharacterCreateInput(charData as Character),
            });
            const newCharacter = mapApiCharacterToCharacter(response.data as ApiCharacterModel);

            upsertCharacter(newCharacter);
            await queryClient.invalidateQueries({ queryKey: getGetCharactersQueryKey() });

            return { success: true, char: newCharacter };
        } catch (err) {
            const message = getErrorMessage(err);
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
            const response = await updateCharacterMutation.mutateAsync({
                id: String(id),
                data: toCharacterCreateInput(charData as Character),
            });
            const updatedCharacter = mapApiCharacterToCharacter(response.data as ApiCharacterModel);

            upsertCharacter(updatedCharacter);
            await queryClient.invalidateQueries({ queryKey: getGetCharactersQueryKey() });

            return { success: true, char: updatedCharacter };
        } catch (err) {
            const message = getErrorMessage(err);
            error.value = message;
            return { success: false, error: message };
        } finally {
            loading.value = false;
        }
    };

    return { characters, loading, error, fetchCharacters, fetchCharacter, saveCharacter, updateCharacter };
});
