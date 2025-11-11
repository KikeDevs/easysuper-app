<script setup lang="ts">
import {
  IonPage, IonHeader, IonContent, IonButton, onIonViewDidEnter,
  IonRippleEffect, IonAvatar, IonToast
} from "@ionic/vue";

import { nextTick, ref } from "vue";
import { useRouter } from "vue-router";

import { userPerfiles } from "@/api/UserProfiles";
import { Profile } from "@/interfaces/types";
import { colorFromTextStable } from "@/utils/colorFromText";

import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import ModalAdminPerfiles from "@/views/Pages/Configuraciones/ModalAdminPerfiles.vue";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";
import {useUiStore} from "@/stores/statusbar";

const ui = useUiStore();
const router = useRouter();

const initialLoading = ref(false);

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const isOpen = ref<boolean>(false);
const selectIdList = ref<number>(0);
const selectPerfil = ref<Profile | null>(null);
const tipoModal = ref<"agregar" | "editar">("agregar");

async function openModal(t: "agregar" | "editar", i?: number, p?: Profile): Promise<void> {
  selectIdList.value = i ?? 0;
  selectPerfil.value = p ?? null;
  tipoModal.value = t;
  await nextTick();
  isOpen.value = true;
}

async function closeModal(): Promise<void> {
  isOpen.value = false;
  selectPerfil.value = null; // ⚠️ importante: no 0
  await allPerfiles();
}

const perfiles = ref<Profile[]>([]);
async function allPerfiles(): Promise<void> {
  const resp = await userPerfiles();
  if (resp.status === "ok") perfiles.value = resp.profiles ?? [];
  if (resp.status === "error" || resp.status === "warning") router.back();
}

onIonViewDidEnter(async () => {
  await ui.refresh();
  initialLoading.value = true;
  try {
    await Promise.all([allPerfiles()]);
  } finally {
    initialLoading.value = false;
  }
});
</script>

<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <toolbar-custom class="px-2" :style="{paddingTop:ui.toolbarPaddingTop + 'px'}">
        <ion-title>Administra los perfiles</ion-title>
        <template #end>
          <ion-button @click="router.back()">Listo</ion-button>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="w-full grid grid-cols-2 gap-3">
        <div
            v-for="(p, i) in perfiles"
            :key="p.profile_id ?? i"
            class="relative w-full h-40 p-2 flex flex-col gap-2 items-center justify-center ion-activatable"
            @click="openModal('editar', i, p)"
        >
          <ion-avatar
              class="relative w-24 h-24 flex items-center justify-center"
              :style="{ background: colorFromTextStable(p.name_perfil) }"
          >
            <icon-custom icon="user" size="6xl" class="text-white" />
            <div class="absolute rounded-full bg-blue-300 dark:bg-[#2a2a2a] p-2 flex items-center justify-center bottom-0 right-0">
              <icon-custom icon="pencil" class="dark:text-white" />
            </div>
          </ion-avatar>
          <p>{{ p.name_perfil }}</p>
          <ion-ripple-effect />
        </div>

        <div v-if="!(perfiles.length >= 11)" class="w-full h-40 p-2 flex flex-col gap-2 items-center justify-center">
          <ion-avatar
              class="relative w-24 h-24 flex items-center justify-center bg-blue-400 overflow-hidden rounded-full ion-activatable"
              @click="openModal('agregar')"
          >
            <icon-custom icon="plus" size="6xl" class="text-white" />
            <ion-ripple-effect />
          </ion-avatar>
          <p class="opacity-0">Agregar</p>
        </div>
      </div>

      <!-- Clave para forzar remount entre modos/perfiles -->
      <modal-admin-perfiles
          :key="`${tipoModal}-${selectPerfil?.profile_id ?? 'new'}`"
          v-model:is-open="isOpen"
          :perfil="selectPerfil"
          :list-id="selectIdList"
          :tipo="tipoModal"
          @close="closeModal"
          @toast="showToast"
      />

      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          :message="toast.message"
          @didDismiss="toast.show = false"
      />

      <loader-normal :open="initialLoading"/>

    </ion-content>
  </ion-page>
</template>
