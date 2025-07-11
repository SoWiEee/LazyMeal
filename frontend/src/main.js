import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { Quasar } from 'quasar'
import 'quasar/dist/quasar.css'
import 'quasar/src/css/index.sass';
import '@quasar/extras/material-icons/material-icons.css'; 

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Quasar, {
  plugins: {
    // Make sure 'Notify' is included here
    Notify: {}, // This ensures $q.notify is available
    // Other Quasar plugins you might use (e.g., Dialog, Loading)
  },
  // Other Quasar configurations (e.g., iconSet, config)
})
  
app.mount('#app');
