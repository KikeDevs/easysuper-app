<script setup lang="ts">
import { IonButton } from "@ionic/vue";

const emit = defineEmits([
    "click"
]);
</script>

<template>
  <ion-button fill="solid" expand="block" class="text-base font-bold normal-case dark:text-white" @click="emit('click')">
    <slot/>
  </ion-button>
</template>