import vue from '@vitejs/plugin-vue'
import path from 'path'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [UnoCSS(), vue()],
	base: './',
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@electron": path.resolve(__dirname, "./electron")
		}
	},
	build: {
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				dead_code: true,
				conditionals: true,
				evaluate: true,
				booleans: true,
				loops: true,
				unused: true,
				hoist_funs: true,
				keep_fargs: false,
				hoist_vars: true,
				if_return: true,
				join_vars: true,
				side_effects: true,
			},
			mangle: {
				toplevel: true,
				keep_classnames: false,
				keep_fnames: false
			},
			output: {
				beautify: false,
				comments: false
			}
		},
		chunkSizeWarningLimit: 1000, // 增加警告阈值
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						return 'vendor';
					}
				}
			}
		}
	}
})