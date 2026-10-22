import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RichText from '@/components/RichText.vue'
import { parseInline, plainText } from '@/utils/richText'

describe('parseInline', () => {
  it('reconnaît gras italique, gras et italique', () => {
    expect(parseInline('***Bouclier.*** Vous gagnez **+2** à la CA, *une fois*.')).toEqual([
      { text: 'Bouclier.', strong: true, em: true },
      { text: ' Vous gagnez ', strong: false, em: false },
      { text: '+2', strong: true, em: false },
      { text: ' à la CA, ', strong: false, em: false },
      { text: 'une fois', strong: false, em: true },
      { text: '.', strong: false, em: false },
    ])
  })

  it('laisse intacts les astérisques isolés et les tirets bas dans un mot', () => {
    expect(parseInline('2 * 3 = 6, fichier mon_objet_magique')).toEqual([
      { text: '2 * 3 = 6, fichier mon_objet_magique', strong: false, em: false },
    ])
  })

  it('donne le texte sans marqueurs pour les aperçus', () => {
    expect(plainText('***Souffle.*** Le dragon souffle')).toBe('Souffle. Le dragon souffle')
    expect(plainText(null)).toBe('')
  })
})

describe('RichText', () => {
  it('rend les mises en valeur en éléments, sans HTML injecté', () => {
    const wrapper = mount(RichText, { props: { text: '***Attaque.*** Touché : <img src=x onerror=alert(1)>' } })
    expect(wrapper.find('strong em').text()).toBe('Attaque.')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('<img src=x')
  })

  it('met aussi en forme les cellules de tableau', () => {
    const wrapper = mount(RichText, { props: { text: '| d6 | Effet |\n|---|---|\n| 1 | **Feu** |' } })
    expect(wrapper.find('td strong').text()).toBe('Feu')
  })
})
