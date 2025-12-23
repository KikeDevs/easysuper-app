<script setup lang="ts">
import {
  IonContent, IonHeader, IonModal, IonPage,
  IonRefresher, IonRefresherContent, IonRippleEffect, IonToast
} from "@ionic/vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import {ref, watch} from "vue";

import {Product} from "@/interfaces/products";
import {Departamento} from "@/interfaces/types";
import {addProduct, getProducts} from "@/api/Productos";
import ItemProductoLista from "@/views/Pages/Listas/ItemProductoLista.vue";
import {useProfileStore} from "@/stores/profile";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";

const props = defineProps<{
  userlist_id: number,
  departamentos: Departamento[],
  pTop: number,
}>();

const isOpen = defineModel<boolean>('is-open', { default: false });
const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const initialLoading = ref(false);

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const searchE1 = ref<HTMLInputElement | null>(null);
function focusSearch(): void {
  requestAnimationFrame(() => {
    setTimeout(() => searchE1.value?.focus(),0)
  })
}

const departamentSelect = ref<Departamento | null>(null);
const showDepartament = ref(false);

function openModalDepartament(): void {
  showDepartament.value = !showDepartament.value;
}
async function selectDepartament(d: Departamento | null): Promise<void> {
  departamentSelect.value = d;
  showDepartament.value = false;

  const depId = d?.departament_id ?? 0;
  if (searchBar.value.trim() !== "") {
    await searchArticulos(depId);
  } else {
    await allArticulos(depId);
  }
}

const getArticulos = ref<Product[]>([]);
async function allArticulos(departamentId?: number): Promise<void> {
  getArticulos.value = [];
  initialLoading.value = true;
  try {
    const resp = await getProducts(departamentId ?? 0);
    if (resp.status == 'ok') {
      getArticulos.value = resp.products ? resp.products : [];
    }
  } finally {
    initialLoading.value = false;
  }
}

const searchBar = ref('');
async function searchArticulos(departamentId?: number): Promise<void> {
  getArticulos.value = [];
  const resp = await getProducts(departamentId ?? 0,searchBar.value);
  if (resp.status == 'ok') {
    getArticulos.value = resp.products ? resp.products : [];
  }
}

let debounceId: number | null = null;
function debouncedSearch(): void {
  if (debounceId) window.clearTimeout(debounceId);
  debounceId = window.setTimeout(async () => {
    const depId = departamentSelect.value?.departament_id ?? 0;
    const q = searchBar.value.trim();
    if (q === "") return allArticulos(depId);
    if (q.length < 2) return; // espera 2+ letras
    await searchArticulos(depId);
  }, 250);
}
function onSearchInput(e: Event): void {
  const target = e.target as HTMLInputElement;
  searchBar.value = target.value;
  debouncedSearch();
}


const dialog = ref({
  open: false,
  title: "Listo",
  message: ""
});

let dialogTimer: number | null = null;
function openMiniDialog(message: string, title = "Listo"): void {
  dialog.value.title = title;
  dialog.value.message = message;
  dialog.value.open = true;

  if (dialogTimer) window.clearTimeout(dialogTimer);
  dialogTimer = window.setTimeout(() => {
    dialog.value.open = false;
  }, 3000);
}

async function agregarProducto(p: Product): Promise<void> {
  const perfilId = useProfileStore().selected?.profile_id ?? 0;
  const resp = await addProduct(props.userlist_id, p.product_id, perfilId);

  // si quieres seguir usando toast, déjalo:
  // showToast(resp.message)

  openMiniDialog(resp.message, resp.status === "ok" ? "Agregado" : "Ups");
}


async function doRefresh(ev: CustomEvent): Promise<void> {
  try {
    await allArticulos();
  } finally {
    await (ev.target as HTMLIonRefresherElement).complete();
  }
}


watch(isOpen, async (open) => {
  if (open) {
    departamentSelect.value = null;
    await Promise.all([allArticulos()]);
  }
});

</script>

<template>
  <ion-modal
      v-model:is-open="isOpen"
      @didDismiss="emit('refresh')"
      @didPresent="focusSearch"
  >
    <ion-page id="main-content">
      <ion-header class="ion-no-border">
        <toolbar-custom class="px-2" :style="{ paddingTop: pTop + 'px'}">
          <template #start>
            <div class="flex p-1.5 rounded-full ion-activatable overflow-hidden relative" @click="() => {isOpen = false}">
              <icon-custom icon="arrow-small-left" size="3xl"/>
              <ion-ripple-effect/>
            </div>
          </template>
          <div class="w-full px-1">
            <div class="border-1 border-gray-300 rounded-full flex gap-1 items-center pl-2 dark:bg-[#2a2a2a] dark:border-0">
              <icon-custom icon="search" size="md"/>
              <input
                  ref="searchE1"
                  v-model="searchBar"
                  type="search"
                  placeholder="Buscar Productos..."
                  class="py-1.5 px-1 w-full focus:outline-none focus:ring-0"
                  @input="onSearchInput"
                  @keydown.escape.prevent="searchBar = ''; allArticulos(departamentSelect?.departament_id ?? 0)"
              />
            </div>
          </div>
          <template #end>
            <ion-button fill="clear" shape="circle" class="text-neutral-800 dark:text-white" @click="openModalDepartament">
              <icon-custom icon="bars-sort" size="xl"/>
            </ion-button>
          </template>
        </toolbar-custom>
        <toolbar-custom>
          <div v-if="!showDepartament" class="px-3 flex justify-between items-center">
            <div class="bg-blue-500 rounded-lg text-white p-1">
              <p>
                {{departamentSelect == null ? 'Todos' : departamentSelect?.name_departament}}
              </p>
            </div>
            <p>
              Artículos: <span class="font-bold">{{getArticulos.length}}</span>
            </p>
          </div>
          <div v-else class="w-full pt-2 px-3 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden">
            <div class="rounded-full px-2 py-1 text-base w-fit"
                 :class="[departamentSelect == null ? ' bg-blue-500 dark:bg-gray-800 text-white' : 'not-dark:bg-gray-300 dark:bg-[#2a2a2a]' ]"
                 @click="selectDepartament(null)">
              <p class="w-fit">Todos</p>
            </div>
            <div v-for="d in departamentos" :key="d.departament_id" class="rounded-full px-2 py-1 text-base w-fit whitespace-nowrap"
                 :class="[departamentSelect?.departament_id == d.departament_id ? 'bg-blue-500 dark:bg-gray-800 text-white' : 'not-dark:bg-gray-300 dark:bg-[#2a2a2a]' ]"
                 @click="selectDepartament(d)">
              <p class="w-fit">{{d.name_departament}}</p>
            </div>
          </div>
        </toolbar-custom>
      </ion-header>

      <ion-content :fullscreen="true" class="ion-padding">
        <!-- Refresher -->
        <ion-refresher slot="fixed" @ionRefresh="doRefresh">
          <ion-refresher-content
              pulling-text="Desliza para recargar"
              refreshing-text="Actualizando..."
              refreshing-spinner="lines"
          />
        </ion-refresher>

        <TransitionGroup
            name="list-fade"
            tag="div"
            class="flex flex-col"
            appear
        >
          <item-producto-lista v-for="p in getArticulos" :item="p" :key="p.product_id">
            <div
                class="w-fit h-fit flex text-white p-2 mr-3 rounded-full not-dark:bg-blue-500 dark:bg-[#2a2a2a]"
                @click="agregarProducto(p)"
            >
              <icon-custom icon="plus"/>
            </div>
          </item-producto-lista>
        </TransitionGroup>

        <!-- Toast -->
        <ion-toast
            :is-open="toast.show"
            :duration="3000"
            position="middle"
            :translucent="true"
            :message="toast.message"
            @didDismiss="toast.show = false"
            class="custom-toast"
        />

      </ion-content>
    </ion-page>

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

    <loader-normal :open="initialLoading"/>

  </ion-modal>
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

</style>