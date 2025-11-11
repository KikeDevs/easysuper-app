import { defineStore } from "pinia";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar } from "@capacitor/status-bar";

type Mobile = "android" | "ios";

function readSafeTopFallback(platform: Mobile): number {
    const cs  = getComputedStyle(document.documentElement);
    const ion = cs.getPropertyValue("--ion-safe-area-top").trim();
    const px  = Number.parseFloat(ion || "0");
    if (Number.isFinite(px) && px > 0) return px;

    const tmp = document.createElement("div");
    tmp.style.cssText =
        "position:fixed;top:0;height:constant(safe-area-inset-top);height:env(safe-area-inset-top);";
    document.body.appendChild(tmp);
    const envPx = parseFloat(getComputedStyle(tmp).height) || 0;
    document.body.removeChild(tmp);
    if (envPx > 0) return envPx;

    return platform === "android" ? 32 : 0;
}

export const useUiStore = defineStore("ui", {
    state: () => ({
        platform: (Capacitor.getPlatform() === "android" ? "android" : "ios") as Mobile,

        // TOP (status bar)
        topOverlay: false, // Android: StatusBar.getInfo().overlays
        safeTop: 0,        // px (solo se usa si topOverlay=true en Android)

        // BOTTOM (solo para exportar como var CSS; el cálculo lo hace el getter)
        safeBottom: 0,
    }),
    getters: {
        // Header/toolbar: solo si status bar es flotante en Android
        toolbarPaddingTop(s): number {
            if (s.platform === "android" && s.topOverlay) return s.safeTop;
            return 0; // iOS no overlay top con Capacitor
        },
        // Footer: TU REGLA (solo Android). iOS = 0 siempre.
        footerPaddingBottom(s): number {
            if (s.platform === "android") {
                // Si el status bar NO es overlay ⇒ barra de navegación SÍ es overlay ⇒ 32px
                return s.topOverlay ? 0 : 32;
            }
            // iOS: sin padding extra
            return 0;
        },
    },
    actions: {
        async refresh() {
            if (this.platform === "android") {
                // 1) Saber si el TOP es overlay
                try {
                    const info = await StatusBar.getInfo() as any;
                    this.topOverlay = !!info?.overlays;
                } catch {
                    this.topOverlay = false;
                }

                // 2) Calcular TOP padding solo si es overlay
                this.safeTop = this.topOverlay ? readSafeTopFallback(this.platform) : 0;

                // 3) BOTTOM: solo reflejamos el getter (para exponer var CSS)
                this.safeBottom = this.footerPaddingBottom;
            } else {
                // iOS: top nunca overlay; bottom sin padding extra
                this.topOverlay = false;
                this.safeTop    = 0;
                this.safeBottom = 0;
            }

            // Exponer CSS vars globales
            document.documentElement.style.setProperty("--ui-safe-top", `${this.toolbarPaddingTop}px`);
            document.documentElement.style.setProperty("--ui-safe-bottom", `${this.footerPaddingBottom}px`);
        },

        startListeners() {
            App.addListener("resume", () => this.refresh());
            window.addEventListener("orientationchange", () => this.refresh());
        },

        log() {
            console.log({
                platform: this.platform,
                topOverlay: this.topOverlay,
                safeTop: this.safeTop,
                footerPaddingBottom: this.footerPaddingBottom,
            });
        },
    },
});
