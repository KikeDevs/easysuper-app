<script setup lang="ts">
import IconCustom from "@/views/Components/IconCustom.vue";
import { IonRippleEffect } from "@ionic/vue";

const props = defineProps({
  text: {
    type: String,
    default: 'Button'
  },
  icon: {
    type: String,
    default: 'envelope'
  }

})
</script>

<template>
  <div class="ion-activatable overflow-hidden w-full relative flex items-center gap-1 px-3 py-4 font-bold">
    <p class="flex-1 text-start">{{props.text}}</p>
    <icon-custom :icon="icon" />
    <ion-ripple-effect/>
  </div>
</template>

<style scoped>

</style>