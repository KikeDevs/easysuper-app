<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonBackButton,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonRippleEffect, onIonViewDidEnter, IonModal,
} from "@ionic/vue";
import {ref} from "vue";

import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import ModalOpcionesLista from "@/views/Pages/Listas/ModalOpcionesLista.vue";

import {misList, addList, deleteList, getListDetails} from "@/api/Lists";
import {miList} from "@/interfaces/types";
import ItemMiLista from "@/views/Pages/Listas/ItemMiLista.vue";
import router from "@/router/router";
import ModalAgregarLista from "@/views/Pages/Listas/ModalAgregarLista.vue";
import ModalReiniciarLista from "@/views/Pages/Listas/ModalReiniciarLista.vue";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";
import {useUiStore} from "@/stores/statusbar";
import AvatarPerfil from "@/views/Components/AvatarPerfil.vue";
import BtnSecondary from "@/views/Components/BtnSecondary.vue";
import {ProductList} from "@/interfaces/products";
import {Share} from "@capacitor/share";

const initialLoading = ref(false);

const ui = useUiStore();
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
    openMiniDialog("No se pudieron cargar tus listas","Oops");
    misListas.value = [];
    return;
  }
  misListas.value = resp.misLists ?? [];
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
    nameList.value = "";
    modalList.value = false;
    return;
  }

  openMiniDialog(resp.message, resp.status === "ok" ? "Agregada" : "Ups");
  await cargarMisListas();

  nameList.value = '';
  modalList.value = false;
}
//Seleccion y accion: eliminar
async function eliminarLista(listId: number): Promise<void> {
  const resp = await deleteList(listId);
  if (resp.status !== "ok") {
    openMiniDialog(resp.message,"Oops");
    return;
  }

  openMiniDialog(resp.message, resp.status === "ok" ? "Eliminada" : "Ups");
  await cargarMisListas();
  showOpciones.value = false;

}
async function reiniciarLista(): Promise<void> {
  modalReiniciar.value = false;
  await cargarMisListas();
}

function iniciarCompra(listItem:miList): void{
  if (listItem.t_products === 0) {
    openMiniDialog("No hay productos para compartir compra.","Oops");
    showOpciones.value = false;
    return;
  }

  showOpciones.value = false;

  router.push(
      {
        name: "Compra",
        params: {
          userlistId: listItem.userlist_id,
          nameList: listItem.name_list,
        }
      }
  );

}

function estadoIcon(status: number) {
  return status === 1 ? '✅' : '⬜';
}

function estadoTxt(status: number) {
  return status === 1 ? 'Comprado' : 'Pendiente';
}

function buildShareText(listItem: miList, items: ProductList[]) {
  const header = `🛒 Lista: ${listItem.name_list}\n`;

  const body = items.map((p, idx) => {
    const qty = (p.cantidad && p.cantidad > 0) ? ` x${p.cantidad}` : '';
    // Si quieres mostrar quien actualizó:
    // const by = p.name_perfil ? ` (por ${p.name_perfil})` : '';
    return `${idx + 1}. ${estadoIcon(p.status_pro)} ${p.name_product}${qty} — ${estadoTxt(p.status_pro)}`;
  });

  return `${header}\n${body.join('\n')}\n\nEnviado desde EasySuper`;
}

async function compartirLista(listItem: miList): Promise<void> {
  if (!listItem.t_products || listItem.t_products === 0) {
    openMiniDialog("No hay productos para compartir compra.","Oops");
  }

  const resp = await getListDetails(listItem.userlist_id);
  const productos = (resp?.listDetalles ?? []) as ProductList[];

  if (!productos.length) {
    openMiniDialog("No hay productos para compartir compra.","Oops");
  }

  // Opcional: pendientes arriba, comprados abajo
  const ordenados = [...productos].sort((a, b) => a.status_pro - b.status_pro);

  const text = buildShareText(listItem, ordenados);

  await Share.share({
    title: `Lista: ${listItem.name_list}`,
    text,
    dialogTitle: 'Compartir lista',
  });
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

async function doRefresh(ev: CustomEvent): Promise<void> {
  try {
    await cargarMisListas();
  } finally {
    await (ev.target as HTMLIonRefresherElement).complete();
  }
}

onIonViewDidEnter(async () => {
  await ui.refresh();
  initialLoading.value = true;
  try {
    await Promise.all([cargarMisListas()]);
  }finally {
    initialLoading.value = false;
  }
})
</script>

<template>
  <ion-page>
    <!-- Header -->
    <ion-header :translucent="true" class="ion-no-border">
      <toolbar-custom class="px-2" :style="{ paddingTop: ui.toolbarPaddingTop + 'px'}">
        <ion-title>Listas</ion-title>

        <template #start>
          <ion-back-button size="small" />
        </template>

        <template #end>
          <avatar-perfil/>
        </template>
      </toolbar-custom>
    </ion-header>

    <!-- Content -->
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Refresher -->
      <ion-refresher slot="fixed" @ionRefresh="doRefresh">
        <ion-refresher-content
            pulling-text="Desliza para recargar"
            refreshing-text="Actualizando..."
            refreshing-spinner="lines"
        />
      </ion-refresher>

      <div v-if="misListas.length == 0" class="w-full flex justify-center">
        <p class="font-bold text-blue-500 dark:text-white">No hay listas</p>
      </div>

      <TransitionGroup
          name="list-fade"
          tag="div"
          class="w-full flex flex-col gap-2"
          appear
      >
          <item-mi-lista v-for="s in misListas" :item="s" :key="s.userlist_id"
                         @ver="verLista(s.userlist_id,s.name_list)">
            <div class="overflow-hidden relative flex rounded-full p-1 ion-activatable" @click.stop="openOpciones(s)">
              <icon-custom icon="menu-dots-vertical" size="xl"/>
              <ion-ripple-effect/>
            </div>
          </item-mi-lista>
      </TransitionGroup>

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

      <btn-secondary size="large" shape="default" class="w-full mt-2" @click="modalReiniciar = true">
        <div class="flex items-center justify-center gap-2">
          <icon-custom icon="time-past" size="xl"/>
          <p>Listas Anteriores</p>
        </div>
      </btn-secondary>

      <div class="h-16"/>



      <!-- Modal opciones -->
      <modal-opciones-lista
          v-model:is-open="showOpciones"
          :item="itemOpciones"
          @eliminar="eliminarLista(itemOpciones.userlist_id)"
          @compra="iniciarCompra(itemOpciones)"
          @compartir="compartirLista(itemOpciones)"
      />

      <modal-agregar-lista
          v-model:is-open="modalList"
          v-model:text-input="nameList"
          @agregar="agregarLista"
      />

      <modal-reiniciar-lista
          v-model:is-open="modalReiniciar"
          @refresh="reiniciarLista"
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

      <loader-normal :open="initialLoading"/>
    </ion-content>

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