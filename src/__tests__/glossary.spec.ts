import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { conditionEntries, keywordMatcher, RULE_TERMS } from '@/utils/glossary'
import KeywordTooltip from '@/components/KeywordTooltip.vue'

const conditions = conditionEntries([
  { index: 'prone', name: 'À terre', description: 'Une créature à terre ne peut que ramper.' },
  { index: 'blinded', name: 'Aveuglé', description: 'Une créature aveuglée ne voit pas.' },
  { index: 'incapacitated', name: 'Neutralisé', description: 'Aucune action ni réaction.' },
])
const split = keywordMatcher([...RULE_TERMS, ...conditions])
const keywords = (text: string) => split(text).filter((s) => s.entry).map((s) => `${s.text}→${s.entry!.key}`)

describe('glossary keywords', () => {
  it('finds conditions in their French forms', () => {
    expect(keywords('La cible est jetée à terre. Les créatures aveuglées ont un désavantage.'))
      .toEqual(['à terre→condition-prone', 'aveuglées→condition-blinded', 'désavantage→disadvantage'])
    expect(keywords('Elle est incapable d’agir (voir l’état).')).toEqual(['incapable d’agir→condition-incapacitated'])
  })

  it('prefers the longest term and respects word boundaries', () => {
    expect(keywords('Il réussit un jet de sauvegarde de Dextérité')).toEqual(['jet de sauvegarde→saving-throw'])
    expect(keywords('Utilisez votre action bonus')).toEqual(['action bonus→bonus-action'])
    // « avantage » n'est pas repéré dans « désavantage », ni dans « avantageux »
    expect(keywords('un désavantage avantageux')).toEqual(['désavantage→disadvantage'])
  })

  it('keeps the whole text, keywords included', () => {
    const text = 'Avec avantage, sous concentration.'
    expect(split(text).map((s) => s.text).join('')).toBe(text)
  })
})

describe('KeywordTooltip', () => {
  const entry = conditions[1]!
  it('opens on hover and stays open once tapped', async () => {
    const wrapper = mount(KeywordTooltip, { props: { entry }, slots: { default: 'aveuglée' }, attachTo: document.body })
    const tooltip = () => document.body.querySelector('[role="tooltip"]')

    await wrapper.get('button').trigger('mouseenter')
    expect(tooltip()?.textContent).toContain('Une créature aveuglée ne voit pas.')
    expect(wrapper.get('button').attributes('aria-describedby')).toBe(tooltip()?.id)
    await wrapper.get('button').trigger('mouseleave')
    expect(tooltip()).toBeNull()

    await wrapper.get('button').trigger('click')
    await wrapper.get('button').trigger('mouseleave')
    expect(tooltip()).not.toBeNull()
    document.body.click() // toucher ailleurs
    await wrapper.vm.$nextTick()
    expect(tooltip()).toBeNull()
    wrapper.unmount()
  })
})
