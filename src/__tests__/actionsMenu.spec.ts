import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import ActionsMenu from '@/components/ActionsMenu.vue'

function mountMenu(onShare = vi.fn()) {
  const Host = defineComponent({
    components: { ActionsMenu },
    setup: () => ({ share: onShare }),
    template: `<ActionsMenu label="Actions">
      <button type="button" role="menuitem">Modifier mes choix</button>
      <button type="button" role="menuitem" disabled>Retirer un niveau</button>
      <button type="button" role="menuitem" @click="share">Partager</button>
    </ActionsMenu>`,
  })
  return mount(Host, { attachTo: document.body })
}

describe('ActionsMenu', () => {
  it('opens on click, focuses the first item and moves with the arrows, skipping disabled items', async () => {
    const wrapper = mountMenu()
    const toggle = wrapper.find('button[aria-haspopup="menu"]')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await toggle.trigger('click')
    await flushPromises()
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(document.activeElement?.textContent).toBe('Modifier mes choix')

    await wrapper.find('[role="menu"]').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement?.textContent).toBe('Partager') // « Retirer un niveau » est désactivé
    await wrapper.find('[role="menu"]').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement?.textContent).toBe('Modifier mes choix') // retour au début
    wrapper.unmount()
  })

  it('closes with Escape (focus back on the button), after a choice, or on a click outside', async () => {
    const share = vi.fn()
    const wrapper = mountMenu(share)
    const toggle = wrapper.find('button[aria-haspopup="menu"]')

    await toggle.trigger('click')
    await flushPromises()
    await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(document.activeElement).toBe(toggle.element)

    await toggle.trigger('click')
    await flushPromises()
    await wrapper.findAll('[role="menuitem"]').at(2)!.trigger('click')
    expect(share).toHaveBeenCalled()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await toggle.trigger('click')
    await flushPromises()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await flushPromises()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
