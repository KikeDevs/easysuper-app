<script setup lang="ts">
import {
  IonPage,
  IonAvatar,
  IonHeader,
  IonTitle,
  IonContent,
  IonToast,
  IonRippleEffect, onIonViewDidEnter, onIonViewWillEnter,
} from "@ionic/vue";

import { App as CapacitorApp } from "@capacitor/app";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { getSaludo } from "@/utils/saludo";
import { useUiStore } from "@/stores/statusbar";
import { useProfileStore } from "@/stores/profile";
import { colorFromTextStable } from "@/utils/colorFromText";

import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import CardCustom from "@/views/Components/CardCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import ModalIniciarCompra from "@/views/Pages/Compras/ModalIniciarCompra.vue";
import ModalProductosHome from "@/views/Pages/Home/ModalProductosHome.vue";

// -------- estado existente --------

const ui = useUiStore()
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

function goConfigs(): void { router.push("configs"); }
function goListas(): void { router.push("listas"); }
function goOfertas(): void {
  if (canSeeOfertas.value) router.push("ofertas");
  else showToast("Sin la ubicacion no puede ver ofertas.");
}

const bg = computed(() =>
    colorFromTextStable(profileStore.selected?.name_perfil ?? "")
);

const modalIniciar = ref<boolean>(false);
function closeModal(): void {
  modalIniciar.value = false;
}

// -------- DOBLE BACK PARA SALIR --------
let lastBackTime = 0;
let backListener: { remove: () => void } | null = null;

onIonViewDidEnter(async () => {
  await ui.refresh();
  backListener = await CapacitorApp.addListener("backButton", ({canGoBack}) => {
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
  });
})

onIonViewWillEnter(() => {
  if (backListener) {
    backListener.remove();
    backListener = null;
  }
});
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border" id="header" :translucent="true">
      <toolbar-custom class="px-2 padding-bottom" :style="{ paddingTop: ui.toolbarPaddingTop + 'px'}">
        <ion-title>
          <div class="flex items-center gap-0.5">
            <img class="w-9 h-9" src="/assets/logo.png" alt="logo"/>
            <p class="font-bold not-dark:text-blue-500">EasySuper</p>
          </div>
        </ion-title>
        <template #end>
          <div v-if="profileStore.locationGranted" class="relative w-8 h-8 overflow-hidden flex items-center justify-center mr-2 rounded-full ion-activatable"
               @click="async () => await router.push('mapa')">
            <icon-custom icon="marker" size="xl"/>
            <ion-ripple-effect/>
          </div>

          <ion-avatar class="w-8 h-8 flex items-center justify-center" @click="goConfigs" :style="{background: bg}">
            <icon-custom icon="user" size="xl" class="text-white"/>
          </ion-avatar>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content :scroll-y="false" :fullscreen="true" class="ion-padding">
      <div class="w-full h-full flex flex-col gap-5">

        <!-- Buscador -->
        <div class="border-1 border-blue-400 rounded-full flex gap-1 items-center pl-2 dark:bg-[#2a2a2a] dark:border-[#2a2a2a]" @click="showBuscar = true">
          <icon-custom icon="search" size="xl" class="text-blue-400 dark:text-white"/>
          <div class="py-2 px-1 flex items-center">
            <p>Buscar Productos...</p>
          </div>
        </div>

        <!-- Portada -->
        <div class="flex-1 w-full h-full flex flex-col gap-5 justify-center">
          <div>
            <h4 class="tracking-wide">
              ¡Hola
              <span class="font-bold text-blue-600 dark:text-white">{{ profileStore.selected?.name_perfil ?? '' }}</span>!
            </h4>
            <p>{{ saludo }}</p>
          </div>

          <card-custom class="h-40 not-dark:bg-gray-50 relative" :ripple="true" @click="goListas">
            <div class="absolute inset-0">
              <img class="w-full h-full" src="/assets/images/home/Mis-Listas-2.png">
            </div>
            <div class="px-5 py-5 flex flex-col justify-center h-full not-dark:text-fuchsia-800">
              <p class="text-4xl font-bold">Mis listas</p>
              <p class="w-3/5 leading-4 text-sm">Gestionar tus listas y agregar productos</p>
            </div>
          </card-custom>

          <card-custom
              class="h-24 bg-blue-400 text-white dark:bg-blue-400 relative"
              :ripple="true"
              @click="() => modalIniciar = true"
          >
            <div class="absolute inset-0">
              <img src="/assets/images/home/Iniciar-Compra-2.png">
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
              <img src="/assets/images/home/Ofertas-2.png" alt="">
            </div>
          </card-custom>
        </div>
      </div>

      <modal-productos-home
          v-model:is-open="showBuscar"
          :t-top="ui.toolbarPaddingTop"
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
