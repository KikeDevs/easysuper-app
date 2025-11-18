import { defineStore } from "pinia";
import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import { Device } from "@capacitor/device";

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

    // fallback duro
    return platform === "android" ? 32 : 20; // en iOS casi siempre ~20+
}

function readSafeBottomFallback(platform: Mobile): number {
    const cs  = getComputedStyle(document.documentElement);
    const ion = cs.getPropertyValue("--ion-safe-area-bottom").trim();
    const px  = Number.parseFloat(ion || "0");
    if (Number.isFinite(px) && px > 0) return px;

    const tmp = document.createElement("div");
    tmp.style.cssText =
        "position:fixed;bottom:0;height:constant(safe-area-inset-bottom);height:env(safe-area-inset-bottom);";
    document.body.appendChild(tmp);
    const envPx = parseFloat(getComputedStyle(tmp).height) || 0;
    document.body.removeChild(tmp);

    if (envPx > 0) return envPx;

    // fallback duro si TODO falla
    if (platform === "android") return 32;
    return 15;
}

export const useUiStore = defineStore("ui", {
    state: () => ({
        platform: (Capacitor.getPlatform() === "android" ? "android" : "ios") as Mobile,

        topOverlay: false,
        safeTop: 0,
        safeBottom: 0,

        androidMajor: 0, // 13, 14, 15...
    }),
    getters: {
        // 👉 Ahora SIEMPRE usa safeTop; en plataformas donde no aplica será 0
        toolbarPaddingTop(s): number {
            return s.safeTop;
        },
        footerPaddingBottom(s): number {
            return s.safeBottom;
        },
    },
    actions: {
        async ensureAndroidVersionLoaded() {
            if (this.platform !== "android" || this.androidMajor) return;

            const info = await Device.getInfo();
            const raw  = (info.osVersion || "0").split(".")[0];
            const num  = Number.parseInt(raw, 10);
            this.androidMajor = Number.isFinite(num) ? num : 0;
        },

        async refresh() {
            if (this.platform === "android") {
                await this.ensureAndroidVersionLoaded();

                // TOP (status bar)
                try {
                    const info = await StatusBar.getInfo() as any;
                    this.topOverlay = !!info?.overlays;
                } catch {
                    this.topOverlay = false;
                }
                this.safeTop = this.topOverlay ? readSafeTopFallback(this.platform) : 0;

                // BOTTOM según versión Android:
                if (this.androidMajor >= 15) {
                    // Android 15+ → barra overlay, hay que sumar inset
                    this.safeBottom = readSafeBottomFallback(this.platform);
                    if (this.safeBottom < 0)  this.safeBottom = 0;
                    if (this.safeBottom > 50) this.safeBottom = 50;
                } else {
                    // Android 14 y abajo → barra fija, NO sumamos nada
                    this.safeBottom = 0;
                }
            } else {
                // 👉 iOS: también leemos los insets reales
                this.topOverlay = true; // conceptualmente siempre está encima
                this.safeTop    = readSafeTopFallback(this.platform);
                this.safeBottom = readSafeBottomFallback(this.platform);
            }
        },
    },
});
