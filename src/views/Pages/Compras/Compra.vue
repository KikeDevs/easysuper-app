<script setup lang="ts">
import {
  IonBackButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonTitle,
  IonToast,
  IonModal,
  onIonViewDidEnter,
  onIonViewWillLeave
} from "@ionic/vue";
import {computed, nextTick, ref, watch} from "vue";
import router from "@/router/router";

import {ProductList} from "@/interfaces/products";
import {Departamento} from "@/interfaces/types";

import {getListDetails} from "@/api/Lists";
import {getDepartaments} from "@/api/Productos";
import {productComprado, terminadaCompra, terminarCompra} from "@/api/Compras";

import {colorFromTextStable} from "@/utils/colorFromText";
import {useProfileStore} from "@/stores/profile";

import ItemProductoLista from "@/views/Pages/Listas/ItemProductoLista.vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";
import {useUiStore} from "@/stores/statusbar";

const props = defineProps<{
  userlistId: number;
  nameList: string;
}>();

const ui = useUiStore();

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const initialLoading = ref(true);
const compraTerminada = ref<boolean>(false);
const showFinalizadaModal = ref(false);
const terminarCompraModal = ref(false);

const POLL_MS = 8000;
const listDetails = ref<ProductList[]>([]);
const intervalId = ref<number | null>(null);
const inFlight = ref(false);

/** Fuerza re-render de items cuando los datos cambian (evita “pegado” del hijo) */
const versionKey = ref(0);

// --- Tu función actual, con guardas para no solapar ---
async function getMiListDetails(): Promise<void> {
  if (inFlight.value) return;
  inFlight.value = true;
  try {
    const ter = await terminadaCompra(props.userlistId);

    const terminada = ter.terminada;

    if (terminada == 'si'){
      stopPolling();
      await nextTick();
      showFinalizadaModal.value = true;
      return;
    }

    const resp = await getListDetails(props.userlistId);
    listDetails.value = resp.listDetalles ?? [];
    versionKey.value++;
  } finally {
    inFlight.value = false;
  }
}


function startPolling() {
  stopPolling(); // por si acaso
  intervalId.value = window.setInterval(() => {
    getMiListDetails();
  }, POLL_MS);
}

function stopPolling() {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
}

function irAHome() {
  showFinalizadaModal.value = false;
  // Reemplaza la vista actual para que no puedan regresar
  router.replace('/home');
}

// Lifecycles correctos para páginas Ionic
onIonViewDidEnter(async () => {
  await ui.refresh();
  initialLoading.value = true;
  try {
    await Promise.all([getMiListDetails(), obDepartamentos()]);
    startPolling();
  } finally {
    initialLoading.value = false;
  }
});

onIonViewWillLeave(() => {
  stopPolling();
});


async function finalizarCompra(){
  const resp = await terminarCompra(props.userlistId,useProfileStore().selected?.profile_id ?? 0);
  if (resp.status === 'ok') {
    stopPolling();
    await nextTick();
    terminarCompraModal.value = true;
  }

  showToast(resp.message)

}

// Si cambia la lista, reinicia el polling y refresca
watch(() => props.userlistId, async () => {
  await getMiListDetails();
  startPolling();
});
watch(compraTerminada, async (yaTerminada) => {
  if (yaTerminada) {
    stopPolling();
    await nextTick();
    showFinalizadaModal.value = true; // abre modal
  }
});

/** --- NO TOCADO: mantengo tu actualización de producto tal cual --- */
async function productoSeleccionado(p: ProductList): Promise<void> {
  if (compraTerminada.value) return; // bloquea interacción si ya terminó
  p.status_pro = p.status_pro === 1 ? 0 : 1;
  await productComprado(
      props.userlistId,
      useProfileStore().selected?.profile_id ?? 0,
      p.product_id,
      p.status_pro
  );
}

const selectedCount = computed(() =>
    listDetails.value.reduce((acc, p) => acc + (p.status_pro === 1 ? 1 : 0), 0)
);

const departaments = ref<Departamento[]>([]);
async function obDepartamentos(): Promise<void> {
  const resp = await getDepartaments();
  departaments.value = resp.departaments ?? [];
}

const deptNameById = computed<Map<number, string>>(() => {
  const m = new Map<number, string>();
  for (const d of departaments.value) m.set(d.departament_id, d.name_departament);
  return m;
});

/** ---- Agrupar productos por departamento (dinámico) ---- */
type Group = { id: number; name: string; items: ProductList[] };

const grupos = computed<Group[]>(() => {
  const byDept = new Map<number, ProductList[]>();

  for (const p of listDetails.value) {
    // Solo productos NO seleccionados
    if (p.status_pro === 1) continue;

    const id = (p as any).departament_id ?? 0; // 0 = “Otros”
    if (!byDept.has(id)) byDept.set(id, []);
    byDept.get(id)!.push(p);
  }

  const sortedIds = Array.from(byDept.keys()).sort((a, b) => a - b);
  return sortedIds.map(id => ({
    id,
    name: deptNameById.value.get(id) ?? "Otros",
    items: byDept.get(id)!,
  }));
});

const carrito = computed<ProductList[]>(() =>
    listDetails.value.filter(p => p.status_pro === 1)
);

</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <toolbar-custom class="px-2" :style="{paddingTop: ui.toolbarPaddingTop + 'px'}">
        <ion-title> Compra Lista {{ nameList }}</ion-title>
        <template #start>
          <ion-back-button/>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
      <TransitionGroup
          name="list-fade"
          tag="div"
          class="flex flex-col"
          appear
      >
        <div v-for="g in grupos" :key="g.id" class="mb-3">
          <div class="mt-3 pl-1 rounded-t-lg bg-blue-500 text-white dark:bg-[#2a2a2a]">
            <p class="text-lg font-semibold">{{ g.name }}</p>
          </div>

          <!-- Items del grupo -->
          <item-producto-lista
              v-for="p in g.items"
              :key="versionKey + '-' + p.product_id"
              :itemDetails="p"
              class="transition-opacity ease-in-out duration-300"
              :class="[p.status_pro === 1 ? 'opacity-40' : 'opacity-100']"
              @click="productoSeleccionado(p)"
          >

            <div class="w-6 h-6 p-1 flex items-center justify-center text-white rounded-full"
                 :style="{background: colorFromTextStable(p.name_perfil)}">
              <icon-custom icon="user" size="md"/>
            </div>

            <div
                class="w-6 h-6 mr-2 rounded-full"
                :class="[p.status_pro === 0 ? 'bg-gray-500' : 'bg-green-600']"
            />
          </item-producto-lista>
        </div>
      </TransitionGroup>

      <!--crear lista "Carrito" con los productos ya check (status_pro = 1)-->
      <div v-if="carrito.length" class="mt-6">
        <div class="mt-3 pl-1 rounded-t-lg bg-green-600 text-white dark:bg-[#2a2a2a]">
          <p class="text-lg font-semibold">
            Carrito ({{ carrito.length }})
          </p>
        </div>

        <item-producto-lista
            v-for="p in carrito"
            :key="'cart-' + versionKey + '-' + p.product_id"
            :itemDetails="p"
            class="transition-opacity ease-in-out duration-300"
            :class="[p.status_pro === 1 ? 'opacity-100' : 'opacity-40']"
            @click="productoSeleccionado(p)"
        >
          <div class="w-6 h-6 p-1 flex items-center justify-center text-white rounded-full"
               :style="{background: colorFromTextStable(p.name_perfil)}">
            <icon-custom icon="user" size="md"/>
          </div>

          <div
              class="w-6 h-6 mr-2 rounded-full"
              :class="[p.status_pro === 0 ? 'bg-gray-500' : 'bg-green-600']"
          />
        </item-producto-lista>
      </div>


      <ion-modal
          v-model:is-open="showFinalizadaModal"
          :backdrop-dismiss="false"
      >
        <div class="p-5 flex flex-col gap-4 w-full h-full">
          <div class="flex items-center gap-3">
            <icon-custom icon="check-circle" size="xl" />
            <p class="text-xl font-semibold">Compra finalizada</p>
          </div>

          <p class="opacity-80">
            Esta lista ya fue finalizada por otro usuario. Serás redirigido al inicio para evitar cambios adicionales.
          </p>

          <div class="flex-1 w-full h-full flex items-end justify-end">
            <btn-primary shape="round" size="large" @click="irAHome">
              <span class="text-white">Ir al inicio</span>
            </btn-primary>
          </div>
        </div>
      </ion-modal>

      <ion-modal
          :is-open="terminarCompraModal"
          :backdrop-dismiss="false"
      >
        <div class="p-5 w-full h-full flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <icon-custom icon="check-circle" size="xl" />
            <p class="text-xl font-semibold">Compra finalizada</p>
          </div>

          <p class="opacity-80">
            Se completo la lista de compra <b>{{nameList}}</b>.
          </p>

          <div class="flex-1 w-full h-full flex items-end justify-end">
            <btn-primary shape="round" size="large" @click="irAHome">
              <span class="text-white">Ir al inicio</span>
            </btn-primary>
          </div>
        </div>
      </ion-modal>

      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          :message="toast.message"
          @didDismiss="toast.show = false"
      />

      <loader-normal :open="initialLoading"/>

    </ion-content>

    <ion-footer class="ion-no-border" :style="{paddingBottom: ui.footerPaddingBottom + 'px'}">
      <div class="px-3 py-1">
        <btn-primary shape="round"
                     size="large"
                     :disabled="!(listDetails.length == selectedCount)"
                     @click="finalizarCompra"
                     class="w-full">
          <span class="text-white">Finalizar compra</span>
        </btn-primary>
      </div>
    </ion-footer>
  </ion-page>
</template>
<style scoped>
ion-modal{
  --width: 90%;
  --height: 28%;
  --border-radius: 10px;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}
</style>
