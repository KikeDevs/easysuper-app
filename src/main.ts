import App from "./App.vue";
import router from "./router/router";

import {createApp} from "vue";
import { wireApiAuth } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { installGuards } from "@/router/guard";
import {createPinia, setActivePinia} from "pinia";
import {createAnimation, IonicVue, type Animation} from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
import '@flaticon/flaticon-uicons/css/regular/rounded.css'

/* Basic CSS for apps built with Ionic */
//import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
//import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
//import '@ionic/vue/css/float-elements.css';
//import '@ionic/vue/css/text-alignment.css';
//import '@ionic/vue/css/text-transformation.css';
//import '@ionic/vue/css/flex-utils.css';
//import '@ionic/vue/css/display.css';

import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import {Capacitor} from "@capacitor/core";
import {SocialLogin} from "@capgo/capacitor-social-login";

const whatsappSlide = (_baseEl: HTMLElement, opts: any): Animation => {
    const DURATION = 600;
    const EASING   = "cubic-bezier(0.2, 0.8, 0.2, 1)";

    const enteringEl = opts.enteringEl as HTMLElement;
    const leavingEl  = opts.leavingEl  as HTMLElement | undefined;

    const backDirection = opts.direction === "back";

    const root = createAnimation();

    // --- ENTRA ---
    const enterFrom = backDirection ? "-100%" : "100%"; // back: entra desde la izquierda; forward: desde la derecha
    const enter = createAnimation()
        .addElement(enteringEl)
        .beforeRemoveClass("ion-page-invisible")
        .duration(DURATION)
        .easing(EASING)
        .fromTo("transform", `translateX(${enterFrom})`, "translateX(0)")
        .fromTo("opacity", "0.01", "1");

    root.addAnimation(enter);

    // --- SALE ---
    if (leavingEl) {
        const leaveTo = backDirection ? "100%" : "-100%"; // back: se va a la derecha; forward: a la izquierda
        const leave = createAnimation()
            .addElement(leavingEl)
            .duration(DURATION)
            .easing(EASING)
            .fromTo("transform", "translateX(0)", `translateX(${leaveTo})`)
            .fromTo("opacity", "1", "0.99"); // evita “repaint” raro
        root.addAnimation(leave);
    }

    // --- Progreso interactivo (swipe-back iOS) ---
    if (opts.progressCallback) {
        root.progressStart(true);
        opts.progressCallback((step: number) => {
            root.progressStep(step);
        });
        root.onFinish(() => {
            // @ts-ignore
            root.progressEnd(true);
        });
    }

    return root;
};

async function initSocialLogin(): Promise<void> {
    const WEB_CLIENT_ID = '542553177675-v47dtq5qerqt5ur6bd272264hsc2il8c.apps.googleusercontent.com';
    if (Capacitor.getPlatform() === "android" || Capacitor.getPlatform() === "ios") {
        await SocialLogin.initialize({
            google:{
                webClientId:WEB_CLIENT_ID,
            }
        });
    }
}

async function bootstrap() {
    const app = createApp(App);
    const pinia = createPinia();

    app.use(IonicVue, {navAnimation: whatsappSlide,animated:true});
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
initSocialLogin();