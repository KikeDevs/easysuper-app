<script setup lang="ts">
import { IonRippleEffect } from "@ionic/vue";

const props = defineProps({
  ripple: {
    type: Boolean,
    default: false,
  }
})
</script>
<template>
  <div class="w-full rounded-xl shadow-lg overflow-hidden relative border-2 border-gray-200  dark:border-0 dark:bg-[#2a2a2a]" :class="ripple ? 'ion-activatable ripple-parent rounded-rectangle' : ''">
    <ion-ripple-effect/>
    <slot/>
  </div>
</template>

<style scoped>

</style>