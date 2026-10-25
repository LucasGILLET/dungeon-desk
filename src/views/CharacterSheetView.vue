<template>
  <div class="min-h-[calc(100vh-5rem)] bg-zinc-950 text-zinc-200 px-4 sm:px-6 lg:px-10 py-8">
    <div v-if="loadError" class="max-w-xl mx-auto mt-20 p-6 rounded-xl border border-red-900/50 bg-red-950/30 text-red-300 text-center">
      Impossible de charger le personnage : {{ loadError }}
      <router-link to="/profile" class="block mt-3 text-sm underline">Retour au profil</router-link>
    </div>

    <SkeletonSheet v-else-if="!saved || !input" />

    <div v-else class="max-w-7xl mx-auto space-y-6">
      <!-- En-tête -->
      <header class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <router-link v-if="shared" to="/" class="text-xs text-zinc-500 hover:text-zinc-300">← Dungeon Desk</router-link>
          <router-link v-else-if="readOnly" :to="{ name: 'gm-dashboard' }" class="text-xs text-zinc-500 hover:text-zinc-300">← Mes campagnes</router-link>
          <router-link v-else to="/profile" class="text-xs text-zinc-500 hover:text-zinc-300">← Mes personnages</router-link>
          <h1 class="text-3xl sm:text-4xl font-bold font-serif text-white mt-1">{{ input.name }}</h1>
          <p class="text-zinc-400 mt-1">
            {{ saved.names.subrace || saved.names.race }}
            · {{ saved.names.classes.map((c) => `${c.class}${c.subclass ? ` (${c.subclass})` : ''} ${c.level}`).join(' / ') }}
            <span v-if="saved.names.background"> · {{ saved.names.background }}</span>
          </p>
        </div>
        <div v-if="readOnly" class="flex flex-wrap items-center gap-2">
          <p class="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">
            {{ shared ? `Fiche partagée par ${saved.sharedBy} : lecture seule` : "Fiche d'un joueur de votre campagne : lecture seule" }}
          </p>
          <template v-if="shared">
            <button v-if="authStore.isAuthenticated" class="btn-primary" :disabled="copying" @click="copyToMine">{{ copying ? 'Copie…' : 'Copier dans mes personnages' }}</button>
            <button v-else class="btn-secondary" @click="authStore.login()">Se connecter pour la copier</button>
          </template>
          <button class="btn-secondary" :disabled="exporting" @click="exportPdf">{{ exporting ? 'Préparation…' : 'Télécharger le PDF' }}</button>
        </div>
        <div v-else class="flex flex-wrap items-center gap-2">
          <span class="text-xs mr-2" :class="saveStatusClass">{{ saveStatusLabel }}</span>
          <button class="btn-secondary" @click="levelUpMode = 'complete'" v-if="hasPending">Compléter</button>
          <button class="btn-primary" :disabled="sheet.level >= 20" @click="levelUpMode = 'level'">Monter de niveau</button>
          <!-- Actions moins fréquentes, regroupées -->
          <ActionsMenu label="Actions">
            <p class="menu-group">Personnage</p>
            <button type="button" role="menuitem" class="menu-item" @click="levelUpMode = 'edit'">Modifier mes choix</button>
            <button type="button" role="menuitem" class="menu-item" :disabled="sheet.level <= 1 || removingLevel" @click="removeLevel">{{ removingLevel ? 'Retrait…' : 'Retirer un niveau' }}</button>
            <router-link role="menuitem" :to="`/character/${saved.id}/edit`" class="menu-item">Modifier la création</router-link>
            <p class="menu-group">Exporter</p>
            <button type="button" role="menuitem" class="menu-item" :disabled="exporting" @click="exportPdf">{{ exporting ? 'Préparation…' : 'Télécharger le PDF' }}</button>
            <button type="button" role="menuitem" class="menu-item" @click="shareOpen = !shareOpen">{{ shareOpen ? 'Masquer le partage' : 'Partager' }}</button>
          </ActionsMenu>
        </div>
      </header>
      <!-- Partage par lien (propriétaire) -->
      <div v-if="shareOpen && !readOnly" class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-sm">
        <p class="text-zinc-400 mb-3">
          Toute personne qui a le lien voit cette fiche, sans pouvoir la modifier, et peut la copier dans ses personnages.
          Un nouveau lien remplace l'ancien.
        </p>
        <template v-if="saved.shareCode">
          <div class="flex gap-2">
            <input :value="characterShareUrl(saved.shareCode)" readonly class="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 font-mono text-xs text-zinc-100" aria-label="Lien de partage" @focus="($event.target as HTMLInputElement).select()" />
            <button class="btn-secondary" @click="copyShareLink">{{ linkCopied ? 'Copié' : 'Copier' }}</button>
          </div>
          <div class="mt-2 flex gap-3 text-xs">
            <button class="text-zinc-400 underline hover:text-zinc-200" @click="setShared(true)">Nouveau lien</button>
            <button class="text-zinc-400 underline hover:text-zinc-200" @click="setShared(false)">Ne plus partager</button>
          </div>
        </template>
        <button v-else class="btn-primary" @click="setShared(true)">Créer le lien</button>
      </div>
      <div v-if="exportError" class="p-4 rounded-xl border border-red-900/50 bg-red-950/30 text-sm text-red-300">
        {{ exportError }}
      </div>

      <!-- À compléter -->
      <div v-if="hasPending && !readOnly" class="p-4 rounded-xl border border-amber-700/40 bg-amber-950/20 text-sm text-amber-200 flex flex-wrap items-center justify-between gap-3">
        <span>
          À compléter :
          {{ pendingSummary }}
        </span>
        <button class="underline" @click="levelUpMode = 'complete'">Faire ces choix</button>
      </div>
      <div v-if="saveError" class="p-4 rounded-xl border border-red-900/50 bg-red-950/30 text-sm text-red-300">
        Modification refusée : {{ saveError }}
      </div>

      <!-- Lecture seule (MJ) : tous les boutons et champs de la fiche désactivés -->
      <!-- Un fieldset en display: contents perd l'espacement (space-y) du parent : il porte le sien -->
      <!-- Affichage : toute la fiche, ou par onglets pour ne pas faire défiler -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div v-if="tabbed" role="tablist" aria-label="Parties de la fiche" class="flex flex-wrap gap-1 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          <button
            v-for="t in visibleTabs" :id="`sheet-tab-${t.key}`" :key="t.key" type="button" role="tab"
            :aria-selected="tab === t.key" aria-controls="sheet-tabpanel" :tabindex="tab === t.key ? 0 : -1"
            :class="['rounded-lg px-3 py-1.5 text-sm transition', tab === t.key ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-100']"
            @click="selectTab(t.key)" @keydown.right.prevent="moveTab(1)" @keydown.left.prevent="moveTab(-1)"
          >{{ t.label }}</button>
        </div>
        <span v-else></span>
        <div class="flex items-center gap-1 text-xs text-zinc-500" role="group" aria-label="Affichage de la fiche">
          Affichage :
          <button type="button" :aria-pressed="!tabbed" :class="['rounded-md px-2 py-1', !tabbed ? 'bg-zinc-800 text-zinc-100' : 'hover:text-zinc-200']" @click="setLayout('full')">Tout</button>
          <button type="button" :aria-pressed="tabbed" :class="['rounded-md px-2 py-1', tabbed ? 'bg-zinc-800 text-zinc-100' : 'hover:text-zinc-200']" @click="setLayout('tabs')">Onglets</button>
        </div>
      </div>
      <fieldset :id="tabbed ? 'sheet-tabpanel' : undefined" :role="tabbed ? 'tabpanel' : undefined" :aria-labelledby="tabbed ? `sheet-tab-${tab}` : undefined" :disabled="readOnly" class="m-0 min-w-0 space-y-6 border-0 p-0">
      <div :class="['grid grid-cols-1 gap-6', tabbed ? 'lg:grid-cols-2 items-start' : 'lg:grid-cols-3']">
        <!-- Colonne 1 : caractéristiques, sauvegardes, compétences -->
        <div :class="tabbed ? 'contents' : 'space-y-6'">
          <section v-show="shows('carac')" class="panel">
            <div class="grid grid-cols-3 gap-3">
              <div v-for="a in ABILITIES" :key="a.index" class="rounded-lg bg-zinc-950/60 border border-zinc-800 p-3 text-center">
                <div class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{{ a.short }}</div>
                <div class="text-2xl font-bold font-serif text-white">{{ signed(mod(a.index)) }}</div>
                <div class="text-xs text-zinc-500">{{ score(a.index) }}</div>
              </div>
            </div>
            <div class="mt-4 flex justify-between text-sm">
              <span class="text-zinc-400">Bonus de maîtrise</span>
              <span class="font-bold text-amber-500">{{ signed(sheet.proficiencyBonus) }}</span>
            </div>
          </section>

          <section v-show="shows('carac')" class="panel">
            <h2 class="panel-title">Jets de sauvegarde</h2>
            <ul class="space-y-1 text-sm">
              <li v-for="a in ABILITIES" :key="a.index" class="flex justify-between">
                <span :class="savingThrow(a.index).proficient ? 'text-zinc-100' : 'text-zinc-500'">
                  <span class="inline-block w-3">{{ savingThrow(a.index).proficient ? '●' : '○' }}</span> {{ a.name }}
                </span>
                <span class="font-mono">{{ signed(savingThrow(a.index).value) }}</span>
              </li>
            </ul>
          </section>

          <section v-show="shows('carac')" class="panel">
            <h2 class="panel-title">Compétences</h2>
            <ul class="space-y-1 text-sm">
              <li v-for="s in skillRows" :key="s.index" class="flex justify-between">
                <span :class="s.proficient ? 'text-zinc-100' : 'text-zinc-500'">
                  <span class="inline-block w-3">{{ s.expertise ? '◆' : s.proficient ? '●' : '○' }}</span>
                  {{ s.name }} <span class="text-[10px] text-zinc-600 uppercase">{{ s.ability }}</span>
                </span>
                <span class="font-mono">{{ signed(s.value) }}</span>
              </li>
            </ul>
            <p class="mt-3 text-xs text-zinc-500">Perception passive : {{ passivePerception }}</p>
          </section>
        </div>

        <!-- Colonne 2 : combat, sorts, états -->
        <div :class="tabbed ? 'contents' : 'space-y-6'">
          <section v-show="shows('combat')" class="panel">
            <h2 class="panel-title">Combat</h2>
            <div class="grid grid-cols-4 gap-3 text-center">
              <div class="stat" :title="sheet.armorClass?.detail">
                <div class="stat-value">{{ sheet.armorClass?.value ?? '—' }}</div><div class="stat-label">CA</div>
              </div>
              <div class="stat"><div class="stat-value">{{ signed(mod('dex')) }}</div><div class="stat-label">Initiative</div></div>
              <div class="stat"><div class="stat-value">{{ speed }}</div><div class="stat-label">Vitesse</div></div>
              <div class="stat">
                <button class="stat-value" :class="input.state?.inspiration ? 'text-amber-400' : 'text-zinc-600'" @click="update({ ...input, state: { ...input.state, inspiration: !input.state?.inspiration } })">★</button>
                <div class="stat-label">Inspiration</div>
              </div>
            </div>

            <p v-if="sheet.armorClass" class="mt-2 text-xs text-zinc-500">CA : {{ sheet.armorClass.detail }}</p>

            <!-- Résistances aux dégâts (traits raciaux) -->
            <div v-if="resistances.length" class="mt-3 flex flex-wrap items-center gap-2">
              <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Résistances</span>
              <span v-for="r in resistances" :key="r.name" class="rounded-full border border-sky-800/60 bg-sky-950/30 px-2.5 py-0.5 text-xs text-sky-200" :title="r.sources">{{ r.name }}</span>
            </div>

            <!-- Points de vie -->
            <div class="mt-5 rounded-lg bg-zinc-950/60 border border-zinc-800 p-4">
              <div class="flex items-end justify-between">
                <div>
                  <div class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Points de vie</div>
                  <div class="text-3xl font-bold font-serif" :class="hp === 0 ? 'text-red-500' : 'text-white'">
                    {{ hp }} <span class="text-lg text-zinc-500">/ {{ sheet.maxHitPoints }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Temporaires</div>
                  <input type="number" min="0" class="input w-20 text-right" :value="input.state?.temporaryHitPoints ?? 0" @change="onTempHp" />
                </div>
              </div>
              <div class="mt-3 h-2 rounded bg-zinc-800 overflow-hidden">
                <div class="h-full bg-red-600 transition-all" :style="{ width: `${Math.round((hp / Math.max(sheet.maxHitPoints, 1)) * 100)}%` }"></div>
              </div>
              <div class="mt-3 flex gap-2">
                <input v-model.number="hpAmount" type="number" min="0" class="input w-20" placeholder="0" aria-label="Montant" />
                <button class="btn-danger flex-1" :disabled="!hpAmount" @click="damage">Dégâts</button>
                <button class="btn-heal flex-1" :disabled="!hpAmount" @click="healAmount">Soins</button>
              </div>

              <!-- Jets contre la mort -->
              <div v-if="hp === 0" class="mt-4 flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-1">
                  <span class="text-zinc-400 mr-1">Réussites</span>
                  <button v-for="i in 3" :key="`s${i}`" class="dot" :class="i <= (input.state?.deathSaveSuccesses ?? 0) ? 'bg-emerald-500' : ''" @click="deathSave('success', i)"></button>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-zinc-400 mr-1">Échecs</span>
                  <button v-for="i in 3" :key="`f${i}`" class="dot" :class="i <= (input.state?.deathSaveFailures ?? 0) ? 'bg-red-500' : ''" @click="deathSave('failure', i)"></button>
                </div>
              </div>
            </div>

            <!-- Dés de vie et repos -->
            <div class="mt-4">
              <div class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Dés de vie</div>
              <div v-for="d in sheet.hitDice ?? []" :key="d.class" class="flex items-center justify-between text-sm py-1">
                <span>{{ className(d.class) }} : {{ d.total - d.used }} / {{ d.total }} d{{ d.die }}</span>
                <button class="text-xs underline text-zinc-400 hover:text-white disabled:opacity-40" :disabled="d.used >= d.total" @click="spendDie(d.class, d.die)">
                  Dépenser (repos court)
                </button>
              </div>
              <p v-if="lastRoll" class="text-xs text-zinc-500 mt-1">{{ lastRoll }}</p>
              <div class="mt-3 flex gap-2">
                <button class="btn-secondary flex-1" @click="update(shortRest(input, shortRechargeKeys))">Repos court</button>
                <button class="btn-secondary flex-1" @click="update(longRest(input))">Repos long</button>
              </div>
            </div>
          </section>

          <!-- Pendant le tour : actions, actions bonus, réactions -->
          <SheetTurn v-show="shows('combat')" :sheet="sheet" :input="input" />

          <!-- Attaques : armes de l'inventaire et sorts mineurs, comme sur la fiche papier -->
          <section v-show="shows('combat')" v-if="sheet.attacks?.length" class="panel">
            <h2 class="panel-title">Attaques</h2>
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-[10px] uppercase tracking-widest text-zinc-500">
                  <th class="py-1 font-bold">Nom</th>
                  <th class="py-1 text-center font-bold">Attaque</th>
                  <th class="py-1 font-bold">Dégâts</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in sheet.attacks" :key="`${a.kind}-${a.index}`" class="border-t border-zinc-800/70 align-top">
                  <td class="py-2 pr-2">
                    <span :class="a.equipped || a.kind === 'SPELL' ? 'text-zinc-100' : 'text-zinc-400'">{{ a.name }}</span>
                    <span v-if="a.kind === 'SPELL'" class="ml-1 text-[10px] uppercase text-violet-300">sort</span>
                    <span v-else-if="!a.equipped" class="ml-1 text-[10px] uppercase text-zinc-600">rangée</span>
                    <p v-if="a.range || a.properties.length" class="text-xs text-zinc-500">{{ [a.range, ...a.properties].filter(Boolean).join(' · ') }}</p>
                  </td>
                  <td class="py-2 text-center font-bold text-white">
                    {{ a.attackBonus != null ? signed(a.attackBonus) : a.save ? `DD ${a.save.dc} ${abilityShort(a.save.ability)}` : '—' }}
                  </td>
                  <td class="py-2 text-zinc-200">
                    {{ a.damage ?? '—' }}
                    <p v-if="a.versatileDamage" class="text-xs text-zinc-500">à deux mains : {{ a.versatileDamage }}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- Capacités à utilisations limitées -->
          <section v-show="shows('combat')" v-if="sheet.featureResources?.length" class="panel">
            <h2 class="panel-title">Capacités limitées</h2>
            <div v-for="r in sheet.featureResources" :key="r.feature ?? r.trait ?? r.name" class="flex items-center justify-between py-1.5 text-sm gap-3">
              <span>
                {{ r.name }}
                <span class="text-[10px] uppercase text-zinc-600 ml-1">{{ r.recharge === 'SHORT' ? 'repos court' : 'repos long' }}</span>
              </span>
              <!-- Peu d'utilisations : des pastilles ; une réserve (imposition des mains) : un compteur -->
              <span v-if="r.max <= 10" class="flex gap-1">
                <button
                  v-for="n in r.max" :key="n" class="dot"
                  :class="n <= r.max - usedOf(r) ? 'bg-amber-500' : 'bg-zinc-800'"
                  :title="n <= r.max - usedOf(r) ? 'Disponible' : 'Utilisée'"
                  @click="useResource(r, n)"
                ></button>
              </span>
              <span v-else class="flex items-center gap-2">
                <button class="qty" @click="setUsed(r, usedOf(r) + 1)" :disabled="usedOf(r) >= r.max">−</button>
                <span class="w-14 text-center font-mono">{{ r.max - usedOf(r) }} / {{ r.max }}</span>
                <button class="qty" @click="setUsed(r, usedOf(r) - 1)" :disabled="usedOf(r) <= 0">+</button>
              </span>
            </div>
          </section>

          <!-- Sorts -->
          <section v-show="shows('sorts')" v-if="(sheet.spellSlots?.length || sheet.pactSlots || sheet.spellcasting?.length)" class="panel">
            <h2 class="panel-title">Incantation</h2>
            <ul class="text-sm space-y-1 mb-3">
              <li v-for="sc in sheet.spellcasting ?? []" :key="sc.class" class="flex justify-between">
                <span class="text-zinc-400">{{ className(sc.class) }} ({{ abilityShort(sc.ability) }})</span>
                <span>DD {{ sc.saveDC }} · attaque {{ signed(sc.attackBonus) }}</span>
              </li>
            </ul>
            <div v-for="(count, i) in sheet.spellSlots ?? []" :key="`slot${i}`" class="flex items-center justify-between py-1 text-sm">
              <span class="text-zinc-400">Niveau {{ i + 1 }}</span>
              <span class="flex gap-1">
                <button v-for="n in count" :key="n" class="dot" :class="n <= slotsUsed(input, i + 1) ? 'bg-zinc-700' : 'bg-violet-500'" :title="n <= slotsUsed(input, i + 1) ? 'Utilisé' : 'Disponible'" @click="toggleSlot(i + 1, n)"></button>
              </span>
            </div>
            <div v-if="sheet.pactSlots" class="flex items-center justify-between py-1 text-sm">
              <span class="text-zinc-400">Pacte (niveau {{ sheet.pactSlots.level }})</span>
              <span class="flex gap-1">
                <button v-for="n in sheet.pactSlots.count" :key="n" class="dot" :class="n <= slotsUsed(input, sheet.pactSlots.level, true) ? 'bg-zinc-700' : 'bg-fuchsia-500'" @click="toggleSlot(sheet.pactSlots.level, n, true)"></button>
              </span>
            </div>
            <div v-if="alwaysPrepared.length" class="mt-3">
              <div class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Toujours préparés</div>
              <p class="text-sm text-zinc-300">{{ alwaysPrepared.join(', ') }}</p>
            </div>
          </section>

          <!-- États -->
          <section v-show="shows('combat')" class="panel">
            <h2 class="panel-title">États</h2>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in conditions" :key="c.index" :title="c.description"
                class="px-3 py-1 rounded-full border text-xs transition-colors"
                :class="input.conditions?.includes(c.index) ? 'border-red-500 bg-red-950/40 text-red-200' : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'"
                @click="update(toggleCondition(input, c.index))"
              >
                {{ c.name }}
              </button>
            </div>
          </section>
        </div>

        <!-- Colonne 3 : capacités, traits, maîtrises -->
        <div :class="tabbed ? 'contents' : 'space-y-6'">
          <section v-show="shows('capacites')" class="panel">
            <h2 class="panel-title">Capacités et traits</h2>
            <div class="space-y-2">
              <details v-for="f in features" :key="f.key" class="group rounded-lg bg-zinc-950/40 border border-zinc-800 px-3 py-2">
                <summary class="cursor-pointer text-sm flex justify-between gap-2">
                  <span class="text-zinc-200">{{ f.name }}</span>
                  <span class="text-[10px] uppercase text-zinc-500 whitespace-nowrap">{{ f.source }}</span>
                </summary>
                <p class="mt-2 text-xs text-zinc-400 whitespace-pre-line leading-relaxed">{{ f.description }}</p>
              </details>
            </div>
          </section>

          <section v-show="shows('carac')" class="panel">
            <h2 class="panel-title">Maîtrises et langues</h2>
            <dl class="text-sm space-y-2">
              <div v-for="g in proficiencyGroups" :key="g.label">
                <dt class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{{ g.label }}</dt>
                <dd class="text-zinc-300">{{ g.items.join(', ') || '—' }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <!-- Sorts connus et préparés -->
      <SheetSpells v-show="shows('sorts')" :input="input" :sheet="sheet" :classes="classes" @update="update" />

      <!-- Inventaire -->
      <SheetInventory v-show="shows('inventaire')" :input="input" @update="update" />

      <!-- Notes -->
      <section v-show="shows('notes')" class="panel">
        <h2 class="panel-title">Notes</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label v-for="field in NOTE_FIELDS" :key="field.key" class="text-sm">
            <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{{ field.label }}</span>
            <textarea
              class="input w-full mt-1 h-32 resize-y"
              :value="(input[field.key] as string | null) ?? ''"
              @change="(e) => update({ ...input!, [field.key]: (e.target as HTMLTextAreaElement).value || null })"
            ></textarea>
          </label>
        </div>
        <label class="text-sm mt-4 inline-flex items-center gap-2">
          <span class="text-zinc-400">Expérience</span>
          <input type="number" min="0" class="input w-28" :value="input.state?.experiencePoints ?? 0" @change="onXp" />
        </label>
      </section>
      </fieldset>
    </div>

    <LevelUpModal
      v-if="levelUpMode && input && saved"
      :mode="levelUpMode"
      :input="input"
      :saved="saved"
      @close="levelUpMode = null"
      @apply="applyLevelUp"
    />
  </div>
</template>

<script setup lang="ts">
import ActionsMenu from '@/components/ActionsMenu.vue'
import SkeletonSheet from '@/components/skeleton/SkeletonSheet.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { characterShareUrl, copySharedCharacter, fetchSharedCharacter, shareCharacter } from '@/api/characterShare'
import { useAuthStore } from '@/stores/auth'
import { useCharacterStore, getErrorMessage } from '@/stores/character'
import { stripSaved, type CharacterPreview, type SavedCharacter } from '@/types/character'
import { previewCharacter } from '@/api/generated/endpoints'
import {
  loadApiBackgrounds, loadApiClass, loadApiRaces, loadConditions, loadEquipmentCatalog, loadMagicItems, loadSkills,
  type ApiClass, type ApiCondition, type ApiSkill,
} from '@/utils/dataLoader'
import { usePdfExport } from '@/composables/usePdfExport'
import { toSheetPdfData } from '@/utils/sheetPdf'
import {
  applyDamage, currentHp, heal, longRest, pruneRejected, removeLastLevel, setDeathSave, setFeatureUsed, setSlotsUsed, setTemporaryHp, shortRest, slotsUsed, spendHitDie, toggleCondition,
  type Input,
} from '@/utils/sheetActions'
import { feetToMeters } from '@/utils/spellFormat'
import SheetInventory from '@/components/sheet/SheetInventory.vue'
import SheetSpells from '@/components/sheet/SheetSpells.vue'
import SheetTurn from '@/components/sheet/SheetTurn.vue'
import LevelUpModal from '@/components/sheet/LevelUpModal.vue'

const ABILITIES = [
  { index: 'str', short: 'FOR', name: 'Force' },
  { index: 'dex', short: 'DEX', name: 'Dextérité' },
  { index: 'con', short: 'CON', name: 'Constitution' },
  { index: 'int', short: 'INT', name: 'Intelligence' },
  { index: 'wis', short: 'SAG', name: 'Sagesse' },
  { index: 'cha', short: 'CHA', name: 'Charisme' },
]
const NOTE_FIELDS = [
  { key: 'notes', label: 'Notes de partie' },
  { key: 'backstory', label: 'Histoire' },
  { key: 'appearance', label: 'Apparence' },
] as const
const TOOL_TYPES = new Set(['ARTISAN_TOOL', 'MUSICAL_INSTRUMENT', 'GAMING_SET', 'VEHICLE', 'OTHER'])

const route = useRoute()
const router = useRouter()
const store = useCharacterStore()
const id = Number(route.params.id)
// /shared/:code : fiche partagée par lien, lue sans connexion
const shared = computed(() => route.name === 'shared-character')
const authStore = useAuthStore()

const saved = ref<SavedCharacter | null>(null)
const input = ref<Input | null>(null)
const loadError = ref<string | null>(null)
const classes = ref<ApiClass[]>([])
const skills = ref<ApiSkill[]>([])
const conditions = ref<ApiCondition[]>([])
const raceTraits = ref<{ key: string; name: string; description: string; source: string }[]>([])
const backgroundFeature = ref<{ key: string; name: string; description: string; source: string } | null>(null)
const backgroundPersonality = ref<{ id: number; text: string }[]>([])
const levelUpMode = ref<'level' | 'complete' | 'edit' | null>(null)
const hpAmount = ref<number | null>(null)
const speedFeet = ref<number | null>(null)
const lastRoll = ref('')

// --- Chargement --------------------------------------------------------------------

async function loadReferences(character: SavedCharacter) {
  const [classRows, raceRows, backgrounds, skillRows, conditionRows] = await Promise.all([
    Promise.all(character.classes.map((c) => loadApiClass(c.class))),
    loadApiRaces(), loadApiBackgrounds(), loadSkills(), loadConditions(),
  ])
  classes.value = classRows.filter((c): c is ApiClass => !!c)
  skills.value = skillRows
  conditions.value = conditionRows
  const race = raceRows.find((r) => r.index === character.race)
  speedFeet.value = race?.speeds.walk ?? null
  const subrace = race?.subraces.find((s) => s.index === character.subrace)
  raceTraits.value = [...(race?.traits ?? []), ...(subrace?.traits ?? [])]
    .map((t) => ({ key: `trait-${t.index}`, name: t.name, description: t.description, source: subrace?.name ?? race?.name ?? '' }))
  const background = backgrounds.find((b) => b.index === character.background)
  backgroundFeature.value = background?.feature
    ? { key: 'background', name: background.feature.name, description: background.feature.description ?? '', source: background.name }
    : null
  backgroundPersonality.value = background?.personality ?? []
}

onMounted(async () => {
  try {
    const character = shared.value ? await fetchSharedCharacter(String(route.params.code)) : await store.fetchCharacter(id)
    if (!character) {
      loadError.value = "ce lien de partage n'existe pas ou plus"
      return
    }
    saved.value = character
    input.value = stripSaved(character)
    await loadReferences(character)
  } catch (e) {
    loadError.value = getErrorMessage(e, 'erreur inconnue')
  }
})

// --- Affichage : toute la fiche, ou par onglets ---------------------------------------

type SheetTab = 'combat' | 'carac' | 'sorts' | 'inventaire' | 'capacites' | 'notes'
const TABS: { key: SheetTab; label: string }[] = [
  { key: 'combat', label: 'Combat' }, { key: 'carac', label: 'Caractéristiques' }, { key: 'sorts', label: 'Sorts' },
  { key: 'inventaire', label: 'Inventaire' }, { key: 'capacites', label: 'Capacités' }, { key: 'notes', label: 'Notes' },
]
const LAYOUT_KEY = 'dungeon-desk:sheet-layout'
// Préférence du navigateur ; stockage indisponible (navigation privée…) : toute la fiche
const storedLayout = () => {
  try { return localStorage.getItem(LAYOUT_KEY) === 'tabs' } catch { return false }
}
const tabbed = ref(storedLayout())
function setLayout(layout: 'full' | 'tabs') {
  tabbed.value = layout === 'tabs'
  try { localStorage.setItem(LAYOUT_KEY, layout) } catch { /* préférence non retenue */ }
}
// Onglet Sorts seulement pour un lanceur de sorts
const casts = computed(() => !!saved.value?.sheet && !!(sheet.value.spellSlots?.length || sheet.value.pactSlots || sheet.value.spellcasting?.length || input.value?.spells?.length || sheet.value.grantedSpells?.length))
// Une résistance par type de dégâts, ses origines en infobulle
const resistances = computed(() => {
  const byName = new Map<string, string[]>()
  for (const r of sheet.value.damageResistances ?? []) byName.set(r.name, [...(byName.get(r.name) ?? []), r.source])
  return [...byName].map(([name, sources]) => ({ name, sources: sources.join(', ') }))
})
const visibleTabs = computed(() => TABS.filter((t) => t.key !== 'sorts' || casts.value))
// Onglet dans l'adresse (?onglet=sorts) : il survit à un rechargement
const tab = computed<SheetTab>(() => {
  const wanted = route.query.onglet as SheetTab | undefined
  return visibleTabs.value.some((t) => t.key === wanted) ? wanted! : 'combat'
})
function selectTab(key: SheetTab) {
  router.replace({ query: { ...route.query, onglet: key === 'combat' ? undefined : key } })
}
function moveTab(step: 1 | -1) {
  const list = visibleTabs.value
  const next = list[(list.findIndex((t) => t.key === tab.value) + step + list.length) % list.length]!
  selectTab(next.key)
  nextTick(() => document.getElementById(`sheet-tab-${next.key}`)?.focus())
}
const shows = (key: SheetTab) => !tabbed.value || tab.value === key

// --- Relecture : PV changés par le MJ dans un combat -----------------------------------

// Toutes les 10 s et au retour sur l'onglet ; jamais pendant un enregistrement, une
// saisie ou une fenêtre ouverte (montée de niveau, objet)
async function refreshFromServer() {
  if (!saved.value || shared.value || pendingSave.value || saving.value || levelUpMode.value || document.hidden) return
  const el = document.activeElement
  if (el && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return
  try {
    const fresh = await store.fetchCharacter(id)
    if (fresh.updatedAt === saved.value?.updatedAt || pendingSave.value || saving.value) return
    saved.value = fresh
    input.value = stripSaved(fresh)
  } catch {
    // Réseau indisponible : nouvel essai au prochain passage
  }
}
const refreshTimer = setInterval(refreshFromServer, 10000)
const onVisible = () => { if (!document.hidden) refreshFromServer() }
document.addEventListener('visibilitychange', onVisible)
onBeforeUnmount(() => {
  clearInterval(refreshTimer)
  document.removeEventListener('visibilitychange', onVisible)
})

// --- Enregistrement automatique -----------------------------------------------------

const saving = ref(false)
const pendingSave = ref(false)
const saveError = ref<string | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

// Personnage d'un joueur consulté par le MJ de sa campagne : rien n'est modifiable
// … ou fiche partagée par lien
const readOnly = computed(() => saved.value?.access === 'GAME_MASTER' || saved.value?.access === 'SHARED')

function update(next: Input) {
  if (readOnly.value) return
  input.value = next
  saveError.value = null
  pendingSave.value = true
  clearTimeout(timer)
  timer = setTimeout(save, 600)
}

async function save() {
  if (!input.value) return
  saving.value = true
  const sent = input.value
  try {
    const result = await store.saveInput(id, sent)
    saved.value = result
    // Nouvelles classes (montée de niveau) : leurs capacités
    if (result.classes.some((c) => !classes.value.some((k) => k.index === c.class))) await loadReferences(result)
    if (input.value === sent) pendingSave.value = false
  } catch (e) {
    saveError.value = getErrorMessage(e, "erreur d'enregistrement")
  } finally {
    saving.value = false
  }
}

const saveStatusLabel = computed(() =>
  saveError.value ? 'Non enregistré' : saving.value || pendingSave.value ? 'Enregistrement…' : 'Enregistré')
const saveStatusClass = computed(() =>
  saveError.value ? 'text-red-400' : saving.value || pendingSave.value ? 'text-zinc-500' : 'text-emerald-500')

// --- Valeurs calculées (par le back) ------------------------------------------------

const sheet = computed(() => saved.value!.sheet!)
const score = (ability: string) => sheet.value.abilityScores[ability]?.total ?? 10
const mod = (ability: string) => sheet.value.abilityScores[ability]?.modifier ?? 0
const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`)
const abilityShort = (index: string) => ABILITIES.find((a) => a.index === index)?.short ?? index
const className = (index: string) => classes.value.find((c) => c.index === index)?.name ?? index
const hp = computed(() => currentHp(input.value!, sheet.value.maxHitPoints))
const hasProficiency = (index: string) => sheet.value.proficiencies.some((p) => p.index === index)

const savingThrow = (ability: string) => {
  const proficient = hasProficiency(`saving-throw-${ability}`)
  return { proficient, value: mod(ability) + (proficient ? sheet.value.proficiencyBonus : 0) }
}

// Compétences par ordre alphabétique du nom affiché (« Acrobaties », « Arcanes », « Athlétisme »…)
const skillRows = computed(() => skills.value.map((s) => {
  const proficient = hasProficiency(`skill-${s.index}`)
  const expertise = sheet.value.expertise.some((e) => e.index === `skill-${s.index}`)
  const pb = sheet.value.proficiencyBonus
  return {
    index: s.index, name: s.name, ability: abilityShort(s.ability.index), proficient, expertise,
    value: mod(s.ability.index) + (proficient ? pb : 0) + (expertise ? pb : 0),
  }
}).sort((a, b) => a.name.localeCompare(b.name, 'fr')))
const passivePerception = computed(() => 10 + (skillRows.value.find((s) => s.index === 'perception')?.value ?? mod('wis')))

// Vitesse de la race, en mètres
const speed = computed(() => (speedFeet.value != null ? feetToMeters(speedFeet.value).replace(/ mètres?$/, ' m') : '—'))

const features = computed(() => {
  const list: { key: string; name: string; description: string; source: string }[] = []
  // Options choisies (« Tueur de colosses » sous « Proie du chasseur ») : les sous-capacités
  // ne s'affichent que si le personnage les a prises
  const granted = new Set(saved.value?.sheet?.grantedFeatures ?? [])
  for (const c of input.value?.classes ?? []) {
    const cls = classes.value.find((k) => k.index === c.class)
    if (!cls) continue
    const level = c.levels.length
    for (const f of cls.features) {
      const chosen = granted.has(f.index)
      if (!chosen && (f.parent || f.level > level || (f.subclass && f.subclass !== c.subclass))) continue
      const parent = f.parent ? cls.features.find((p) => p.index === f.parent) : null
      list.push({ key: `${cls.index}-${f.index}`, name: f.name, description: f.description, source: parent ? `${cls.name} ${f.level} · ${parent.name}` : `${cls.name} ${f.level}` })
    }
  }
  const raceKeys = new Set(raceTraits.value.map((t) => t.key))
  // Traits accordés par un choix (ascendance draconique), décrits par l'API
  const grantedTraits = (saved.value?.sheet?.grantedTraitDetails ?? [])
    .filter((t) => !raceKeys.has(`trait-${t.index}`))
    .map((t) => ({ key: `trait-${t.index}`, name: t.name, description: t.description, source: 'Choix racial' }))
  return [...list, ...raceTraits.value, ...grantedTraits, ...(backgroundFeature.value ? [backgroundFeature.value] : [])]
})

const alwaysPrepared = computed(() => (input.value?.classes ?? []).flatMap((c) => {
  const sub = classes.value.find((k) => k.index === c.class)?.subclasses.find((s) => s.index === c.subclass)
  return (sub?.spells ?? []).filter((sp) => sp.requiredClassLevel <= c.levels.length).map((sp) => sp.name)
}))

const proficiencyGroups = computed(() => {
  const names = (filter: (type: string) => boolean) => sheet.value.proficiencies.filter((p) => filter(p.type)).map((p) => p.name)
  return [
    { label: 'Armures', items: names((t) => t === 'ARMOR') },
    { label: 'Armes', items: names((t) => t === 'WEAPON') },
    { label: 'Outils', items: names((t) => TOOL_TYPES.has(t)) },
    { label: 'Langues', items: sheet.value.languages.map((l) => l.name) },
  ]
})

const hasPending = computed(() => {
  const p = sheet.value.pending
  return p.subclasses.length + p.abilityScoreImprovements.length + p.choices.length > 0
})
const pendingSummary = computed(() => {
  const p = sheet.value.pending
  return [
    ...p.subclasses.map((c) => `sous-classe (${className(c)})`),
    ...p.abilityScoreImprovements.map((a) => `amélioration de caractéristiques (${className(a.class)} ${a.level})`),
    ...(p.choices.length ? [`${p.choices.length} choix`] : []),
  ].join(', ')
})

// --- Partage par lien -------------------------------------------------------------------

const shareOpen = ref(false)
const linkCopied = ref(false)
const copying = ref(false)

async function setShared(on: boolean) {
  const { shareCode } = await shareCharacter(id, on)
  saved.value = { ...saved.value!, shareCode }
}
async function copyShareLink() {
  await navigator.clipboard?.writeText(characterShareUrl(saved.value!.shareCode!))
  linkCopied.value = true
  setTimeout(() => (linkCopied.value = false), 2000)
}
async function copyToMine() {
  copying.value = true
  try {
    const { id: copyId } = await copySharedCharacter(String(route.params.code))
    router.push(`/character/${copyId}`)
  } catch (e) {
    exportError.value = `Copie impossible : ${getErrorMessage(e, 'erreur inconnue')}`
  } finally {
    copying.value = false
  }
}

// --- Retour en arrière -------------------------------------------------------------------

const removingLevel = ref(false)

// Retire le dernier niveau, puis les choix, sorts et utilisations que l'API
// refuse ensuite (réponses du niveau retiré, sorts trop puissants…)
async function removeLevel() {
  if (!window.confirm(`Retirer le niveau ${sheet.value.level} ? Les choix faits à ce niveau seront perdus.`)) return
  removingLevel.value = true
  try {
    let next = removeLastLevel(input.value!, (c) => classes.value.find((k) => k.index === c)?.subclassLevel ?? 1)
    for (let pass = 0; pass < 5; pass++) {
      const preview = (await previewCharacter(next, { lang: 'fr' })).data as unknown as CharacterPreview
      const pruned = pruneRejected(next, preview.errors)
      if (!pruned) break
      next = pruned
    }
    update(next)
  } catch (e) {
    saveError.value = getErrorMessage(e, 'retrait du niveau impossible')
  } finally {
    removingLevel.value = false
  }
}

// --- Fiche PDF ---------------------------------------------------------------------------

const exporting = ref(false)
const exportError = ref<string | null>(null)
const { generatePdf, downloadPdf } = usePdfExport()

async function exportPdf() {
  exporting.value = true
  exportError.value = null
  try {
    const [catalog, magicItems] = await Promise.all([loadEquipmentCatalog(), loadMagicItems()])
    const data = toSheetPdfData({
      input: input.value!, sheet: sheet.value, names: saved.value!.names, speedFeet: speedFeet.value,
      features: features.value,
      equipmentName: (index) => catalog.find((e) => e.index === index)?.name,
      magicItemName: (index) => magicItems.find((m) => m.index === index)?.name,
      personalityText: (optionId) => backgroundPersonality.value.find((p) => p.id === optionId)?.text,
    })
    downloadPdf(await generatePdf(data), `${data.name || 'personnage'}.pdf`)
  } catch (e) {
    exportError.value = `Impossible de générer le PDF : ${getErrorMessage(e, 'erreur inconnue')}`
  } finally {
    exporting.value = false
  }
}

// --- Actions ---------------------------------------------------------------------------

function damage() {
  if (!hpAmount.value) return
  update(applyDamage(input.value!, sheet.value.maxHitPoints, hpAmount.value))
  hpAmount.value = null
}
function healAmount() {
  if (!hpAmount.value) return
  update(heal(input.value!, sheet.value.maxHitPoints, hpAmount.value))
  hpAmount.value = null
}
const onTempHp = (e: Event) => update(setTemporaryHp(input.value!, Number((e.target as HTMLInputElement).value)))
const onXp = (e: Event) => update({ ...input.value!, state: { ...input.value!.state, experiencePoints: Math.max(0, Number((e.target as HTMLInputElement).value) || 0) } })
function deathSave(kind: 'success' | 'failure', i: number) {
  const current = kind === 'success' ? input.value!.state?.deathSaveSuccesses ?? 0 : input.value!.state?.deathSaveFailures ?? 0
  update(setDeathSave(input.value!, kind, current === i ? i - 1 : i))
}
function spendDie(classIndex: string, die: number) {
  const roll = 1 + Math.floor(Math.random() * die)
  lastRoll.value = `d${die} : ${roll} ${signed(mod('con'))} (CON) = ${Math.max(0, roll + mod('con'))} PV`
  update(spendHitDie(input.value!, sheet.value.maxHitPoints, classIndex, roll, mod('con')))
}
// Clic sur un emplacement : il devient le dernier utilisé (ou se libère)
function toggleSlot(level: number, n: number, pact = false) {
  const used = slotsUsed(input.value!, level, pact)
  update(setSlotsUsed(input.value!, level, used === n ? n - 1 : n, pact))
}

// --- Capacités à utilisations limitées ---------------------------------------------------

type Resource = NonNullable<typeof sheet.value.featureResources>[number]
// Utilisations lues dans le personnage en cours (à jour avant la réponse du back)
const usedOf = (r: Resource) =>
  input.value?.state?.featureUsage?.find((u) => (r.feature ? u.feature === r.feature : u.trait === r.trait))?.used ?? 0
const setUsed = (r: Resource, used: number) =>
  update(setFeatureUsed(input.value!, { feature: r.feature, trait: r.trait }, Math.min(r.max, Math.max(0, used))))
// Clic sur une pastille : elle devient la dernière disponible (ou se dépense)
function useResource(r: Resource, n: number) {
  const available = r.max - usedOf(r)
  setUsed(r, r.max - (available === n ? n - 1 : n))
}
const shortRechargeKeys = computed(() => (sheet.value.featureResources ?? []).filter((r) => r.recharge === 'SHORT').map((r) => ({ feature: r.feature, trait: r.trait })))

function applyLevelUp(next: Input) {
  levelUpMode.value = null
  update(next)
}
</script>

<style scoped>
@reference "../index.css";
.panel { @apply rounded-xl border border-zinc-800 bg-zinc-900/50 p-5; }
.panel-title { @apply text-sm font-bold uppercase tracking-widest text-amber-500 mb-3 font-serif; }
.stat { @apply rounded-lg bg-zinc-950/60 border border-zinc-800 p-3; }
.stat-value { @apply text-xl font-bold font-serif text-white; }
.stat-label { @apply text-[10px] uppercase tracking-widest text-zinc-500 font-bold; }
.input { @apply rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-100 outline-none focus:border-amber-500; }
.dot { @apply w-4 h-4 rounded-full border border-zinc-600 transition-colors; }
.qty { @apply w-6 h-6 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40; }
.btn-primary { @apply px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold disabled:opacity-40; }
.btn-secondary { @apply px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-sm; }
.menu-group { @apply px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500; }
.menu-item { @apply block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40; }
.btn-danger { @apply px-3 py-1 rounded-md bg-red-900/60 hover:bg-red-800 text-red-100 text-sm disabled:opacity-40; }
.btn-heal { @apply px-3 py-1 rounded-md bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 text-sm disabled:opacity-40; }
</style>
