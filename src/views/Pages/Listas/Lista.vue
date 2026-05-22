<script setup lang="ts">
import {
  IonPage, IonHeader, IonTitle, IonBackButton, IonContent, IonToast, IonRefresherContent, IonRefresher,
  onIonViewDidEnter, IonModal,
} from "@ionic/vue";
import { computed, ref } from "vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import ModalProductosLista from "@/views/Pages/Listas/ModalProductosLista.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import ItemProductoLista from "@/views/Pages/Listas/ItemProductoLista.vue";

import {ProductList} from "@/interfaces/products";
import {Departamento} from "@/interfaces/types";
import { getListDetails } from "@/api/Lists";
import {deleteProduct, getDepartaments} from "@/api/Productos";
import { colorFromTextStable } from "@/utils/colorFromText";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";
import {useUiStore} from "@/stores/statusbar";

const props = defineProps<{
  listId: number,
  nameList: string,
}>();

const initialLoading = ref(false);

const ui = useUiStore();

const contentStyle = computed(() => ({
  // usamos la var interna de IonContent
  "--padding-bottom": (ui.footerPaddingBottom + 16) + "px", // 16 extra para respiro
}));

const addButtonStyle = computed(() => ({
  bottom: (16 + ui.footerPaddingBottom) + "px", // 16px (bottom-4) + safe-area
}));


const showSearch = ref(false);
const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };


const departaments = ref<Departamento[]>([]);
async function obDepartamentos(): Promise<void> {
  const resp = await getDepartaments();
  departaments.value = resp.departaments ?? [];
}

const productosLista = ref<ProductList[]>([]);
async function getProductosLista(): Promise<void> {
  const resp = await getListDetails(props.listId);
  productosLista.value = resp.listDetalles ?? [];
}

const productosIds = computed<number[]>(() => productosLista.value.map(p => p.product_id));


async function refreshProductos(): Promise<void> {
  showSearch.value = false;
  await getProductosLista();
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

async function deleteProducto(p: ProductList): Promise<void> {
  const resp = await deleteProduct(props.listId, p.product_id);
  await getProductosLista();
  //showToast(resp.message);

  openMiniDialog(resp.message, resp.status === "ok" ? "Eliminado" : "Ups");

}
async function doRefresh(ev: CustomEvent): Promise<void> {
  try {
    await getProductosLista();
  } finally {
    await (ev.target as HTMLIonRefresherElement).complete();
  }
}

onIonViewDidEnter(async () => {
  await ui.refresh();
  initialLoading.value = true;
  try {
    await Promise.all([getProductosLista(), obDepartamentos()]);
  } finally {
    initialLoading.value = false;
  }
})

const deptNameById = computed<Map<number, string>>(() => {
  const m = new Map<number, string>();
  for (const d of departaments.value) m.set(d.departament_id, d.name_departament);
  return m;
});

/** ---- Agrupar productos por departamento (dinámico) ---- */
type Group = { id: number; name: string; items: ProductList[] };

const grupos = computed<Group[]>(() => {
  const byDept = new Map<number, ProductList[]>();

  for (const p of productosLista.value) {
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

</script>


<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <toolbar-custom class="px-2" :style="{ paddingTop: ui.toolbarPaddingTop + 'px' }">
        <ion-title>Lista {{ nameList }}</ion-title>
        <template #start>
          <ion-back-button/>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding" :style="contentStyle">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh">
        <ion-refresher-content
            pulling-text="Desliza para recargar"
            refreshing-text="Actualizando..."
            refreshing-spinner="lines"
        />
      </ion-refresher>

      <!-- Si no hay productos -->
      <div v-if="productosLista.length === 0" class="w-full h-full flex justify-center">
        <p class="not-dark:text-blue-400">Lista Vacía</p>
      </div>

      <TransitionGroup
          name="list-fade"
          tag="div"
          appear
          class="flex flex-col"
      >
        <div v-for="g in grupos" :key="g.id">
          <div class="mt-3 pl-1 rounded-t-lg bg-blue-500 text-white dark:bg-[#2a2a2a]">
            <p class="text-lg font-semibold">{{ g.name }}</p>
          </div>

          <item-producto-lista
              v-for="p in g.items"
              :key="p.product_id"
              :itemDetails="p"
          >
            <p class="text-[8px] font-bold absolute left-[18dvw] bottom-0.5">{{p.name_perfil}}</p>
            <div class="w-6 h-6 p-1 flex items-center justify-center text-white rounded-full"
                 :style="{background: colorFromTextStable(p.name_perfil)}">
              <icon-custom icon="user" size="md"/>
            </div>
            <!-- eliminar -->
            <div class="w-fit h-fit flex text-white p-2 mr-3 rounded-full not-dark:bg-blue-500 dark:bg-[#2a2a2a]"
                 @click="deleteProducto(p)">
              <icon-custom icon="trash"/>
            </div>
          </item-producto-lista>
        </div>
      </TransitionGroup>


      <div class="h-16"/>
      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          position="middle"
          @didDismiss="toast.show = false"
          :message="toast.message"
          class="custom-toast"
      />

      <loader-normal :open="initialLoading"/>

    </ion-content>

    <!-- Botón agregar -->
    <div class="fixed z-10 right-4 flex justify-center"
         :style="addButtonStyle"
    >
      <btn-primary
          shape="round"
          size="large"
          class="w-fit rounded-full shadow-lg"
          @click="showSearch = true"
      >
        <div class="flex items-center justify-center gap-2">
          <icon-custom icon="plus" />
          <span class="inline-block whitespace-nowrap overflow-hidden">Artículo</span>
        </div>
      </btn-primary>
    </div>

    <modal-productos-lista
        :userlist_id="listId"
        v-model:is-open="showSearch"
        :departamentos="departaments"
        :added-ids="productosIds"
        @refresh="refreshProductos"
        :p-top="ui.toolbarPaddingTop"
    />

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

  </ion-page>
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
