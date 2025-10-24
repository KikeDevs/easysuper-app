<script setup lang="ts">
import {
  IonPage, IonHeader, IonTitle, IonBackButton, IonContent, IonToast, IonRefresherContent, IonRefresher,
} from "@ionic/vue";
import { computed, onMounted, ref } from "vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import ModalProductosLista from "@/views/Pages/Listas/ModalProductosLista.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import ItemProductoLista from "@/views/Pages/Listas/ItemProductoLista.vue";

import {Departamento, ProductList} from "@/types/types";
import { getListDetails } from "@/api/Lists";
import {deleteProduct, getDepartaments} from "@/api/Productos";
import { colorFromTextStable } from "@/utils/colorFromText";

const props = defineProps<{
  listId: number,
  nameList: string,
}>();

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


async function refreshProductos(): Promise<void> {
  showSearch.value = false;
  await getProductosLista();
}


async function deleteProducto(p: ProductList): Promise<void> {
  const resp = await deleteProduct(props.listId, p.product_id);
  await getProductosLista();
  showToast(resp.message);
}
async function doRefresh(ev: CustomEvent): Promise<void> {
  try {
    await getProductosLista();
  } finally {
    await (ev.target as HTMLIonRefresherElement).complete();
  }
}

onMounted(async () => {
  await Promise.all([getProductosLista(), obDepartamentos()]);
});

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
      <toolbar-custom class="md-toolbar pr-3">
        <ion-title>Lista {{ nameList }}</ion-title>
        <template #start>
          <ion-back-button/>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
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

      <div v-else v-for="g in grupos" :key="g.id">
        <div class="mt-3 pl-1 rounded-t-lg bg-blue-500 text-white dark:bg-[#2a2a2a]">
          <p class="text-lg font-semibold">{{ g.name }}</p>
        </div>

        <item-producto-lista
            v-for="p in g.items"
            :key="p.product_id"
            :itemDetails="p"
        >
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
      <div class="h-16"/>
      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          @didDismiss="toast.show = false"
          :message="toast.message"
      />
    </ion-content>

    <!-- Botón agregar -->
    <div class="fixed z-10 bottom-4 right-4 flex justify-center">
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
        @refresh="refreshProductos"
    />
  </ion-page>
</template>

