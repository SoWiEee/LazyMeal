import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { Quasar } from 'quasar';
import 'quasar/src/css/index.sass';
import '@quasar/extras/material-icons/material-icons.css'; 

const pinia = createPinia()
createApp(App).use(pinia).use(router).use(Quasar, {dark: true}).mount('#app')
