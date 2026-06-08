<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonModal, IonRippleEffect, useIonRouter } from "@ionic/vue";
import { ref } from "vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import BtnSecondary from "@/views/Components/BtnSecondary.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import { useGuestStore } from "@/stores/guest";
import { useUiStore } from "@/stores/statusbar";
import { Geolocation } from "@capacitor/geolocation";
import { Browser } from "@capacitor/browser";

const router = useIonRouter();
const ui = useUiStore();
const guestStore = useGuestStore();

const modalNueva = ref(false);
const nombreLista = ref("");
const modalRegistro = ref(false);

function crearLista() {
  if (!nombreLista.value.trim()) return;
  const lista = guestStore.addList(nombreLista.value.trim());
  nombreLista.value = "";
  modalNueva.value = false;
  router.push(`/guest/lista/${lista.id}`);
}

function verLista(id: string) {
  router.push(`/guest/lista/${id}`);
}

function irLogin() { router.push("/login"); }
function irRegister() { router.push("/register"); }

async function verSupermercados() {
  try {
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false });
    const { latitude, longitude } = pos.coords;
    await Browser.open({
      url: `https://www.google.com/maps/search/supermercados/@${latitude},${longitude},14z`
    });
  } catch {
    await Browser.open({
      url: "https://www.google.com/maps/search/supermercados"
    });
  }
}
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <toolbar-custom class="px-2" :style="{ paddingTop: ui.toolbarPaddingTop + 'px' }">
        <template #center>
          <p class="font-bold text-lg">Mis Listas</p>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Banner registro -->
      <div
        class="w-full rounded-2xl p-3 mb-4 flex items-center justify-between gap-2 not-dark:bg-blue-50 dark:bg-blue-950 border border-blue-300"
        @click="modalRegistro = true"
      >
        <div>
          <p class="font-bold text-sm not-dark:text-blue-700 dark:text-blue-300">Modo vista previa</p>
          <p class="text-xs not-dark:text-blue-600 dark:text-blue-400">Crea una cuenta para guardar y sincronizar tus listas</p>
        </div>
        <icon-custom icon="angle-right" size="xl" class="not-dark:text-blue-500" />
      </div>

      <!-- Botón mapa -->
      <div
        class="w-full rounded-2xl p-4 mb-4 flex items-center gap-3 ion-activatable relative overflow-hidden not-dark:bg-white dark:bg-[#1e1e1e] shadow-sm"
        @click="verSupermercados"
      >
        <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
          <icon-custom icon="map-marker" size="xl" class="text-white" />
        </div>
        <div>
          <p class="font-bold text-sm">Supermercados cercanos</p>
          <p class="text-xs text-gray-400">Ver en Google Maps</p>
        </div>
        <icon-custom icon="angle-right" size="xl" class="ml-auto" />
        <ion-ripple-effect />
      </div>

      <!-- Lista vacía -->
      <div v-if="guestStore.lists.length === 0" class="w-full flex flex-col items-center gap-3 py-10">
        <p class="text-gray-400">No tienes listas aún</p>
        <btn-primary shape="round" @click="modalNueva = true">Crear mi primera lista</btn-primary>
      </div>

      <!-- Listas -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="lista in guestStore.lists"
          :key="lista.id"
          class="w-full rounded-2xl p-4 flex items-center justify-between ion-activatable relative overflow-hidden not-dark:bg-white dark:bg-[#1e1e1e] shadow-sm"
          @click="verLista(lista.id)"
        >
          <div>
            <p class="font-bold">{{ lista.name }}</p>
            <p class="text-sm text-gray-400">{{ lista.items.length }} productos</p>
          </div>
          <icon-custom icon="angle-right" size="xl" />
          <ion-ripple-effect />
        </div>

        <btn-primary shape="round" size="large" class="w-full mt-2" @click="modalNueva = true">
          <div class="flex items-center gap-2">
            <icon-custom icon="plus" />
            Nueva lista
          </div>
        </btn-primary>
      </div>

      <!-- Modal nueva lista -->
      <ion-modal :is-open="modalNueva" @didDismiss="modalNueva = false" class="mini-dialog">
        <div class="p-5 flex flex-col gap-4">
          <p class="font-bold text-lg text-center">Nueva lista</p>
          <input
            v-model="nombreLista"
            type="text"
            placeholder="Nombre de la lista"
            class="w-full rounded-xl p-3 not-dark:bg-gray-100 dark:bg-[#2a2a2a] focus:outline-none"
            @keyup.enter="crearLista"
          />
          <btn-primary shape="round" class="w-full" @click="crearLista">Crear</btn-primary>
          <btn-secondary shape="round" class="w-full" @click="modalNueva = false">Cancelar</btn-secondary>
        </div>
      </ion-modal>

      <!-- Modal registro -->
      <ion-modal :is-open="modalRegistro" @didDismiss="modalRegistro = false" class="mini-dialog">
        <div class="p-5 flex flex-col gap-4 items-center">
          <p class="font-bold text-xl text-center">Guarda tus listas en la nube</p>
          <p class="text-sm text-gray-500 text-center">Con una cuenta puedes sincronizar tus listas, compartirlas con tu familia y acceder desde cualquier dispositivo.</p>
          <btn-primary shape="round" size="large" class="w-full" @click="irRegister">Crear cuenta gratis</btn-primary>
          <btn-secondary shape="round" class="w-full" @click="irLogin">Ya tengo cuenta</btn-secondary>
          <p class="text-sm text-gray-400 underline" @click="modalRegistro = false">Seguir sin cuenta</p>
        </div>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<style scoped>
.mini-dialog {
  --width: 90%;
  --max-width: 380px;
  --height: auto;
  --border-radius: 20px;
}
</style>
