<script setup lang="ts">
import {IonPage, IonContent, IonBackButton, IonHeader, IonToast} from "@ionic/vue";
import ItemUser from "@/views/Components/ItemUser.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import CardCustom from "@/views/Components/CardCustom.vue";
import BtnCard from "@/views/Components/BtnCard.vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import {useProfileStore} from "@/stores/profile";
import {Profile} from "@/types/types";
import {computed, onMounted, ref} from "vue";
import {userPerfiles} from "@/api/UserProfiles";
import router from "@/router/router";

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

onMounted(() => {
  getPerfiles()
})
</script>

<template>
  <ion-page>

    <ion-header :translucent="true" class="ion-no-border">
      <toolbar-custom class="pr-3 md-toolbar">
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

        <btn-primary shape="round" size="large">Administra los perfiles</btn-primary>

        <div class="w-full h-full flex-1">
          <card-custom>
            <btn-card text="Cuenta" icon="angle-right" class="border-b-1 not-dark:border-gray-300" @click="router.push('configs/cuenta')"/>
            <btn-card text="Recomendar" icon="heart" class="border-b-1 not-dark:border-gray-300"/>
            <btn-card text="Condiciones de privacidad" icon="angle-right" class="border-b-1 not-dark:border-gray-300"/>
            <btn-card text="Información de la app" icon="arrow-up-right-from-square" class="border-b-1 not-dark:border-gray-300"/>
            <btn-card text="Cerrar sesión" icon="angle-right"/>
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
    </ion-content>
  </ion-page>
</template>

<style scoped>

</style>