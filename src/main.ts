import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createPinia } from 'pinia'
import 'uno.css'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/global.css'
import { useSettingsStore } from './stores/settingsStore'
import './style.css'
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

const settingsStore = useSettingsStore()
settingsStore.loadSettings()

app.mount('#app')