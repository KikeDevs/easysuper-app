<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonModal,
  IonPage,
  IonRippleEffect,
  IonToast,
} from "@ionic/vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import ItemProductoLista from "@/views/Pages/Listas/ItemProductoLista.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import {computed, ref, watch} from "vue";
import {Departamento, miList} from "@/interfaces/types";
import {Product} from "@/interfaces/products";
import {addProductHome, getBrands, getDepartaments, getProducts} from "@/api/Productos";
import {addList, misList} from "@/api/Lists";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import {Brand} from "@/interfaces/brands";
import ItemMiLista from "@/views/Pages/Listas/ItemMiLista.vue";
import {colorFromTextStable} from "@/utils/colorFromText";
import ModalAgregarLista from "@/views/Pages/Listas/ModalAgregarLista.vue";
import {useProfileStore} from "@/stores/profile";
import {useUiStore} from "@/stores/statusbar";

const ui = useUiStore();

const addButtonStyle = computed(() => ({
  bottom: (16 + ui.footerPaddingBottom) + "px", // 16px (bottom-4) + safe-area
}));
const contentStyle = computed(() => ({
  // usamos la var interna de IonContent
  "--padding-bottom": (ui.footerPaddingBottom + 16) + "px", // 16 extra para respiro
}));

const perfilId = useProfileStore().selected?.profile_id ?? 0;

const isOpen = defineModel<boolean>('is-open',{default:false});
const emit = defineEmits<{
  (e:'close'): void;
}>();

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const showAgregar = ref<boolean>(false);
const modalAgregarLista = ref<boolean>(false);

const searchE1 = ref<HTMLInputElement | null>(null);
function focusSearch(): void {
  requestAnimationFrame(() => {
    setTimeout(() => searchE1.value?.focus(),0)
  })
}

const misListas = ref<miList[]>([]);
async function cargarMisListas(): Promise<void> {
  const resp = await misList();
  if (resp.status !== "ok") {
    showToast(resp.message ?? "No se pudieron cargar tus listas.");
    misListas.value = [];
    return;
  }
  misListas.value = resp.misLists ?? [];
}

const brands = ref<Brand[]>([]);
async function obBrands(): Promise<void> {
  const resp = await getBrands();
  if (resp.status == 'ok'){
    brands.value = resp.brands ?? [];
  }
}
const brandsNormales = computed(() =>
    brands.value.filter(b => b.patrocinio === 0)
);

const brandsPatrocinios = computed(() =>
    brands.value.filter(b => b.patrocinio === 1)
);

const departaments = ref<Departamento[]>([]);
async function obDepartamentos(): Promise<void> {
  const resp = await getDepartaments();
  departaments.value = resp.departaments ?? [];
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
  const resp = await getProducts(departamentId ?? 0);
  if (resp.status == 'ok') {
    getArticulos.value = resp.products ? resp.products : [];
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

const modalSeleccionados = ref(false);
const productsSeleccionados = ref<Product[]>([]);
function addProductSelect(p: Product): void {
  if (productsSeleccionados.value.length >= 24) return showToast("Limite de productos alcanzado");
  for (const product of productsSeleccionados.value) {
    if (product.product_id == p.product_id) {
      showToast("Producto ya agregado, elija otro.")
      return;
    }
  }

  productsSeleccionados.value.push(p);
  showToast("Producto agregado a la lista.")
}
function deleteProductSelect(p: Product): void {
  const id = p.product_id;

  const idx = productsSeleccionados.value.findIndex(x => x.product_id == id);
  if (idx == -1) {
    showToast("Ese producto no existe.")
    return;
  }

  productsSeleccionados.value.splice(idx, 1);
  showToast("Producto eliminado de la lista.");
}

function openAgregar(p:Product): void {
  productsSeleccionados.value = []
  showAgregar.value = true;

  productsSeleccionados.value.push(p);
}
function openAgregarSeleccionados(): void {
  showAgregar.value = true;
  modalSeleccionados.value = false;
}

const nameList = ref<string>('');
async function agregarLista(): Promise<void> {
  const resp = await addList(nameList.value);

  if (resp.status !== "ok") {
    showToast(resp.message ?? "No se pudo agregar la lista. Inténtalo de nuevo.");
    nameList.value = "";
    modalAgregarLista.value = false;
    return;
  }

  showToast(resp.message ?? "Lista agregada.");
  await cargarMisListas();

  nameList.value = '';
  modalAgregarLista.value = false;
}

async function agregarProductosHome(l: miList): Promise<void> {
  const resp = await addProductHome(l.userlist_id,perfilId,productsSeleccionados.value);
  showToast(resp.message);
  if (resp.status == "ok") {
    showAgregar.value = false;
    if (modalSeleccionados) modalSeleccionados.value = false;
    productsSeleccionados.value = [];
  }
}


watch(isOpen, async (open) => {
  if (open) {
    searchBar.value = '';
    getArticulos.value = [];
    departamentSelect.value = null;
    productsSeleccionados.value = [];
    await Promise.all([obDepartamentos(), cargarMisListas(),obBrands()]);
  }
});
</script>

<template>
  <ion-modal
      v-model:is-open="isOpen"
      @didDismiss="emit('close')"
      @didPresent="focusSearch"
  >
    <ion-page id="main-content">
      <ion-header class="ion-no-border">
        <toolbar-custom class="px-2" :style="{paddingTop: ui.toolbarPaddingTop + 'px'}">
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
            <ion-button fill="clear" shape="circle" class=" text-neutral-800 dark:text-white" @click="openModalDepartament">
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
            <div v-for="d in departaments" :key="d.departament_id" class="rounded-full px-2 py-1 text-base w-fit whitespace-nowrap"
                 :class="[departamentSelect?.departament_id == d.departament_id ? 'bg-blue-500 dark:bg-gray-800 text-white' : 'not-dark:bg-gray-300 dark:bg-[#2a2a2a]' ]"
                 @click="selectDepartament(d)">
              <p class="w-fit">{{d.name_departament}}</p>
            </div>
          </div>
        </toolbar-custom>
      </ion-header>

      <ion-content :fullscreen="true" class="ion-padding" :class="contentStyle">

        <item-producto-lista v-if="getArticulos.length > 0" v-for="p in getArticulos" :item="p">
          <div class="w-fit h-fit flex text-white p-2 rounded-full not-dark:bg-blue-500 dark:bg-[#2a2a2a]"
               @click="openAgregar(p)"
          >
            <icon-custom icon="plus"/>
          </div>
          <div class="relative ion-activatable overflow-hidden w-fit h-fit flex text-white p-2 mr-2 rounded-full not-dark:bg-blue-500 dark:bg-[#2a2a2a]"
               @click="addProductSelect(p)"
          >
            <icon-custom icon="notebook"/>
            <ion-ripple-effect/>
          </div>
        </item-producto-lista>

        <div v-if="getArticulos.length == 0 && brands.length > 0" class="flex flex-col gap-2">
          <p class="text-blue-400 dark:text-white">Nuestra recomendación:</p>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="bp in brandsPatrocinios">
              {{bp.name_brand}}
            </div>
          </div>
          <div class="flex items-center w-full gap-1">
            <div class="flex-1 w-full rounded-full bg-blue-400 dark:bg-gray-300 h-[2px]"/>
            <p>otras marcas</p>
            <div class="flex-1 w-full rounded-full bg-blue-400 h-[2px] dark:bg-gray-300"/>
          </div>
          <div
              v-for="bn in brandsNormales"
              class="flex items-center gap-3 h-fit"
          >
            <div class="w-6 h-6 border-2 border-blue-400 dark:border-gray-700 rounded-full bg-transparent"/>
            <div class="flex-1 w-full h-full border-b-2 border-b-blue-400 dark:border-b-gray-700 py-2">
              <p>{{bn.name_brand}}</p>
            </div>
          </div>
        </div>

        <div class="h-20"/>

        <!-- Modal Agregar a Lista -->
        <ion-modal
            v-model:is-open="showAgregar"
            @didDismiss="() => { showAgregar = false; productsSeleccionados = []}"
        >
          <ion-header class="ion-no-border">
            <toolbar-custom class="px-2" :style="{paddingTop: ui.toolbarPaddingTop + 'px'}">
              <ion-title>Guardar en:</ion-title>
              <template #start>
                <div class="flex p-1.5 rounded-full ion-activatable overflow-hidden relative" @click="() => {showAgregar = false}">
                  <icon-custom icon="arrow-small-left" size="3xl"/>
                  <ion-ripple-effect/>
                </div>
              </template>
            </toolbar-custom>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="flex flex-col gap-3">
              <item-mi-lista
                  v-for="l in misListas"
                  :item="l"
                  @click="agregarProductosHome(l)"
              />
            </div>
          </ion-content>
          <ion-footer class="ion-no-border">
            <div class="w-full px-2 pt-2 flex justify-end" :style="{paddingBottom: ui.footerPaddingBottom + 'px'}">
              <btn-primary shape="round" size="large" class="mt-2 mb-2" @click="modalAgregarLista = true">
                <div class="flex gap-2 items-center">
                  <icon-custom icon="plus"/>
                  <p>Agregar Lista</p>
                </div>
              </btn-primary>
            </div>
          </ion-footer>
        </ion-modal>

        <!-- Modal Productos Seleccionados -->
        <ion-modal
            v-model:is-open="modalSeleccionados"
            @didDismiss="modalSeleccionados = false"
        >
          <ion-header class="ion-no-border">
            <toolbar-custom class="px-2" :style="{paddingTop: ui.toolbarPaddingTop + 'px'}">
              <ion-title>Seleccionados</ion-title>
              <template #start>
                <div class="flex p-1.5 rounded-full ion-activatable overflow-hidden relative" @click="() => {modalSeleccionados = false}">
                  <icon-custom icon="arrow-small-left" size="3xl"/>
                  <ion-ripple-effect/>
                </div>
              </template>
            </toolbar-custom>
          </ion-header>
          <ion-content class="ion-padding">
            <item-producto-lista v-for="p in productsSeleccionados" :item="p">
              <div class="relative ion-activatable overflow-hidden w-fit h-fit flex text-white p-2 mr-2 rounded-full not-dark:bg-blue-500 dark:bg-[#2a2a2a]"
                   @click="deleteProductSelect(p)"
              >
                <icon-custom icon="trash"/>
                <ion-ripple-effect/>
              </div>
            </item-producto-lista>
          </ion-content>
          <ion-footer class="ion-no-border">
            <div class="w-full px-2" :style="{paddingBottom: ui.footerPaddingBottom + 'px'}">
              <btn-primary shape="round" size="large" class="mt-2 mb-2" @click="openAgregarSeleccionados">Agregar a una lista</btn-primary>
            </div>
          </ion-footer>
        </ion-modal>

        <!-- Toast -->
        <ion-toast
            :is-open="toast.show"
            :duration="3000"
            :message="toast.message"
            @didDismiss="toast.show = false"
        />

        <modal-agregar-lista
            v-model:is-open="modalAgregarLista"
            v-model:text-input="nameList"
            @agregar="agregarLista"
        />

      </ion-content>

      <div class="fixed z-10 right-5 transition-opacity ease-in-out duration-500"
           :style="addButtonStyle"
           :class="[productsSeleccionados.length > 1 ? 'opacity-100' : 'opacity-0']"
      >
        <div class="relative p-3 w-fit flex rounded-full overflow-hidden ion-activatable bg-blue-400 shadow-lg dark:bg-[#2a2a2a] dark:shadow-none" @click="modalSeleccionados = true">
          <icon-custom icon="notebook" size="3xl" class="text-white"/>
          <ion-ripple-effect/>
        </div>
      </div>

    </ion-page>
  </ion-modal>
</template>

<style scoped>
</style>