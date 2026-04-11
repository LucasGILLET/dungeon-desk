import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Dice3D, { type DiceRollVisual } from '@/components/Dice3D.vue'

const rollMock = vi.fn<(notation: string) => Promise<unknown[]>>(async () => [])
const initializeMock = vi.fn(async () => undefined)

vi.mock('@3d-dice/dice-box-threejs', () => {
  const DiceBoxMock = vi.fn().mockImplementation(() => ({
    initialize: initializeMock,
    roll: rollMock,
  }))

  return {
    default: DiceBoxMock,
  }
})

async function flushDiceLifecycle() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('Dice3D', () => {
  beforeEach(() => {
    rollMock.mockClear()
    initializeMock.mockClear()
  })

  it('renders each d100 as d100+d10 for 2d100', async () => {
    const dice: DiceRollVisual[] = [
      { sides: 100, value: 72, key: 'd100-a' },
      { sides: 100, value: 5, key: 'd100-b' },
    ]

    mount(Dice3D, {
      props: {
        dice,
        rollKey: 'roll-2d100',
        size: 'sm',
      },
    })

    await flushDiceLifecycle()

    expect(rollMock).toHaveBeenCalled()
    const notation = rollMock.mock.calls.at(-1)?.[0]
    expect(notation).toBe('2d100+2d10@70,100,2,5')
  })

  it('maps 100 to percentile 00 and units 0', async () => {
    const dice: DiceRollVisual[] = [
      { sides: 100, value: 100, key: 'd100-100' },
    ]

    mount(Dice3D, {
      props: {
        dice,
        rollKey: 'roll-100',
      },
    })

    await flushDiceLifecycle()

    const notation = rollMock.mock.calls.at(-1)?.[0]
    expect(notation).toBe('d100+d10@100,10')
  })
})
