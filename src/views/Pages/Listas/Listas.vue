<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonBackButton,
  IonAvatar,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  useIonRouter,
  IonRippleEffect, onIonViewDidEnter,
} from "@ionic/vue";
import {computed, ref} from "vue";

import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import ModalOpcionesLista from "@/views/Pages/Listas/ModalOpcionesLista.vue";

import {misList, addList, deleteList, getListsFinished} from "@/api/Lists";
import {ListReboot, miList} from "@/types/types";
import ItemMiLista from "@/views/Pages/Listas/ItemMiLista.vue";
import router from "@/router/router";
import ModalAgregarLista from "@/views/Pages/Listas/ModalAgregarLista.vue";
import {colorFromTextStable} from "@/utils/colorFromText";
import {useProfileStore} from "@/stores/profile";
import ModalReiniciarLista from "@/views/Pages/Listas/ModalReiniciarLista.vue";


const ionRouter = useIonRouter();
const goConfigs = () => ionRouter.push("configs");

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const modalReiniciar = ref<boolean>(false);

const modalList = ref(false);
const nameList = ref<string>('');

const showOpciones = ref<boolean>(false);
const itemOpciones = ref();

function openOpciones(item: miList): void {
  showOpciones.value = true;
  itemOpciones.value = item;
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

const listsFinished = ref<ListReboot[]>([]);
async function ultimasLists(): Promise<void> {
  const resp = await getListsFinished();

  listsFinished.value = resp.listReboots ?? [];
}

//Ver Lista
function verLista(id: number, nombre:string): void {
  router.push({
    name: "Lista",
    params: {
      listId: id,
      nameList: nombre,
    }
  });
}

//Selección y acción: agregar
async function agregarLista(): Promise<void> {
  const resp = await addList(nameList.value);

  if (resp.status !== "ok") {
    showToast(resp.message ?? "No se pudo agregar la lista. Inténtalo de nuevo.");
    nameList.value = "";
    modalList.value = false;
    return;
  }

  showToast(resp.message ?? "Lista agregada.");
  await cargarMisListas();

  nameList.value = '';
  modalList.value = false;
}
//Seleccion y accion: eliminar
async function eliminarLista(listId: number): Promise<void> {
  const resp = await deleteList(listId);
  if (resp.status !== "ok") {
    toast.value = { show: true, message: resp.message };
    return;
  }

  showToast(resp.message);
  await cargarMisListas();
  showOpciones.value = false;

}

async function reiniciarLista(): Promise<void> {
  modalReiniciar.value = false;
  await cargarMisListas();
}

function iniciarCompra(tProductos: number): void{
  if (tProductos === 0) {
    showToast("No hay productos para iniciar compra.");
    showOpciones.value = false;
    return;
  }
}

const bg = computed(() => colorFromTextStable(useProfileStore().selected?.name_perfil ?? ''));

async function doRefresh(ev: CustomEvent): Promise<void> {
  try {
    await cargarMisListas();
  } finally {
    await (ev.target as HTMLIonRefresherElement).complete();
  }
}

onIonViewDidEnter(async () => {
  await Promise.all([cargarMisListas(),ultimasLists()]);
})
</script>

<template>
  <ion-page>
    <!-- Header -->
    <ion-header :translucent="true" class="ion-no-border">
      <toolbar-custom class="pr-3 md-toolbar padding-bottom">
        <ion-title>Listas</ion-title>

        <template #start>
          <ion-back-button size="small" />
        </template>

        <template #end>
          <div
              v-if="listsFinished.length > 0"
              class="relative w-8 h-8 overflow-hidden flex items-center justify-center mr-2 rounded-full ion-activatable"
              @click="modalReiniciar = true"
          >
            <icon-custom icon="time-past" size="xl"/>
            <ion-ripple-effect/>
          </div>
          <ion-avatar class="w-8 h-8 flex items-center justify-center" @click="goConfigs" :style="{background: bg}">
            <icon-custom icon="user" size="xl" class="text-white"/>
          </ion-avatar>
        </template>
      </toolbar-custom>
    </ion-header>

    <!-- Content -->
    <ion-content :fullscreen="true">
      <!-- Refresher -->
      <ion-refresher slot="fixed" @ionRefresh="doRefresh">
        <ion-refresher-content
            pulling-text="Desliza para recargar"
            refreshing-text="Actualizando..."
            refreshing-spinner="lines"
        />
      </ion-refresher>

      <!-- Mis listas (render real pendiente según tu UI) -->
      <div class="flex flex-col gap-3 px-5">
        <div v-if="misListas.length == 0" class="w-full flex justify-center">
          <p class="font-bold text-blue-500 dark:text-white">No hay listas</p>
        </div>
        <item-mi-lista v-else v-for="s in misListas" :item="s"
                       class="border-b-1 dark:border-b-white/40 not-dark:border-gray-300"
                       @ver="verLista(s.userlist_id,s.name_list)"
                       @click="openOpciones(s)"/>

        <div class="flex justify-center transition-all ease-in-out duration-300"
             :class="misListas.length > 6 ? 'fixed z-10 bottom-4 right-4' : 'relative w-full mt-3'">
          <btn-primary
              :shape="misListas.length > 6 ? 'round' : 'default'"
              size="large"
              :class="misListas.length > 6 ? 'w-fit rounded-full shadow-lg' : 'w-full '"
              @click="modalList = true"
          >
            <div class="flex items-center justify-center gap-2">
              <icon-custom :icon="misListas.length > 6 ? 'plus' : 'add'" />
              <span class="inline-block whitespace-nowrap overflow-hidden">Nueva</span>
            </div>
          </btn-primary>
        </div>
      </div>

      <div class="h-16"/>



      <!-- Modal opciones -->
      <modal-opciones-lista
          v-model:is-open="showOpciones"
          :item="itemOpciones"
          @eliminar="eliminarLista(itemOpciones.userlist_id)"
          @compra="iniciarCompra(itemOpciones.t_products)"
      />

      <modal-agregar-lista
          v-model:is-open="modalList"
          v-model:text-input="nameList"
          @agregar="agregarLista"
      />

      <modal-reiniciar-lista
          v-model:is-open="modalReiniciar"
          :listsFinished="listsFinished"
          @refresh="reiniciarLista"
      />

      <!-- Toast -->
      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          :message="toast.message"
          @didDismiss="toast.show = false"
      />
    </ion-content>

  </ion-page>
</template>