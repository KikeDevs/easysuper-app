<script setup lang="ts">
import {IonPage, IonBackButton, IonRippleEffect} from "@ionic/vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import CardCustom from "@/views/Components/CardCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <toolbar-custom class="md-toolbar">
        <ion-title>Cuenta</ion-title>
        <template #start>
          <ion-back-button/>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
      <p class="text-lg font-bold">Detalles de la cuenta</p>

      <card-custom class="mt-3">
        <div class="p-3 border-b-1 border-b-gray-400 flex flex-col justify-center gap-2">
          <p class="text-lg font-bold leading-none">Email</p>
          <p class="leading-none">Correo-electronico</p>
        </div>
        <div class="p-3 border-b-1 border-b-gray-400 flex flex-col justify-center gap-2">
          <div class="w-full flex items-center justify-between">
            <p class="text-lg font-bold leading-none">Contraseña</p>
            <div class="relative w-8 h-8 overflow-hidden flex items-center justify-center mr-2 rounded-full ion-activatable">
              <icon-custom icon="pencil" size="xl"/>
              <ion-ripple-effect/>
            </div>
          </div>
          <p>Password</p>
        </div>
        <div class="p-3 flex flex-col justify-center gap-2">
          <div class="w-full flex items-center justify-between">
            <p class="text-lg font-bold leading-none">Nombre</p>
            <div class="relative w-8 h-8 overflow-hidden flex items-center justify-center mr-2 rounded-full ion-activatable">
              <icon-custom icon="pencil" size="xl"/>
              <ion-ripple-effect/>
            </div>
          </div>
          <p>Nombre usuario</p>
        </div>
      </card-custom>

    </ion-content>
  </ion-page>
</template>

<style scoped>

</style>