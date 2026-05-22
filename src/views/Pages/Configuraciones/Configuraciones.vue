<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonBackButton,
  IonHeader,
  IonToast,
  onIonViewDidEnter,
  alertController,
} from "@ionic/vue";

import ItemUser from "@/views/Components/ItemUser.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import CardCustom from "@/views/Components/CardCustom.vue";
import BtnCard from "@/views/Components/BtnCard.vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";

import { useProfileStore } from "@/stores/profile";
import { Profile } from "@/interfaces/types";
import { computed, ref } from "vue";
import { userPerfiles } from "@/api/UserProfiles";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { logOutUser } from "@/api/Login";
import { useUiStore } from "@/stores/statusbar";

import { Browser } from "@capacitor/browser";
import { Share } from "@capacitor/share";
import { Clipboard } from "@capacitor/clipboard";
import { App as CapApp } from "@capacitor/app";
import axios from "axios";
import {api} from "@/services/api";

const initLoading = ref(false);

const ui = useUiStore();
const router = useRouter();
const auth = useAuthStore();
const perfilActivo = computed(() => useProfileStore().selected?.profile_id);

const toast = ref({ show: false, message: "" });
function showToast(message: string) {
  toast.value.message = message;
  toast.value.show = true;
}

const allPerfiles = ref<Profile[]>([]);
async function getPerfiles(): Promise<void> {
  const resp = await userPerfiles();

  if (resp.status !== "ok") {
    showToast(resp.message);
  }

  allPerfiles.value = resp.profiles ? resp.profiles : [];
}

function onSelectProfile(p: Profile): void {
  useProfileStore().select(p);
}

function goPerfiles(): void {
  router.push("configs/admin-perfiles");
}

/** LINKS */
const PRIVACY_URL =
    "https://easysuper.cloud/aviso-de-privacidad";

const CREATE_ACCESS_LINK_URL =
    "http://easysuper.cloud/access-links/create";

/**
 * Link final de Play Store: NO cambia nunca.
 * Lo armamos con el AppId real (com.easysuper.app).
 */
async function getPlayStoreUrl(): Promise<{ https: string; market: string }> {
  try {
    const info = await CapApp.getInfo();
    const appId = info?.id || "com.easysuper.app";
    return {
      https: `https://play.google.com/store/apps/details?id=${appId}`,
      market: `market://details?id=${appId}`,
    };
  } catch {
    return {
      https: "https://play.google.com/store/apps/details?id=com.easysuper.app",
      market: "market://details?id=com.easysuper.app",
    };
  }
}

async function openPlayStoreListing(): Promise<void> {
  const { market, https } = await getPlayStoreUrl();

  if (!window?.Capacitor?.isNativePlatform?.()) {
    await openExternal(https);
    return;
  }

  try {
    window.open(market, "_system");
  } catch {
    await openExternal(https);
  }
}

async function openExternal(url: string): Promise<void> {
  try {
    await Browser.open({ url });
  } catch {
    window.open(url, "_system");
  }
}

async function onRateApp(): Promise<void> {
  const { https } = await getPlayStoreUrl();
  await openExternal(https);
}

async function onRecommendApp(): Promise<void> {
  const { https } = await getPlayStoreUrl();
  const message =
      `Te recomiendo Easy Súper\n` +
      `para facilitarte tu lista de productos y nunca olvides algo:\n${https}`;

  try {
    await Share.share({
      title: "Easy Súper",
      text: message,
      url: https,
      dialogTitle: "Recomendar Easy Súper",
    });
  } catch {
    await openExternal(https);
  }
}

async function onOpenPrivacy(): Promise<void> {
  await openExternal(PRIVACY_URL);
}

async function confirmCloseSesion(): Promise<void> {
  const alert = await alertController.create({
    header: "Cerrar Sesión",
    message: "¿Seguro que quieres cerrar sesión?",
    buttons: [
      { text: "Cancelar", role: "cancel" },
      { text: "Confirmar", role: "destructive", handler: async () => await cerrarSesion() },
    ],
  });
  await alert.present();
}

async function cerrarSesion(): Promise<void> {
  await logOutUser();
  await auth.logoutAndReset();
  await router.replace("/");
}

const contentStyle = computed(() => ({
  "--padding-bottom": (ui.footerPaddingBottom + 16) + "px",
}));

const appVersion = ref<string>("");

async function loadAppVersion(): Promise<void> {
  try {
    const info = await CapApp.getInfo();
    appVersion.value = info.build
        ? `${info.version} (${info.build})`
        : info.version;
  } catch {
    appVersion.value = "";
  }
}

async function createAccessLinkRequest(user_id: number) {
  const resp = await api.post('access-links/create', {
    user_id,
  });
  return resp.data;
}

const sharingInvite = ref(false);

async function onShareInviteLink(): Promise<void> {
  if (sharingInvite.value) return;

  sharingInvite.value = true;
  try {
    const userId = auth.user?.user_id;

    if (!userId) {
      showToast("No se encontró el usuario actual.");
      return;
    }

    const resp = await createAccessLinkRequest(userId);

    if (resp.status !== "ok" || !resp.url) {
      showToast(resp.message || "No se pudo generar el link.");
      return;
    }

    await Share.share({
      title: "Invitación a Easy Súper",
      text: "Únete a mi cuenta de Easy Súper 🛒✨",
      url: resp.url,
      dialogTitle: "Compartir invitación",
    });


  } catch (e: any) {
    showToast(e?.response?.data?.message || e?.message || "No se pudo compartir.");
  } finally {
    sharingInvite.value = false;
  }
}

async function onCopyInviteLink(): Promise<void> {
  if (sharingInvite.value) return;

  sharingInvite.value = true;
  try {
    const userId = auth.user?.user_id;

    if (!userId) {
      showToast("No se encontró el usuario actual.");
      return;
    }

    const resp = await createAccessLinkRequest(userId);

    if (resp.status !== "ok" || !resp.url) {
      showToast(resp.message || "No se pudo generar el link.");
      return;
    }

    await Clipboard.write({ string: resp.url });
    showToast("Link copiado al portapapeles.");
  } catch (e: any) {
    showToast(e?.response?.data?.message || e?.message || "No se pudo copiar.");
  } finally {
    sharingInvite.value = false;
  }
}

onIonViewDidEnter(async () => {
  initLoading.value = true;
  try {
    await Promise.all([getPerfiles(), ui.refresh(), loadAppVersion()]);
  } finally {
    initLoading.value = false;
  }
});
</script>

<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <toolbar-custom class="px-2" :style="{ paddingTop: ui.toolbarPaddingTop + 'px' }">
        <template #start>
          <ion-back-button size="small" />
        </template>
        <template #end></template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding" :style="contentStyle">
      <div class="w-full h-full flex flex-col gap-5">
        <div class="flex min-h-32 overflow-x-auto gap-5">
          <item-user
              v-for="p in allPerfiles"
              :key="p.profile_id"
              :profile="p"
              :edit="false"
              @select="onSelectProfile(p)"
              :class="[perfilActivo === p.profile_id ? 'font-bold italic' : '']"
          />
        </div>

        <div class="flex justify-center">
          <btn-primary shape="round" size="large" class="w-[70vw]" @click="goPerfiles">
            Administra los perfiles
          </btn-primary>
        </div>

        <div class="w-full h-full flex-1">
          <card-custom>
            <btn-card
                text="Cuenta"
                icon="angle-right"
                class="border-b-1 not-dark:border-gray-300"
                @click="router.push('configs/cuenta')"
            />

            <btn-card
                text="Invitar a esta cuenta"
                icon="share"
                class="border-b-1 not-dark:border-gray-300"
                @click="onShareInviteLink"
            />

            <btn-card
                text="Copiar link de invitación"
                icon="link"
                class="border-b-1 not-dark:border-gray-300"
                @click="onCopyInviteLink"
            />

            <btn-card
                text="Recomendar"
                icon="heart"
                class="border-b-1 not-dark:border-gray-300"
                @click="onRecommendApp"
            />

            <btn-card
                text="Condiciones de privacidad"
                icon="angle-right"
                class="border-b-1 not-dark:border-gray-300"
                @click="onOpenPrivacy"
            />

            <btn-card
                text="Información de la app"
                icon="arrow-up-right-from-square"
                class="border-b-1 not-dark:border-gray-300"
                @click="openPlayStoreListing"
            />

            <btn-card
                text="Califícanos"
                icon="star"
                class="border-b-1 not-dark:border-gray-300"
                @click="openPlayStoreListing"
            />

            <btn-card text="Cerrar sesión" icon="angle-right" @click="confirmCloseSesion()" />
          </card-custom>
        </div>

        <p class="text-sm" v-if="appVersion">Versión de la aplicación {{ appVersion }}</p>
        <div class="min-h-8"></div>
      </div>

      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          @didDismiss="toast.show = false"
          :message="toast.message"
      />

      <loader-normal :open="initLoading" />
    </ion-content>
  </ion-page>
</template>

<style scoped></style>