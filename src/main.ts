import { createApp } from "vue";
import {createPinia, setActivePinia} from "pinia";
import App from "./App.vue";
import router from "./router/router";
import { IonicVue } from "@ionic/vue";
import { useAuthStore } from "@/stores/auth";
import { wireApiAuth } from "@/services/api";
import { installGuards } from "@/router/guard";

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
import '@flaticon/flaticon-uicons/css/regular/rounded.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
async function bootstrap() {
    const app = createApp(App);
    const pinia = createPinia();

    app.use(IonicVue);
    app.use(pinia);
    app.use(router);

    const auth = useAuthStore();

    // 1) Cargar sesión desde Preferences (nativo)
    await auth.loadFromPreferences();

    setActivePinia(pinia);
    // 2) Interceptor que leerá el token del store
    wireApiAuth();

    // 3) Guards (ya pueden leer auth)
    installGuards(router);

    // 4) Listo el enrutador
    await router.isReady();

    // 5) Si ya hay sesión, salta login
    if (auth.isLogged && router.currentRoute.value.path === "/") {
        await router.replace("/users"); // o tu home
    }

    app.mount("#app");
}

bootstrap();