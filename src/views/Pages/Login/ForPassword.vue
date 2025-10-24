<script setup lang="ts">
import {IonAvatar, IonBackButton, IonHeader, IonPage, IonTitle} from "@ionic/vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import InputContainer from "@/views/Components/InputContainer.vue";
import InputCustom from "@/views/Components/InputCustom.vue";
</script>

<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <toolbar-custom class="pr-3 md-toolbar">
        <template #start>
          <ion-back-button size="small"/>
        </template>
      </toolbar-custom>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="flex flex-col justify-center items-center w-full h-full">
        <img class="w-26 h-26" src="/assets/logo.png" alt="">
        <h1>BIENVENIDO</h1>
        <p class="text-center">Ingrese el correo con el que te registraste para restablecer la contraseña</p>

        <div class="flex-1 w-full flex items-center">
          <input-container>
            <input-custom icon_primary="envelope"/>
          </input-container>
        </div>

        <btn-primary size="large" shape="round" class="w-full">
          Siguiente
        </btn-primary>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>

</style>