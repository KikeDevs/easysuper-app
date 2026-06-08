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
import LoaderNormal from "@/views/Components/LoaderNormal.vue";
import { useGuestStore } from "@/stores/guest";
import { useUiStore } from "@/stores/statusbar";
import { getDepartaments, getProducts } from "@/api/Productos";
import { Product } from "@/interfaces/products";
import { Departamento } from "@/interfaces/types";

const props = defineProps<{ listId: string }>();

const router = useIonRouter();
const ui = useUiStore();
const guestStore = useGuestStore();

const lista = computed(() => guestStore.getList(props.listId));
const toast = ref({ show: false, message: "" });
const showToast = (m: string) => { toast.value = { show: true, message: m }; };

// Modal búsqueda
const modalBuscar = ref(false);
const modalRegistro = ref(false);
const loading = ref(false);

// Búsqueda
const searchBar = ref("");
const departamentos = ref<Departamento[]>([]);
const deptoSelect = ref<Departamento | null>(null);
const productos = ref<Product[]>([]);
let debounce: number | null = null;

const addedIds = computed(() => (lista.value?.items ?? []).map(i => i.product_id));

async function cargarDeptos() {
  const resp = await getDepartaments();
  if (resp.status === "ok") departamentos.value = resp.departaments ?? [];
}

async function buscarProductos() {
  if (debounce) clearTimeout(debounce);
  debounce = window.setTimeout(async () => {
    loading.value = true;
    try {
      const resp = await getProducts(
        deptoSelect.value?.departament_id ?? 0,
        searchBar.value.trim() || undefined
      );
      productos.value = resp.products ?? [];
    } finally {
      loading.value = false;
    }
  }, 350);
}

async function openBuscar() {
  modalBuscar.value = true;
  if (!departamentos.value.length) await cargarDeptos();
  await buscarProductos();
}

function agregarProducto(p: Product) {
  guestStore.addProduct(props.listId, { product_id: p.product_id, name_product: p.name_product });
  showToast(`${p.name_product} agregado`);
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
      <btn-primary shape="round" size="large" class="w-full" @click="openBuscar">
        <div class="flex items-center gap-2">
          <icon-custom icon="plus" />
          Agregar productos
        </div>
      </btn-primary>

      <!-- Modal búsqueda de productos -->
      <ion-modal :is-open="modalBuscar" @didDismiss="modalBuscar = false">
        <ion-header class="ion-no-border">
          <toolbar-custom class="px-2">
            <template #start>
              <div class="p-1 ion-activatable relative overflow-hidden rounded-full" @click="modalBuscar = false">
                <icon-custom icon="cross-small" size="xl" />
              </div>
            </template>
            <template #center>
              <p class="font-bold">Buscar productos</p>
            </template>
          </toolbar-custom>
        </ion-header>

        <ion-content class="ion-padding">
          <!-- Buscador -->
          <div class="w-full rounded-full flex items-center gap-2 px-4 py-2 not-dark:bg-gray-100 dark:bg-[#2a2a2a] mb-3">
            <icon-custom icon="search" />
            <input
              v-model="searchBar"
              type="text"
              placeholder="Buscar producto..."
              class="flex-1 bg-transparent focus:outline-none text-sm"
              @input="buscarProductos"
            />
          </div>

          <!-- Departamentos -->
          <div class="flex gap-2 overflow-x-auto pb-2 mb-3">
            <button
              class="shrink-0 px-3 py-1 rounded-full text-xs font-medium"
              :class="deptoSelect === null ? 'bg-blue-500 text-white' : 'not-dark:bg-gray-100 dark:bg-[#2a2a2a]'"
              @click="deptoSelect = null; buscarProductos()"
            >
              Todos
            </button>
            <button
              v-for="d in departamentos"
              :key="d.departament_id"
              class="shrink-0 px-3 py-1 rounded-full text-xs font-medium"
              :class="deptoSelect?.departament_id === d.departament_id ? 'bg-blue-500 text-white' : 'not-dark:bg-gray-100 dark:bg-[#2a2a2a]'"
              @click="deptoSelect = d; buscarProductos()"
            >
              {{ d.name_departament }}
            </button>
          </div>

          <!-- Sin resultados -->
          <div v-if="!loading && !productos.length" class="flex justify-center py-8">
            <p class="text-gray-400 text-sm">No se encontraron productos</p>
          </div>

          <!-- Productos -->
          <div class="flex flex-col gap-2">
            <div
              v-for="p in productos"
              :key="p.product_id"
              class="w-full rounded-2xl p-3 flex items-center justify-between ion-activatable relative overflow-hidden not-dark:bg-white dark:bg-[#1e1e1e] shadow-sm"
              @click="agregarProducto(p)"
            >
              <div>
                <p class="text-sm font-medium">{{ p.name_product }}</p>
                <p v-if="p.name_brand" class="text-xs text-gray-400">{{ p.name_brand }}</p>
              </div>
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                :class="addedIds.includes(p.product_id) ? 'bg-green-500' : 'bg-blue-500'"
              >
                <icon-custom
                  :icon="addedIds.includes(p.product_id) ? 'check' : 'plus'"
                  size="sm"
                  class="text-white"
                />
              </div>
              <ion-ripple-effect />
            </div>
          </div>

          <loader-normal :open="loading" />
        </ion-content>
      </ion-modal>

      <!-- Modal registro -->
      <ion-modal :is-open="modalRegistro" @didDismiss="modalRegistro = false" class="mini-dialog">
        <div class="p-5 flex flex-col gap-4 items-center">
          <p class="font-bold text-xl text-center">Guarda tus listas en la nube</p>
          <p class="text-sm text-gray-500 text-center">Con una cuenta sincronizas tus listas, las compartes con tu familia y accedes desde cualquier dispositivo.</p>
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
