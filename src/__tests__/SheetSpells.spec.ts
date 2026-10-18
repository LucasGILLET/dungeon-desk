import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

const spell = (index: string, name: string, level: number, classes = ['wizard']) => ({
  index, name, level, school: { index: 'evocation', name: 'Évocation' }, classes: classes.map((c) => ({ index: c, name: c })), subclasses: [],
})
vi.mock('@/utils/dataLoader', () => ({
  loadApiSpells: vi.fn(async () => [
    spell('fire-bolt', 'Trait de feu', 0), spell('magic-missile', 'Projectile magique', 1), spell('shield', 'Bouclier', 1),
    spell('fireball', 'Boule de feu', 3), spell('cure-wounds', 'Soins', 1, ['cleric']),
  ]),
}))

const level = (l: number, slots: number[]) => ({ level: l, abilityScoreImprovements: 0, cantripsKnown: 3, spellsKnown: null, spellSlots: slots, values: {} })
const wizard = {
  index: 'wizard', name: 'Magicien', spellcasting: { ability: { index: 'int', name: 'Intelligence' }, startLevel: 1, sections: [] },
  table: { columns: [], levels: [level(1, [2]), level(2, [3])] },
}
const input = {
  name: 'Elandra', race: 'elf', abilityScores: {},
  classes: [{ class: 'wizard', levels: [{ level: 1, characterLevel: 1 }, { level: 2, characterLevel: 2 }] }],
  spells: [{ class: 'wizard', spell: 'fire-bolt', prepared: false }, { class: 'wizard', spell: 'magic-missile', prepared: true }],
}
const sheet = {
  abilityScores: { int: { base: 15, bonus: 1, total: 16, modifier: 3 } },
  spellcasting: [{ class: 'wizard', ability: 'int', saveDC: 13, attackBonus: 5 }],
}

async function mountSpells() {
  const { default: SheetSpells } = await import('@/components/sheet/SheetSpells.vue')
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }, { path: '/sort/:index', component: { template: '<div />' } }] })
  const wrapper = mount(SheetSpells, { props: { input, sheet, classes: [wizard] } as never, global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('SheetSpells', () => {
  it('shows known spells and the limits of the class table', async () => {
    const text = (await mountSpells()).text()

    expect(text).toContain('DD 13 · attaque +5')
    expect(text).toContain('Tours de magie 1 / 3')
    // Magicien 2 : INT +3 + niveau 2
    expect(text).toContain('Préparés 1 / 5')
    expect(text).toContain('Trait de feu')
    expect(text).toContain('Projectile magique')
  })

  it('only offers spells of the class list and of a castable level', async () => {
    const wrapper = await mountSpells()
    await wrapper.findAll('button').find((b) => b.text().includes('Ajouter un sort'))!.trigger('click')
    const offered = wrapper.text()

    expect(offered).toContain('Bouclier')
    expect(offered).not.toContain('Boule de feu') // niveau 3 : pas encore lançable
    expect(offered).not.toContain('Soins') // liste du clerc

    await wrapper.findAll('button').find((b) => b.text() === 'Bouclier')!.trigger('click')
    const sent = (wrapper.emitted('update')![0] as [typeof input])[0]
    // Grimoire du magicien : ajouté sans être préparé
    expect(sent.spells).toContainEqual({ class: 'wizard', spell: 'shield', prepared: false })
  })

  it('loads the spell list when the classes arrive after the first render', async () => {
    const { default: SheetSpells } = await import('@/components/sheet/SheetSpells.vue')
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }, { path: '/sort/:index', component: { template: '<div />' } }] })
    const wrapper = mount(SheetSpells, { props: { input, sheet, classes: [] } as never, global: { plugins: [router] } })
    await flushPromises()
    await wrapper.setProps({ classes: [wizard] } as never)
    await flushPromises()

    await wrapper.findAll('button').find((b) => b.text().includes('Ajouter un sort'))!.trigger('click')
    expect(wrapper.text()).toContain('Bouclier')
  })
})

