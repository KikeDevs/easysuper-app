import { defineStore } from "pinia";
import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";
import { Device } from "@capacitor/device";

type Mobile = "android" | "ios";

function readSafeTopFallback(platform: Mobile): number {
  const cs = getComputedStyle(document.documentElement);
  const ion = cs.getPropertyValue("--ion-safe-area-top").trim();
  const px = Number.parseFloat(ion || "0");
  if (Number.isFinite(px) && px > 0) return px;

  const tmp = document.createElement("div");
  tmp.style.cssText =
    "position:fixed;top:0;height:constant(safe-area-inset-top);height:env(safe-area-inset-top);";
  document.body.appendChild(tmp);
  const envPx = parseFloat(getComputedStyle(tmp).height) || 0;
  document.body.removeChild(tmp);

  if (envPx > 0) return envPx;

  return platform === "android" ? 32 : 20;
}

function readSafeBottomFallback(platform: Mobile): number {
  const cs = getComputedStyle(document.documentElement);
  const ion = cs.getPropertyValue("--ion-safe-area-bottom").trim();
  const px = Number.parseFloat(ion || "0");
  if (Number.isFinite(px) && px > 0) return px;

  const tmp = document.createElement("div");
  tmp.style.cssText =
    "position:fixed;bottom:0;height:constant(safe-area-inset-bottom);height:env(safe-area-inset-bottom);";
  document.body.appendChild(tmp);
  const envPx = parseFloat(getComputedStyle(tmp).height) || 0;
  document.body.removeChild(tmp);

  if (envPx > 0) return envPx;

  if (platform === "android") return 32;
  return 15;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// 👇 extra fijo por API (para que NO quede debajo)
function extraBottomByAndroidSdk(sdk: number): number {
  switch (sdk) {
    case 30:
    case 31:
    case 32:
    case 33:
      return 16; // Android 11–13 (API 30–33) suelen necesitar más
    case 34:
    case 35:
    case 36:
      return 12; // Android 14+ (API 34+) normalmente un poco menos
    default:
      return 0;
  }
}
function extraTopByAndroidSdk(sdk: number): number {
  switch (sdk) {
    case 30:
    case 31:
    case 32:
    case 33:
      return 14; // Android 11–13 (API 30–33) suele faltar un poquito arriba
    case 34:
    case 35:
    case 36:
      return 8; // Android 14+ (API 34+) un poquito menos
    default:
      return 0;
  }
}

export const useUiStore = defineStore("ui", {
  state: () => ({
    platform: (Capacitor.getPlatform() === "android"
      ? "android"
      : "ios") as Mobile,

    topOverlay: false,
    safeTop: 0,
    safeBottom: 0,

    androidMajor: 0, // 13, 14, 15...
    androidSdk: 0, // 30, 31, 32...
  }),
  getters: {
    toolbarPaddingTop(s): number {
      return s.safeTop;
    },
    footerPaddingBottom(s): number {
      return s.safeBottom;
    },
  },
  actions: {
    async ensureAndroidVersionLoaded() {
      if (this.platform !== "android") return;
      if (this.androidMajor && this.androidSdk) return;

      const info = await Device.getInfo();

      // Major (14, 15...) desde osVersion
      const rawMajor = (info.osVersion || "0").split(".")[0];
      const major = Number.parseInt(rawMajor, 10);
      this.androidMajor = Number.isFinite(major) ? major : 0;

      // API Level (30, 31...) si está disponible en tu Capacitor
      const sdkRaw = (info as any)?.androidSDKVersion;
      const sdkNum = Number.parseInt(String(sdkRaw ?? "0"), 10);
      this.androidSdk = Number.isFinite(sdkNum) ? sdkNum : 0;
    },

    /**
     * Mantiene lo que ya tenías:
     * - Antes: solo sumabas bottom en Android 14+ (según androidMajor)
     *
     * Ajuste pedido:
     * - Si detectamos API 30 (y de ahí para arriba), también suma bottom
     *   (porque tú ya viste que ahí se comporta como “15+”)
     */
    shouldApplyBottomInset(): boolean {
      if (this.platform !== "android") return true;

      // 1) Si tenemos API level, mandamos con switch
      if (this.androidSdk) {
        switch (this.androidSdk) {
          // ✅ Ajuste: API 30+ SUMA bottom
          case 30: // Android 11
          case 31: // Android 12
          case 32: // Android 12L
          case 33: // Android 13
          case 34: // Android 14
          case 35: // Android 15
          case 36: // Android 16
            return true;

          // ⛔️ Todo lo menor se queda COMO ESTABA (no sumar)
          // (si luego notas que en 29 también te pasa, lo agregamos aquí)
          case 29:
          case 28:
          case 27:
          case 26:
          case 25:
          case 24:
          case 23:
          case 22:
          case 21:
          default:
            // si es un API raro/antiguo, conservamos “no sumar”
            return false;
        }
      }

      // 2) Si NO tenemos androidSDKVersion (Capacitor viejo),
      // dejamos tu lógica original: Android 14+ suma, si no, 0
      return this.androidMajor >= 14;
    },
    shouldApplyTopInset(): boolean {
      if (this.platform !== "android") return true;

      // ✅ En API 30+ lo forzamos (edge-to-edge aunque overlays diga otra cosa)
      if (this.androidSdk) return this.androidSdk >= 30;

      // fallback a tu lógica anterior si no existe androidSDKVersion:
      return this.topOverlay === true;
    },

    async refresh() {
      if (this.platform === "android") {
        await this.ensureAndroidVersionLoaded();

        // TOP
        try {
          const info = (await StatusBar.getInfo()) as any;
          this.topOverlay = !!info?.overlays;
        } catch {
          this.topOverlay = false;
        }
        const baseTop = readSafeTopFallback(this.platform);

        // extra: si no tenemos androidSdk por Capacitor viejo, usa major como fallback
        const extraTop = this.androidSdk
          ? extraTopByAndroidSdk(this.androidSdk)
          : this.androidMajor >= 14
          ? 8
          : 0;

        // ✅ TOP: conserva tu lógica vieja, pero en API 30+ fuerza inset
        if (this.shouldApplyTopInset()) {
          this.safeTop = clamp(baseTop + extraTop, 0, 80);
        } else {
          this.safeTop = 0;
        }

        // BOTTOM (conserva tu comportamiento + API 30+ también suma)
        // BOTTOM (conserva tu comportamiento + API 30+ también suma)
        if (this.shouldApplyBottomInset()) {
          const base = readSafeBottomFallback(this.platform);

          // 👇 si no tenemos androidSdk por Capacitor viejo, usa major como fallback
          const extra = this.androidSdk
            ? extraBottomByAndroidSdk(this.androidSdk)
            : this.androidMajor >= 14
            ? 12
            : 0;

          this.safeBottom = clamp(base + extra, 0, 80);
        } else {
          this.safeBottom = 0;
        }
      } else {
        // iOS
        this.topOverlay = true;
        this.safeTop = readSafeTopFallback(this.platform);
        this.safeBottom = readSafeBottomFallback(this.platform);
      }
    },
  },
});
