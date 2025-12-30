<script setup lang="ts">
import {
  IonContent, IonHeader, IonModal, IonPage,
  IonRefresher, IonRefresherContent, IonRippleEffect, IonToast
} from "@ionic/vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import {computed, ref, watch} from "vue";

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
  addedIds?: number[],
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

async function resetBusqueda(): Promise<void> {
  // corta cualquier búsqueda en cola
  if (debounceId) {
    window.clearTimeout(debounceId);
    debounceId = null;
  }

  // limpia filtros
  searchBar.value = "";
  selectedBrand.value = null;

  // recarga listado normal (del depto actual)
  await allArticulos(departamentSelect.value?.departament_id ?? 0);

  // opcional: regresar el foco al buscador
  focusSearch();
}

const departamentSelect = ref<Departamento | null>(null);
const showDepartament = ref(false);

function openModalDepartament(): void {
  showDepartament.value = !showDepartament.value;
}
async function selectDepartament(d: Departamento | null): Promise<void> {
  departamentSelect.value = d;
  showDepartament.value = false;

  // opcional: resetear marca al cambiar depto (suele sentirse mejor)
  selectedBrand.value = null;

  const depId = d?.departament_id ?? 0;
  if (searchBar.value.trim() !== "" && searchBar.value.trim().length >= 2) {
    await searchArticulos(depId);
  } else {
    await allArticulos(depId);
  }
}

/** ====== Estado "ya agregado" (para mostrar círculo verde) ====== */
const addedSet = ref<Set<number>>(new Set());
function syncAddedSet(): void {
  addedSet.value = new Set(props.addedIds ?? []);
}
function isAdded(productId: number): boolean {
  return addedSet.value.has(productId);
}
watch(() => props.addedIds, () => syncAddedSet(), { deep: true });

/** ====== Brands (derivadas de los productos cargados) ====== */
type BrandLite = { brand_id: number; name_brand: string; patrocinio: number };

const selectedBrand = ref<BrandLite | null>(null);
const brandLabel = computed(() =>
    selectedBrand.value ? selectedBrand.value.name_brand : "Todas las marcas"
);

function normalizeText(s: string): string {
  return (s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
}

const searchBar = ref('');
const qNorm = computed(() => normalizeText(searchBar.value));
const isSearching = computed(() => qNorm.value.length >= 2);

/** Productos */
const getArticulos = ref<Product[]>([]);

function orderProductsFirstBrand(items: Product[]): Product[] {
  return (items ?? []).slice().sort((a, b) => {
    const aHas = a.brand_id != null ? 0 : 1;
    const bHas = b.brand_id != null ? 0 : 1;
    if (aHas !== bHas) return aHas - bHas;
    return (a.name_product ?? '').localeCompare(b.name_product ?? '', 'es', { sensitivity: 'base' });
  });
}

const brandsFromProducts = computed<BrandLite[]>(() => {
  const m = new Map<number, BrandLite>();
  for (const p of getArticulos.value) {
    if (p.brand_id == null) continue;
    const name = p.brand ?? "";
    if (!name) continue;

    const id = p.brand_id;
    if (!m.has(id)) {
      m.set(id, {
        brand_id: id,
        name_brand: name,
        patrocinio: (p.patrocinio ?? 0),
      });
    } else {
      // si en algún producto viene patrocinio=1, lo respetamos
      const prev = m.get(id)!;
      if ((p.patrocinio ?? 0) > (prev.patrocinio ?? 0)) prev.patrocinio = (p.patrocinio ?? 0);
    }
  }

  return Array.from(m.values()).sort((a, b) => {
    const p = (b.patrocinio ?? 0) - (a.patrocinio ?? 0);
    if (p !== 0) return p;
    return (a.name_brand ?? '').localeCompare(b.name_brand ?? '', 'es', { sensitivity: 'base' });
  });
});

const brandsPatrocinios = computed(() => brandsFromProducts.value.filter(b => b.patrocinio === 1));
const brandsNormales = computed(() => brandsFromProducts.value.filter(b => b.patrocinio === 0));

/** En búsqueda, la lista ya está "reversa" porque viene de productos encontrados */
const brandsForSearch = computed(() => {
  if (!isSearching.value) return brandsFromProducts.value;
  return brandsFromProducts.value;
});
const brandsForSearchPatrocinios = computed(() => brandsForSearch.value.filter(b => b.patrocinio === 1));
const brandsForSearchNormales = computed(() => brandsForSearch.value.filter(b => b.patrocinio === 0));

async function clearBrandFilter(): Promise<void> {
  selectedBrand.value = null;

  const depId = departamentSelect.value?.departament_id ?? 0;
  const q = searchBar.value.trim();

  if (q === "" || q.length < 2) {
    await allArticulos(depId);
  } else {
    await searchArticulos(depId);
  }
}

async function filtrarPorBrand(b: BrandLite): Promise<void> {
  selectedBrand.value = b;

  const depId = departamentSelect.value?.departament_id ?? 0;
  const q = searchBar.value.trim();

  if (q === "" || q.length < 2) {
    await allArticulos(depId);
  } else {
    await searchArticulos(depId);
  }
}

async function allArticulos(departamentId?: number): Promise<void> {
  getArticulos.value = [];
  initialLoading.value = true;

  const brandId = selectedBrand.value?.brand_id ?? null;

  try {
    const resp = await getProducts(departamentId ?? 0, "", brandId);
    if (resp.status == 'ok') {
      getArticulos.value = orderProductsFirstBrand((resp.products ?? []) as Product[]);
    }
  } finally {
    initialLoading.value = false;
  }
}

async function searchArticulos(departamentId?: number): Promise<void> {
  getArticulos.value = [];
  const brandId = selectedBrand.value?.brand_id ?? null;

  const resp = await getProducts(departamentId ?? 0, searchBar.value, brandId);
  if (resp.status == 'ok') {
    getArticulos.value = orderProductsFirstBrand((resp.products ?? []) as Product[]);
  }
}

let debounceId: number | null = null;
function debouncedSearch(): void {
  if (debounceId) window.clearTimeout(debounceId);
  debounceId = window.setTimeout(async () => {
    const depId = departamentSelect.value?.departament_id ?? 0;
    const q = searchBar.value.trim();

    if (q === "") return allArticulos(depId);
    if (q.length < 2) return; // espera 2+ letras (no consumas backend con 1 letra)
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
  // si ya está agregado, no hagas nada
  if (isAdded(p.product_id)) return;

  const perfilId = useProfileStore().selected?.profile_id ?? 0;
  const resp = await addProduct(props.userlist_id, p.product_id, perfilId);

  // marcamos como agregado si NO fue error (ok o warning)
  if (resp.status !== "error") {
    const s = new Set(addedSet.value);
    s.add(p.product_id);
    addedSet.value = s;
    await resetBusqueda();
  }

  openMiniDialog(resp.message, resp.status === "ok" ? "Agregado" : "Listo");
}


async function doRefresh(ev: CustomEvent): Promise<void> {
  try {
    await allArticulos(departamentSelect.value?.departament_id ?? 0);
  } finally {
    await (ev.target as HTMLIonRefresherElement).complete();
  }
}


watch(isOpen, async (open) => {
  if (open) {
    syncAddedSet();
    searchBar.value = '';
    selectedBrand.value = null;
    departamentSelect.value = null;
    await Promise.all([allArticulos(0)]);
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

        <!-- Brands (al inicio, NO sticky) -->
        <div v-if="brandsFromProducts.length > 0" class="mb-4 -mx-4 px-4 pt-3 pb-2">
          <div class="flex items-center justify-between mb-2">
            <p class="text-blue-400 dark:text-white">
              {{ isSearching ? 'Marcas relacionadas' : 'Marcas' }}
            </p>

            <div class="flex items-center gap-2">
              <span
                  v-if="selectedBrand"
                  class="text-[11px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-white/10 dark:text-white"
              >
                {{ brandLabel }}
              </span>

              <button
                  v-if="selectedBrand"
                  class="text-xs underline text-blue-500 dark:text-blue-300"
                  @click="clearBrandFilter"
              >
                Quitar filtro
              </button>
            </div>
          </div>

          <!-- Buscando -->
          <template v-if="isSearching">
            <div v-if="brandsForSearchPatrocinios.length > 0" class="grid grid-cols-3 gap-2 mb-2">
              <div v-for="bp in brandsForSearchPatrocinios" :key="bp.brand_id" @click="filtrarPorBrand(bp)">
                <div class="w-full rounded-xl overflow-hidden shadow-md ring-2 ring-transparent"
                     :class="[selectedBrand?.brand_id === bp.brand_id ? 'ring-blue-400' : '']">
                  <img
                      :src="'http://srv1170449.hstgr.cloud/images/brands/' + bp.name_brand + '.png'"
                      :alt="bp.name_brand"
                      loading="lazy"
                  >
                </div>
              </div>
            </div>

            <div v-if="brandsForSearchNormales.length > 0" class="flex flex-col">
              <div
                  v-for="bn in brandsForSearchNormales"
                  :key="bn.brand_id"
                  class="flex items-center gap-3 h-fit"
                  @click="filtrarPorBrand(bn)"
              >
                <div class="w-6 h-6 border-2 rounded-full bg-transparent"
                     :class="[selectedBrand?.brand_id === bn.brand_id ? 'border-blue-500' : 'border-blue-400 dark:border-gray-700']"/>
                <div class="flex-1 w-full h-full border-b-2 py-2"
                     :class="[selectedBrand?.brand_id === bn.brand_id ? 'border-b-blue-500' : 'border-b-blue-400 dark:border-b-gray-700']">
                  <p>{{ bn.name_brand }}</p>
                </div>
              </div>
            </div>
          </template>

          <!-- Sin búsqueda -->
          <template v-else>
            <div v-if="brandsPatrocinios.length > 0" class="mb-2">
              <p class="text-blue-400 dark:text-white mb-2">Nuestra recomendación:</p>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="bp in brandsPatrocinios" :key="bp.brand_id" @click="filtrarPorBrand(bp)">
                  <div class="w-full rounded-xl overflow-hidden shadow-md ring-2 ring-transparent"
                       :class="[selectedBrand?.brand_id === bp.brand_id ? 'ring-blue-400' : '']">
                    <img
                        :src="'http://srv1170449.hstgr.cloud/images/brands/' + bp.name_brand + '.png'"
                        :alt="bp.name_brand"
                        loading="lazy"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div v-if="brandsNormales.length > 0" class="flex flex-col">
              <div class="flex items-center w-full gap-1 mb-1">
                <div class="flex-1 w-full rounded-full bg-blue-400 dark:bg-gray-300 h-[2px]"/>
                <p>otras marcas</p>
                <div class="flex-1 w-full rounded-full bg-blue-400 h-[2px] dark:bg-gray-300"/>
              </div>

              <div
                  v-for="bn in brandsNormales"
                  :key="bn.brand_id"
                  class="flex items-center gap-3 h-fit"
                  @click="filtrarPorBrand(bn)"
              >
                <div class="w-6 h-6 border-2 rounded-full bg-transparent"
                     :class="[selectedBrand?.brand_id === bn.brand_id ? 'border-blue-500' : 'border-blue-400 dark:border-gray-700']"/>
                <div class="flex-1 w-full h-full border-b-2 py-2"
                     :class="[selectedBrand?.brand_id === bn.brand_id ? 'border-b-blue-500' : 'border-b-blue-400 dark:border-b-gray-700']">
                  <p>{{ bn.name_brand }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <TransitionGroup
            name="list-fade"
            tag="div"
            class="flex flex-col"
            appear
        >
          <item-producto-lista v-for="p in getArticulos" :item="p" :key="p.product_id">
            <!-- Botón: si ya está agregado, muestra círculo verde -->
            <div
                v-if="isAdded(p.product_id)"
                class="w-fit h-fit flex items-center justify-center text-white p-2 mr-3 rounded-full bg-green-500"
                title="Agregado"
            >
              <icon-custom icon="check"/>
            </div>

            <div
                v-else
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
