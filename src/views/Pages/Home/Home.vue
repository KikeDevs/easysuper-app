<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonTitle,
  IonContent,
  IonToast,
  onIonViewDidEnter,
  onIonViewWillEnter,
  onIonViewWillLeave,
} from "@ionic/vue";

import { App as CapacitorApp } from "@capacitor/app";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { getSaludo } from "@/utils/saludo";
import { useUiStore } from "@/stores/statusbar";
import { useProfileStore } from "@/stores/profile";

import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import CardCustom from "@/views/Components/CardCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import ModalIniciarCompra from "@/views/Pages/Compras/ModalIniciarCompra.vue";
import ModalProductosHome from "@/views/Pages/Home/ModalProductosHome.vue";
import AvatarPerfil from "@/views/Components/AvatarPerfil.vue";

// -------- estado existente --------

const ui = useUiStore();
const saludo = getSaludo();
const router = useRouter();
const profileStore = useProfileStore();

const canSeeOfertas = computed(() => profileStore.locationGranted);

const showBuscar = ref<boolean>(false);

const toast = ref({ show: false, message: "" });
function showToast(message: string) {
  toast.value.message = message;
  toast.value.show = true;
}

const perfilName = computed(() => {
  return profileStore.selected && profileStore.selected.name_perfil
    ? profileStore.selected.name_perfil
    : "";
});

function goListas(): void {
  router.push("listas");
}
function goOfertas(): void {
  if (canSeeOfertas.value) router.push("ofertas");
  else showToast("Sin la ubicacion no puede ver ofertas.");
}

const modalIniciar = ref<boolean>(false);
function closeModal(): void {
  modalIniciar.value = false;
}

// -------- DOBLE BACK PARA SALIR --------
let lastBackTime = 0;
let backListener: { remove: () => void } | null = null;

const contentStyle = computed(() => ({
  // usamos la var interna de IonContent
  "--padding-bottom": ui.footerPaddingBottom + 16 + "px", // 16 extra para respiro
}));

onIonViewDidEnter(async () => {
  await ui.refresh();
  backListener = await CapacitorApp.addListener(
    "backButton",
    ({ canGoBack }) => {
      if (canGoBack) {
        //router.back();
        return;
      }
      const now = Date.now();
      if (now - lastBackTime < 1000) {
        CapacitorApp.exitApp();
        return;
      }

      lastBackTime = now;
    },
  );
});

onIonViewWillLeave(() => {
  if (backListener) {
    backListener.remove();
    backListener = null;
  }
});
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border" id="header">
      <toolbar-custom
        class="px-2 padding-bottom"
        :style="{ paddingTop: ui.toolbarPaddingTop + 'px' }"
      >
        <ion-title>
          <div class="flex items-center gap-0.5">
            <img class="w-9 h-9" src="/assets/logo.png" alt="logo" />
            <p class="font-bold not-dark:text-blue-500">EasySuper</p>
          </div>
        </ion-title>
        <template #end>
          <ion-button
            fill="clear"
            shape="circle"
            class="text-neutral-800 dark:text-white"
            @click="async () => await router.push('mapa')"
          >
            <icon-custom icon="marker" size="xl" />
          </ion-button>

          <avatar-perfil />
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding" :style="contentStyle">
      <div class="w-full h-full flex flex-col gap-5">
        <!-- Buscador -->
        <div
          class="border-1 border-blue-400 rounded-full flex gap-1 items-center pl-2 dark:bg-[#2a2a2a] dark:border-[#2a2a2a]"
          @click="showBuscar = true"
        >
          <icon-custom
            icon="search"
            size="xl"
            class="text-blue-400 dark:text-white"
          />
          <div class="py-2 px-1 flex items-center">
            <p>Buscar Productos...</p>
          </div>
        </div>

        <!-- Portada -->
        <div class="flex-1 w-full h-full flex flex-col gap-5 mt-4">
          <div>
            <h4 class="tracking-wide text-xl">
              ¡Hola
              <span class="font-bold text-blue-600 dark:text-white">{{
                perfilName
              }}</span
              >!
            </h4>
            <p class="text-lg">{{ saludo }}</p>
          </div>

          <card-custom
            class="h-40 not-dark:bg-gray-50 relative mt-3"
            :ripple="true"
            @click="goListas"
          >
            <div class="absolute inset-0">
              <img
                class="w-full h-full"
                src="/assets/images/home/Mis-Listas-2.png"
              />
            </div>
            <div
              class="px-5 py-5 flex flex-col justify-center h-full not-dark:text-fuchsia-800"
            >
              <p class="text-4xl font-bold">Mis listas</p>
              <p class="w-3/5 leading-4 text-sm">
                Gestionar tus listas y agregar productos
              </p>
            </div>
          </card-custom>

          <card-custom
            class="h-24 bg-blue-400 text-white dark:bg-blue-400 relative"
            :ripple="true"
            @click="modalIniciar = true"
          >
            <div class="absolute inset-0">
              <img src="/assets/images/home/Iniciar-Compra-2.png" />
            </div>
            <div class="py-3 px-5 flex flex-col w-full h-full justify-center">
              <p>Iniciar</p>
              <p class="text-3xl tracking-wide font-bold">COMPRA</p>
            </div>
          </card-custom>

          <card-custom
            class="h-24 bg-fuchsia-700 text-white dark:bg-fuchsia-700 relative"
            :class="[canSeeOfertas ? '' : 'opacity-40']"
            :ripple="true"
            @click="goOfertas"
          >
            <div class="py-3 px-5 flex flex-col justify-center h-full">
              <p class="text-3xl font-bold tracking-wide">OFERTAS</p>
            </div>
            <div class="absolute inset-0">
              <img src="/assets/images/home/Ofertas-2.png" alt="" />
            </div>
          </card-custom>
        </div>
      </div>

      <modal-productos-home
        v-model:is-open="showBuscar"
        @close="showBuscar = false"
      />

      <modal-iniciar-compra
        v-model:is-open="modalIniciar"
        @close="closeModal"
      />

      <ion-toast
        :is-open="toast.show"
        :duration="2000"
        :message="toast.message"
        position="bottom"
        @didDismiss="toast.show = false"
      />
    </ion-content>
  </ion-page>
</template>
