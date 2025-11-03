<script setup lang="ts">
import {
  IonAvatar, IonBackButton, IonHeader, IonTitle, IonPage, useIonRouter,
  IonContent, IonRippleEffect
} from "@ionic/vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import {computed} from "vue";
import {colorFromTextStable} from "@/utils/colorFromText";
import {useProfileStore} from "@/stores/profile";

const ionRouter = useIonRouter();

function goConfigs(): void {
  ionRouter.push('configs')
}

const bg = computed(() => colorFromTextStable(useProfileStore().selected?.name_perfil ?? ''));


</script>

<template>
  <ion-page>
  <!-- Header -->
  <ion-header :translucent="true" class="ion-no-border">
    <toolbar-custom class="px-2 padding-bottom">
      <ion-title>Ofertas</ion-title>

      <template #start>
        <ion-back-button size="small" />
      </template>

      <template #end>
        <ion-avatar class="w-8 h-8 flex items-center justify-center" @click="goConfigs" :style="{background: bg}">
          <icon-custom icon="user" size="xl" class="text-white"/>
        </ion-avatar>
      </template>
    </toolbar-custom>
  </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="w-full h-full flex flex-col gap-5">
        <img class="shadow-md rounded-2xl" src="/assets/images/ofertas/Promo-1.png" alt="promo1">
        <img class="shadow-md rounded-2xl" src="/assets/images/ofertas/Promo-2.png" alt="promo2">
      </div>
    </ion-content>

  </ion-page>
</template>

<style scoped>

</style>