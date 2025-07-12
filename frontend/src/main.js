import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { Quasar, Notify } from 'quasar'
import 'quasar/dist/quasar.css'
import 'quasar/src/css/index.sass';
import '@quasar/extras/material-icons/material-icons.css'; 

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Quasar, {
	plugins: {
		Notify,
	},
	dark: true,
})

app.mount('#app');
