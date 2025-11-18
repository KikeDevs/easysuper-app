<script setup lang="ts">
import {IonPage, IonContent, IonBackButton, IonHeader, IonToast, onIonViewDidEnter, alertController, IonAlert} from "@ionic/vue";
import ItemUser from "@/views/Components/ItemUser.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import CardCustom from "@/views/Components/CardCustom.vue";
import BtnCard from "@/views/Components/BtnCard.vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import {useProfileStore} from "@/stores/profile";
import {Profile} from "@/interfaces/types";
import {computed, ref} from "vue";
import {userPerfiles} from "@/api/UserProfiles";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/stores/auth";
import {logOutUser} from "@/api/Login";
import {useUiStore} from "@/stores/statusbar";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";

const initLoading = ref(false);

const ui = useUiStore()
const router = useRouter();
const perfilActivo = computed(() => useProfileStore().selected?.profile_id);

const toast = ref({ show: false, message: "" });
function showToast(message: string) {
  toast.value.message = message;
  toast.value.show = true;
}

const allPerfiles = ref<Profile[]>([]);
async function getPerfiles(): Promise<void> {
  const resp = await userPerfiles();

  if (resp.status !==  'ok'){
    showToast(resp.message);
  }

  allPerfiles.value = resp.profiles ? resp.profiles : [];

}
function onSelectProfile(p: Profile): void {
  useProfileStore().select(p);
}

function goPerfiles(): void {
  router.push("configs/admin-perfiles");
}


async function confirmCloseSesion(): Promise<void> {
  const alert = await alertController.create({
    header: "Cerrar Sesion",
    message: `¿Seguro que quieres cerrar sesion?`,
    buttons: [
      { text: "Cancelar", role: "cancel" },
      { text: "Confirmar", role: "destructive", handler: async () => await cerrarSesion()},
    ],
  });
  await alert.present();
}

async function cerrarSesion(): Promise<void> {
  const auth = useAuthStore();
  await logOutUser();
  await auth.logoutAndReset();
  await router.replace("/");
}

onIonViewDidEnter(async () => {
  initLoading.value = true;
  try {
    await Promise.all([
        getPerfiles(),
      ui.refresh()
    ]);
  } finally {
    initLoading.value = false;
  }
})

</script>

<template>
  <ion-page>

    <ion-header :translucent="true" class="ion-no-border">
      <toolbar-custom class="px-2" :style="{ paddingTop: ui.toolbarPaddingTop + 'px'}">
        <template #start>
          <ion-back-button size="small" />
        </template>
        <template #end>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="w-full h-full flex flex-col gap-5">
        <div class="flex overflow-x-auto gap-5">
          <item-user v-for="p in allPerfiles"
                     :profile="p"
                     :edit="false"
                     @select="onSelectProfile(p)"
                     :class="[perfilActivo === p.profile_id ? 'font-bold italic': '']"
          />
        </div>

        <div class="flex justify-center">
          <btn-primary shape="round"
                       size="large"
                       class="w-[70vw]" @click="goPerfiles">Administra los perfiles</btn-primary>
        </div>

        <div class="w-full h-full flex-1">
          <card-custom>
            <btn-card text="Cuenta" icon="angle-right" class="border-b-1 not-dark:border-gray-300" @click="router.push('configs/cuenta')"/>
            <btn-card text="Recomendar" icon="heart" class="border-b-1 not-dark:border-gray-300"/>
            <btn-card text="Condiciones de privacidad" icon="angle-right" class="border-b-1 not-dark:border-gray-300"/>
            <btn-card text="Información de la app" icon="arrow-up-right-from-square" class="border-b-1 not-dark:border-gray-300"/>
            <btn-card text="Cerrar sesión" icon="angle-right" @click="confirmCloseSesion()"/>
          </card-custom>
        </div>

        <p class="text-sm">Version de la aplicación 0.00.01</p>
      </div>

      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          @didDismiss="toast.show = false"
          :message="toast.message"
      />

      <loader-normal :open="initLoading"/>
    </ion-content>
  </ion-page>
</template>

<style scoped>

</style>