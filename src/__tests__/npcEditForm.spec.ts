import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import NpcDetailModal from '@/components/profile/NpcDetailModal.vue'

const updateNpc = vi.hoisted(() => vi.fn())
vi.mock('@/stores/npc', () => ({ useNpcStore: () => ({ updateNpc }) }))
vi.mock('@/utils/dataLoader', () => ({
  loadApiRaces: vi.fn(async () => [
    { index: 'dwarf', name: 'Nain', subraces: [{ index: 'hill-dwarf', name: 'Nain des collines' }] },
    { index: 'elf', name: 'Elfe', subraces: [] },
  ]),
  loadClassRefs: vi.fn(async () => [{ index: 'fighter', name: 'Guerrier' }]),
  loadAlignments: vi.fn(async () => [{ index: 'neutral', name: 'Neutre' }]),
}))

const NPC = {
  id: 7, edition: '2014', name: 'Thorek du clan Brisefer', firstName: 'Thorek', lastName: 'Brisefer', race: 'dwarf', subrace: 'hill-dwarf',
  class: null, alignment: 'neutral', gender: 'MALE', age: 120, heightCm: 130, weightKg: 70, profession: 'Forgeron', personality: 'Bourru',
  abilityScores: { str: 15, dex: 10, con: 14, int: 9, wis: 11, cha: 8 }, names: { race: 'Nain', alignment: 'Neutre' }, notes: null,
}

describe('NPC sheet editing', () => {
  it('edits the sheet of a saved NPC and shows the saved version', async () => {
    updateNpc.mockImplementation(async (npc, changes) => ({ ...npc, ...changes, names: { race: 'Elfe', class: 'Guerrier' } }))
    const wrapper = mount(NpcDetailModal, { props: { npc: NPC } })

    await wrapper.findAll('button').find((b) => b.text() === 'Modifier la fiche')!.trigger('click')
    await flushPromises()
    const field = (label: string) => wrapper.findAll('label').find((l) => l.text().startsWith(label))!.find('input, select, textarea')

    await field('Race').setValue('elf')
    await field('Classe').setValue('fighter')
    await field('Âge').setValue('')
    await field('Métier').setValue('  Mercenaire ')
    await field('Personnalité').setValue('')
    await field('Nom').setValue('Gimli')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(updateNpc.mock.calls[0]![1]).toMatchObject({
      name: 'Gimli', firstName: null, lastName: null, // nom saisi à la main
      race: 'elf', subrace: null, // autre race : sous-race retirée
      class: 'fighter', age: null, profession: 'Mercenaire', personality: null,
      abilityScores: { str: 15, cha: 8 },
    })
    // Retour à la fiche, à jour
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('h2').text()).toBe('Gimli')
    expect(wrapper.text()).toContain('Mercenaire')
    expect(wrapper.emitted('updated')).toHaveLength(1)
  })

  it('draws another name for the race of the NPC', async () => {
    const wrapper = mount(NpcDetailModal, { props: { npc: NPC } })
    await wrapper.findAll('button').find((b) => b.text() === 'Modifier la fiche')!.trigger('click')
    await flushPromises()

    await wrapper.findAll('button').find((b) => b.text() === 'Autre nom')!.trigger('click')
    const name = (wrapper.find('input[maxlength="200"]').element as HTMLInputElement).value
    expect(name).toMatch(/ du clan /)
    expect(name).not.toBe(NPC.name)
  })
})
