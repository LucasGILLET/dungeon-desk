import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Particles from "@tsparticles/vue3";
import { loadSlim } from "@tsparticles/slim"; // Correct import for v3

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Particles, {
  init: async (engine: any) => {
    await loadSlim(engine);
  },
});

app.mount('#app')
