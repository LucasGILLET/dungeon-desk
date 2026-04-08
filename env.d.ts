/// <reference types="vite/client" />

declare module '@3d-dice/dice-box-threejs' {
	export interface DiceBoxConfig {
		assetPath?: string
		sounds?: boolean
		volume?: number
		shadows?: boolean
		strength?: number
		light_intensity?: number
		theme_surface?: string
		theme_material?: string
		theme_texture?: string
		theme_colorset?: string
		onRollComplete?: (results: unknown) => void
		[key: string]: unknown
	}

	export default class DiceBox {
		constructor(selector: string, config?: DiceBoxConfig)
		initialize(): Promise<void>
		roll(notation: string): Promise<unknown>
	}
}
