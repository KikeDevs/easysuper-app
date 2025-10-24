<script setup lang="ts">
import {IonPage, IonContent, useIonRouter} from "@ionic/vue";
import BtnPrimary from "../Components/BtnPrimary.vue";
import BtnSecondary from "../Components/BtnSecondary.vue";

const ion = useIonRouter();

function openLogin (): void {
  ion.push("login");
}

function openRegister (): void {
  ion.push('register');
}

</script>

<template>
  <ion-page>
    <ion-content>
      <div class="flex flex-col gap-10 justify-center items-center w-full h-full py-6 px-4">
        <div class="w-full flex flex-col gap-1 items-center">
          <img class="w-30 h-30" src="/assets/logo.png" alt="logo">
          <p class="text-3xl font-bold not-dark:text-blue-400">EasySuper</p>
        </div>

        <div class="w-full flex flex-col gap-3">
          <btn-primary shape="round" @click="openLogin" class="w-full">
            <div class="flex items-center gap-2 py-4">
              Iniciar Sesión
            </div>
          </btn-primary>
          <btn-secondary @click="openRegister">
            <div class="flex items-center gap-2 py-4">
              Registrarse
            </div>
          </btn-secondary>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
