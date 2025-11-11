<script setup lang="ts">
import { alertController, IonModal, IonRippleEffect } from "@ionic/vue";
import { colorFromTextStable } from "@/utils/colorFromText";
import { Profile } from "@/interfaces/types";

import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import { ref, watch } from "vue";
import { addPerfil, deletePerfil, edittPerfil } from "@/api/UserProfiles";
import { useProfileStore } from "@/stores/profile";
import {Keyboard} from "@capacitor/keyboard";

const isOpen = defineModel<boolean>("is-open", { default: false });

const props = defineProps<{
  perfil: Profile | null;
  listId: number;
  tipo: "editar" | "agregar";
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "toast", v: string): void;
}>();

// Estado local (NO mutamos el prop)
const localName = ref<string>("");
const perfilId = ref<number>(0);

watch(isOpen, (isopen) => {
  if (isopen) {
    if (props.perfil == null) localName.value = "";
    else localName.value = props.perfil.name_perfil;

    perfilId.value = props.perfil?.profile_id ?? 0;
  }
});

const inputEl = ref<HTMLInputElement | null>(null);
function onDone(){
  inputEl.value?.blur();
  Keyboard.hide();
}



function titleModal(): string {
  return props.tipo === "editar" ? "Editar" : "Agregar";
}

async function onListo(): Promise<void> {
  if (props.tipo === "editar") {
    await editarPerfil();
  } else {
    await agregarPerfil();
  }
}

async function editarPerfil(): Promise<void> {
  if (!props.perfil) {
    emit("toast", "Perfil no disponible.");
    return;
  }
  const resp = await edittPerfil(perfilId.value, localName.value.trim());
  localName.value = "";
  emit("toast", resp.message);
  isOpen.value = false
}

async function agregarPerfil(): Promise<void> {
  const name = localName.value.trim();
  if (!name) {
    emit("toast", "Escribe un nombre de perfil.");
    return;
  }
  const resp = await addPerfil(name);
  localName.value = "";
  emit("toast", resp.message);
  isOpen.value = false;
}

async function confirmarEliminar(): Promise<void> {
  const nombre = props.perfil?.name_perfil ?? "";
  const alert = await alertController.create({
    header: "Eliminar perfil",
    message: `¿Seguro que quieres eliminar el perfil ${nombre}? Esta acción no se puede deshacer.`,
    buttons: [
      { text: "Cancelar", role: "cancel" },
      { text: "Eliminar", role: "destructive", handler: async () => await eliminarPerfil() },
    ],
  });
  await alert.present();
}

async function eliminarPerfil(): Promise<void> {
  if (!props.perfil) {
    emit("toast", "Perfil no disponible.");
    return;
  }
  const perfilEnUso = useProfileStore().selected?.profile_id ?? 0;
  if (perfilEnUso === perfilId.value) {
    emit("toast", "No puedes eliminar el perfil en uso, cámbialo para eliminar.");
    return;
  }
  const resp = await deletePerfil(perfilId.value);
  emit("toast", resp.message);
  localName.value = "";
  perfilId.value = 0;
  isOpen.value = false;
}
</script>

<template>
  <ion-modal
      v-model:is-open="isOpen"
      :initial-breakpoint="0.5"
      @didDismiss="emit('close')"
  >
    <ion-header class="ion-no-border">
      <toolbar-custom class="px-2">
        <ion-title>{{ titleModal() }}</ion-title>
        <template #start>
          <div class="flex p-1.5 rounded-full ion-activatable overflow-hidden relative" @click="() => { isOpen = false }">
            <icon-custom icon="arrow-small-left" size="3xl" />
            <ion-ripple-effect />
          </div>
        </template>
        <template #end>
          <ion-button @click="onListo">Listo</ion-button>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="relative w-full h-full flex flex-col gap-3">
        <div class="w-full flex justify-center">
          <div class="w-28 h-28 rounded-full">
            <ion-avatar
                class="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                :class="tipo === 'editar' ? '' : 'bg-blue-500'"
                :style="tipo === 'editar' && localName ? { background: colorFromTextStable(localName) } : {}"
            >
              <icon-custom icon="user" size="6xl" class="text-white" />
            </ion-avatar>
          </div>
        </div>

        <div class="rounded-full flex w-full px-3 items-center gap-2 dark:bg-[#2a2a2a] not-dark:bg-gray-200">
          <div class="flex items-center w-full">
            <icon-custom icon="user" />
            <input
                v-model="localName"
                type="text"
                placeholder="Nombre perfil"
                class="flex-1 w-full p-2 focus:outline-none focus:ring-0"
                @keyup.enter="onDone"
            />
          </div>
        </div>

        <div v-if="listId !== 0 && tipo === 'editar'" class="flex justify-end mt-5">
          <ion-button fill="clear" class="w-fit dark:text-white" @click="confirmarEliminar">
            Eliminar perfil
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>
