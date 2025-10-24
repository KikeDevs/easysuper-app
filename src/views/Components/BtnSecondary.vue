<script setup lang="ts">
import { IonButton } from "@ionic/vue";

const emit = defineEmits([
    "click"
])
</script>
<template>
  <ion-button fill="outline" expand="block" shape="round" @click="emit('click')" class="normal-case text-base">
    <slot/>
  </ion-button>
</template>
