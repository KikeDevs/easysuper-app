<script setup lang="ts">
import {
  IonPage, IonContent, IonHeader, IonModal, IonRippleEffect,
  IonBackButton, IonToast, onIonViewDidEnter, useIonRouter
} from "@ionic/vue";
import { ref, computed } from "vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import BtnSecondary from "@/views/Components/BtnSecondary.vue";
import { useGuestStore } from "@/stores/guest";
import { useUiStore } from "@/stores/statusbar";

const props = defineProps<{ listId: string }>();

const router = useIonRouter();
const ui = useUiStore();
const guestStore = useGuestStore();

const lista = computed(() => guestStore.getList(props.listId));
const toast = ref({ show: false, message: "" });
const showToast = (m: string) => { toast.value = { show: true, message: m }; };

const modalBuscar = ref(false);
const modalRegistro = ref(false);
const nuevoProducto = ref("");
let nextId = -1;

function agregarManual() {
  const nombre = nuevoProducto.value.trim();
  if (!nombre) return;
  guestStore.addProduct(props.listId, { product_id: nextId--, name_product: nombre });
  nuevoProducto.value = "";
  showToast(`${nombre} agregado`);
}

function quitarProducto(productId: number) {
  guestStore.removeProduct(props.listId, productId);
}

function toggleItem(productId: number) {
  guestStore.toggleProduct(props.listId, productId);
}

function irLogin() { router.push("/login"); }
function irRegister() { router.push("/register"); }

onIonViewDidEnter(async () => {
  await ui.refresh();
});
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <toolbar-custom class="px-2" :style="{ paddingTop: ui.toolbarPaddingTop + 'px' }">
        <template #start>
          <ion-back-button />
        </template>
        <template #center>
          <p class="font-bold text-lg">{{ lista?.name ?? 'Lista' }}</p>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Banner cuenta -->
      <div
        class="w-full rounded-2xl p-3 mb-4 flex items-center justify-between gap-2 not-dark:bg-blue-50 dark:bg-blue-950 border border-blue-300"
        @click="modalRegistro = true"
      >
        <p class="text-xs not-dark:text-blue-600 dark:text-blue-400">Crea una cuenta para guardar y compartir esta lista</p>
        <icon-custom icon="angle-right" size="xl" class="not-dark:text-blue-500 shrink-0" />
      </div>

      <!-- Items vacíos -->
      <div v-if="!lista?.items.length" class="flex flex-col items-center gap-3 py-8">
        <p class="text-gray-400">No hay productos en esta lista</p>
      </div>

      <!-- Items -->
      <div v-else class="flex flex-col gap-2 mb-4">
        <div
          v-for="item in lista?.items"
          :key="item.product_id"
          class="w-full rounded-2xl p-3 flex items-center gap-3 not-dark:bg-white dark:bg-[#1e1e1e] shadow-sm ion-activatable relative overflow-hidden"
          @click="toggleItem(item.product_id)"
        >
          <div
            class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
            :class="item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'"
          >
            <icon-custom v-if="item.checked" icon="check" size="sm" class="text-white" />
          </div>
          <p :class="item.checked ? 'line-through text-gray-400' : ''" class="flex-1 text-sm">
            {{ item.name_product }}
          </p>
          <div
            class="p-1 relative overflow-hidden rounded-full ion-activatable"
            @click.stop="quitarProducto(item.product_id)"
          >
            <icon-custom icon="cross-small" size="xl" class="text-red-400" />
            <ion-ripple-effect />
          </div>
          <ion-ripple-effect />
        </div>
      </div>

      <!-- Botón agregar -->
      <btn-primary shape="round" size="large" class="w-full" @click="modalBuscar = true">
        <div class="flex items-center gap-2">
          <icon-custom icon="plus" />
          Agregar producto
        </div>
      </btn-primary>

      <!-- Modal agregar producto -->
      <ion-modal :is-open="modalBuscar" @didDismiss="modalBuscar = false" class="mini-dialog">
        <div class="p-5 flex flex-col gap-4">
          <p class="font-bold text-lg text-center">Agregar producto</p>
          <input
            v-model="nuevoProducto"
            type="text"
            placeholder="Ej: Leche, Pan, Jabón..."
            class="w-full rounded-xl p-3 not-dark:bg-gray-100 dark:bg-[#2a2a2a] focus:outline-none"
            @keyup.enter="agregarManual"
          />
          <btn-primary shape="round" class="w-full" @click="agregarManual">Agregar</btn-primary>
          <div
            class="w-full rounded-xl p-3 not-dark:bg-blue-50 dark:bg-blue-950 border border-blue-200 flex items-start gap-2 cursor-pointer"
            @click="modalBuscar = false; modalRegistro = true"
          >
            <icon-custom icon="info-circle" class="not-dark:text-blue-500 shrink-0 mt-0.5" />
            <p class="text-xs not-dark:text-blue-600 dark:text-blue-300">
              Crea una cuenta para acceder al catálogo completo con fotos, marcas y categorías.
            </p>
          </div>
          <btn-secondary shape="round" class="w-full" @click="modalBuscar = false">Cancelar</btn-secondary>
        </div>
      </ion-modal>

      <!-- Modal registro -->
      <ion-modal :is-open="modalRegistro" @didDismiss="modalRegistro = false" class="mini-dialog">
        <div class="p-5 flex flex-col gap-4 items-center">
          <p class="font-bold text-xl text-center">Guarda tus listas en la nube</p>
          <p class="text-sm text-gray-500 text-center">Con una cuenta sincronizas tus listas, las compartes con tu familia y accedes al catálogo completo.</p>
          <btn-primary shape="round" size="large" class="w-full" @click="irRegister">Crear cuenta gratis</btn-primary>
          <btn-secondary shape="round" class="w-full" @click="irLogin">Ya tengo cuenta</btn-secondary>
          <p class="text-sm text-gray-400 underline" @click="modalRegistro = false">Seguir sin cuenta</p>
        </div>
      </ion-modal>

      <ion-toast
        :is-open="toast.show"
        :duration="2000"
        :message="toast.message"
        @didDismiss="toast.show = false"
      />
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
