import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import SheetTurn from '@/components/sheet/SheetTurn.vue'

const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }, { path: '/sort/:index', component: { template: '<div />' } }] })
const dagger = { kind: 'WEAPON', index: 'dagger', name: 'Dague', attackBonus: 5, save: null, damage: '1d4 + 3 perforant', versatileDamage: null, range: null, properties: ['Finesse', 'Légère', 'Lancer'], equipped: true }

function mountTurn(sheet: object, items: object[] = []) {
  return mount(SheetTurn, { props: { sheet: { level: 1, ...sheet }, input: { items } } as never, global: { plugins: [router] } })
}
const column = (wrapper: ReturnType<typeof mountTurn>, label: string) =>
  wrapper.findAll('h3').find((h) => h.text() === label)!.element.parentElement!.textContent!

describe('SheetTurn', () => {
  it('sorts features, traits and spells by action type, next to the basic actions', () => {
    const wrapper = mountTurn({
      attacks: [dagger],
      turnOptions: [
        { activation: 'BONUS_ACTION', source: 'FEATURE', index: 'rage', name: 'Rage', spellLevel: null },
        { activation: 'ACTION', source: 'TRAIT', index: 'breath-weapon', name: 'Souffle', spellLevel: null },
        { activation: 'REACTION', source: 'SPELL', index: 'hellish-rebuke', name: 'Représailles infernales', spellLevel: 1 },
      ],
    })

    expect(column(wrapper, 'Actions')).toContain('Attaquer')
    expect(column(wrapper, 'Actions')).toContain('Souffle')
    expect(column(wrapper, 'Actions')).toContain('Se désengager')
    expect(column(wrapper, 'Actions bonus')).toContain('Rage')
    expect(column(wrapper, 'Réactions')).toContain("Attaque d'opportunité")
    expect(column(wrapper, 'Réactions')).toContain('Représailles infernales')
    expect(wrapper.find('a[href="/sort/hellish-rebuke"]').exists()).toBe(true)
    // Une seule dague équipée : pas d'attaque à deux armes
    expect(column(wrapper, 'Actions bonus')).not.toContain('Attaque à deux armes')
  })

  it('offers two-weapon fighting with two light melee weapons, even as a stack of daggers', () => {
    const wrapper = mountTurn({ attacks: [dagger] }, [{ equipment: 'dagger', quantity: 2, equipped: true }])
    expect(column(wrapper, 'Actions bonus')).toContain('Attaque à deux armes')
  })
})
