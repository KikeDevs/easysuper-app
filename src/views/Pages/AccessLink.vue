<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonImg,
  IonButton,
  IonModal,
  useIonRouter
} from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/statusbar";
import {api} from "@/services/api";
import {getUrl} from "@/services/services";

const route = useRoute();
const ionRouter = useIonRouter();
const auth = useAuthStore();
const ui = useUiStore();

const loading = ref(true);
const success = ref(false);

const dialog = ref({
  open: false,
  title: "Info",
  message: ""
});

let dialogTimer: number | null = null;

function showToast(message: string, title = "Info"): void {
  dialog.value = {
    open: true,
    title,
    message,
  };

  if (dialogTimer) window.clearTimeout(dialogTimer);
  dialogTimer = window.setTimeout(() => {
    dialog.value.open = false;
  }, 3000);
}

const token = computed(() => String(route.params.token || "").trim());

async function getDeviceId(): Promise<string> {
  const key = "device_name";
  const saved = await Preferences.get({ key });

  if (saved.value) return saved.value;

  const random =
      globalThis.crypto?.randomUUID?.() ??
      `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const deviceId = `app-${Capacitor.getPlatform()}-${random}`;

  await Preferences.set({
    key,
    value: deviceId,
  });

  return deviceId;
}

async function exchangeAccessLinkRequest(tokenValue: string) {
  const device_name = await getDeviceId();

  const resp = await api.post('access-links/exchange', {
    token: tokenValue,
    device_name,
  });

  return resp.data;
}

async function processAccess(): Promise<void> {
  if (!token.value) {
    loading.value = false;
    showToast("El link no contiene un token válido.", "Error");
    return;
  }

  try {
    const resp = await exchangeAccessLinkRequest(token.value);

    if (resp.status === "ok") {
      if (resp.token && resp.user) {
        await auth.setSession(resp.token, resp.user);
      }

      success.value = true;
      loading.value = false;
      localStorage.removeItem("pending_access_token");
      showToast(resp.message || "Acceso correcto.", "Listo");

      setTimeout(() => {
        ionRouter.replace("/users");
      }, 600);

      return;
    }

    loading.value = false;
    showToast(resp.message || "No se pudo acceder con el link.", "Error");
  } catch (e: any) {
    loading.value = false;
    const msg = e?.response?.data?.message || e?.message || "Error de red.";
    showToast(msg, "Error");
  }
}

function goLogin(): void {
  ionRouter.replace("/");
}

onMounted(async () => {
  await ui.refresh();
  await processAccess();
});
</script>

<template>
  <ion-page>
    <toolbar-custom class="px-2" :style="{ paddingTop: ui.toolbarPaddingTop + 'px' }" />

    <ion-content class="ion-padding">
      <div class="w-full h-full flex flex-col items-center justify-center gap-6 text-center">
        <ion-img class="w-28 h-28" src="/assets/logo.png" alt="logo" />

        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold not-dark:text-blue-400">
            Accediendo...
          </h1>

          <p v-if="loading && !success">
            Estamos validando tu link de acceso.
          </p>

          <p v-if="success">
            Acceso correcto, entrando a la cuenta...
          </p>

          <p v-if="!loading && !success">
            No fue posible acceder con este link.
          </p>
        </div>

        <div v-if="loading" class="flex flex-col items-center gap-3">
          <div class="loader-access"></div>
          <p class="text-sm opacity-70">Espera un momento</p>
        </div>

        <div v-if="!loading && !success" class="w-full max-w-sm flex flex-col gap-3 mt-2">
          <btn-primary shape="round" size="large" class="w-full" @click="processAccess">
            Intentar de nuevo
          </btn-primary>

          <ion-button fill="clear" class="normal-case" @click="goLogin">
            Ir al inicio
          </ion-button>
        </div>
      </div>

      <ion-modal
          :is-open="dialog.open"
          :backdrop-dismiss="true"
          :show-backdrop="true"
          class="mini-dialog"
          @didDismiss="dialog.open = false"
      >
        <div class="mini-card">
          <p class="mini-title">{{ dialog.title }}</p>
          <p class="mini-msg">{{ dialog.message }}</p>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.mini-dialog {
  --width: 85%;
  --max-width: 320px;
  --height: auto;
  --border-radius: 18px;
  --backdrop-opacity: 0.35;
  --background: oklch(62.3% 0.214 259.815);
}

.mini-card {
  padding: 14px 16px;
  text-align: center;
}

.mini-title {
  font-weight: 700;
  font-size: 16px;
  margin: 0 0 6px 0;
  color: white;
}

.mini-msg {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  color: white;
}

.loader-access {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 4px solid rgba(0, 0, 0, 0.12);
  border-top-color: oklch(62.3% 0.214 259.815);
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>