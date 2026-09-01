import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";

const WEB_CLIENT_ID = '44256859496-mfvhts1qaha2o9pmc8f6vhge2bjp4bmi.apps.googleusercontent.com';

async function initSocialLogin(): Promise<void> {
    const platform = Capacitor.getPlatform();
    if (platform !== "android" && platform !== "ios" && platform !== "web") return;

    try {
        await SocialLogin.initialize({
            google: {
                webClientId: WEB_CLIENT_ID,
                mode: 'online',
                // Fija el redirect_uri en web a la raíz del sitio, en vez de la página
                // actual (window.location.pathname), para que solo haya que autorizar
                // una URL en Google Cloud Console en lugar de una por cada ruta.
                ...(platform === 'web' ? { redirectUrl: window.location.origin + '/' } : {})
            },
            apple: {}
        });
    } catch (e) {
        console.warn("[SocialLogin] initialize error (non-fatal):", e);
    }
}

// Arranca la inicialización nativa en cuanto se importa este módulo (desde main.ts),
// para que Login.ts pueda esperar esta misma promesa antes de llamar a SocialLogin.login
// y así evitar "Cannot find provider 'google'" si el usuario toca el botón muy rápido.
export const socialLoginReady: Promise<void> = initSocialLogin();
