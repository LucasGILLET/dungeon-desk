import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ChoicesPanel from '@/components/choices/ChoicesPanel.vue'

const skill = (id: number, index: string, name: string) => ({
  id, label: `Compétence : ${name}`, nestedChoiceId: null,
  items: [{ type: 'proficiency', index, name: `Compétence : ${name}`, quantity: 1, bonus: null, description: null }],
})
const choice = (kind: string) => ({
  id: 5, kind, choose: 3, description: 'Choisissez trois compétences', parentOptionId: null, pool: null,
  source: { type: 'class', index: 'bard', name: 'Barde' },
  options: [skill(1, 'skill-acrobatics', 'Acrobaties'), skill(2, 'skill-arcana', 'Arcanes'), skill(3, 'skill-performance', 'Représentation')],
})
const button = (wrapper: ReturnType<typeof mount>, name: string) => wrapper.findAll('button').find((b) => b.text().includes(name))!

describe('ChoicesPanel', () => {
  it('disables a proficiency already known from another source, unless chosen here', async () => {
    // Artiste : Acrobaties et Représentation par l'historique ; Représentation choisie ici
    const wrapper = mount(ChoicesPanel, {
      props: { choices: [choice('PROFICIENCY')], answers: [{ choiceId: 5, optionId: 3 }], knownProficiencies: ['skill-acrobatics', 'skill-performance'] } as never,
    })

    expect(button(wrapper, 'Acrobaties').attributes('disabled')).toBeDefined()
    expect(button(wrapper, 'Acrobaties').text()).toContain('déjà maîtrisée')
    expect(button(wrapper, 'Représentation').attributes('disabled')).toBeUndefined() // retirable
    await button(wrapper, 'Acrobaties').trigger('click')
    expect(wrapper.emitted('update:answers')).toBeUndefined()
    expect(button(wrapper, 'Arcanes').attributes('disabled')).toBeUndefined()
  })

  it('keeps known skills available for expertise', () => {
    const wrapper = mount(ChoicesPanel, { props: { choices: [choice('EXPERTISE')], answers: [], knownProficiencies: ['skill-acrobatics'] } as never })
    expect(button(wrapper, 'Acrobaties').attributes('disabled')).toBeUndefined()
  })
})
