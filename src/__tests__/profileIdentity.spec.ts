import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ProfileIdentity from '@/components/profile/ProfileIdentity.vue'
import { profileApi, ProfileApiError } from '@/api/profile'

vi.mock('@/api/profile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/profile')>()),
  profileApi: { get: vi.fn(), updateUsername: vi.fn() },
}))

const profile = { id: 1, username: 'Elminster', email: 'elminster@example.com', createdAt: '' }

beforeEach(() => {
  vi.mocked(profileApi.get).mockResolvedValue(profile)
  vi.mocked(profileApi.updateUsername).mockReset()
})

async function mountIdentity() {
  const wrapper = mount(ProfileIdentity, { props: { fallbackName: 'auth0-nickname' }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

describe('ProfileIdentity', () => {
  it('shows the username players see, not the Auth0 nickname', async () => {
    const wrapper = await mountIdentity()
    expect(wrapper.text()).toContain('Elminster')
    expect(wrapper.text()).toContain('elminster@example.com')
    expect(wrapper.text()).not.toContain('auth0-nickname')
  })

  it('saves a new username', async () => {
    vi.mocked(profileApi.updateUsername).mockResolvedValue({ ...profile, username: 'Mordenkainen' })
    const wrapper = await mountIdentity()

    await wrapper.get('button[aria-label="Modifier le pseudo"]').trigger('click')
    const save = () => wrapper.get('button[type="submit"]')
    expect(save().attributes('disabled')).toBeDefined() // pas encore modifié
    await wrapper.get('input').setValue('Mordenkainen')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(profileApi.updateUsername).toHaveBeenCalledWith('Mordenkainen')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('Mordenkainen')
    expect(wrapper.text()).toContain('Pseudo enregistré.')
  })

  it('keeps the form open with the reason when the username is taken', async () => {
    vi.mocked(profileApi.updateUsername).mockRejectedValue(new ProfileApiError('Ce pseudo est déjà pris', 409))
    const wrapper = await mountIdentity()

    await wrapper.get('button[aria-label="Modifier le pseudo"]').trigger('click')
    await wrapper.get('input').setValue('Gandalf')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Ce pseudo est déjà pris')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  })

  it('cancels with Escape without saving', async () => {
    const wrapper = await mountIdentity()

    await wrapper.get('button[aria-label="Modifier le pseudo"]').trigger('click')
    await wrapper.get('input').setValue('Autre')
    await wrapper.get('input').trigger('keydown', { key: 'Escape' })

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('Elminster')
    expect(profileApi.updateUsername).not.toHaveBeenCalled()
  })
})
