import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Particles from "@tsparticles/vue3";
import { loadSlim } from "@tsparticles/slim"; // Correct import for v3
import { createAuth0 } from '@auth0/auth0-vue';

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    },
    cacheLocation: 'localstorage',
  })
);
app.use(Particles, {
  init: async (engine: any) => {
    await loadSlim(engine);
  },
});

app.mount('#app')
