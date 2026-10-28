<template>
  <div class="text-left md:text-right">
    <form v-if="editing" class="flex flex-wrap items-start gap-2 md:justify-end" @submit.prevent="save">
      <div class="w-56">
        <input
          ref="input"
          v-model="draft"
          class="ui-input"
          aria-label="Pseudo"
          maxlength="30"
          :aria-invalid="!!error"
          aria-describedby="username-help"
          @keydown.esc="cancel"
        />
        <p id="username-help" class="mt-1 text-xs" :class="error ? 'text-red-400' : 'text-zinc-500'" :role="error ? 'alert' : undefined">
          {{ error ?? 'Visible par les joueurs de vos campagnes.' }}
        </p>
      </div>
      <button type="submit" class="ui-btn-primary" :disabled="saving || !changed">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
      <button type="button" class="ui-btn" :disabled="saving" @click="cancel">Annuler</button>
    </form>
    <template v-else>
      <div v-if="loading" class="ui-skeleton h-5 w-32 md:ml-auto" aria-hidden="true" />
      <div v-else class="flex items-center gap-2 md:justify-end">
        <span class="text-white font-bold">{{ displayName }}</span>
        <button
          type="button"
          class="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-amber-400"
          title="Modifier le pseudo"
          aria-label="Modifier le pseudo"
          @click="edit"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.232-6.232a2.5 2.5 0 113.536 3.536L12.536 16.536 9 17l.464-3.536z" />
          </svg>
        </button>
      </div>
      <p v-if="saved" class="text-xs text-emerald-400" role="status">Pseudo enregistré.</p>
    </template>
    <div class="text-xs text-zinc-500">{{ email }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { profileApi, type Profile } from '@/api/profile'

const props = defineProps<{ fallbackName?: string; fallbackEmail?: string }>()

const profile = ref<Profile | null>(null)
const loading = ref(true)
const editing = ref(false)
const saving = ref(false)
const saved = ref(false)
const draft = ref('')
const error = ref<string | null>(null)
const input = ref<HTMLInputElement | null>(null)

const displayName = computed(() => profile.value?.username || props.fallbackName || 'Aventurier')
const email = computed(() => profile.value?.email ?? props.fallbackEmail)
const changed = computed(() => draft.value.trim() !== '' && draft.value.trim() !== (profile.value?.username ?? ''))

async function edit() {
  draft.value = profile.value?.username ?? ''
  error.value = null
  saved.value = false
  editing.value = true
  await nextTick()
  input.value?.select()
}

function cancel() {
  editing.value = false
  error.value = null
}

async function save() {
  saving.value = true
  error.value = null
  try {
    profile.value = await profileApi.updateUsername(draft.value)
    editing.value = false
    saved.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Impossible d'enregistrer le pseudo."
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    profile.value = await profileApi.get()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
