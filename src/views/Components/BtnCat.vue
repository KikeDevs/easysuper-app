<script setup lang="ts">
import {IonRippleEffect} from "@ionic/vue";
const props = defineProps({
  url: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div
      class="relative overflow-hidden bg-white ion-activatable border border-gray-200 shadow-sm w-fit rounded-2xl"
      role="button" tabindex="0">
    <img :src="url" alt="" class="w-full h-full object-contain">
    <ion-ripple-effect></ion-ripple-effect>
  </div>
</template>

<style scoped>

</style>