import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
    presets: [
        presetUno(),
    ],
    theme: {
        colors: {
            primary: 'rgba(64, 158, 255, 0.6)',
            secondary: '#2ecc71',
        }
    }
})