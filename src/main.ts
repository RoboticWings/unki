import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "element-plus/theme-chalk/index.css";
import ElementPlus from "element-plus"
// import VueHotkey from "v-hotkey"

createApp(App)
    .use(store)
    .use(router)
    .use(ElementPlus)
    // .use(VueHotkey)
    .mount('#app')
