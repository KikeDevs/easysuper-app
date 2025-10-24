<script setup lang="ts">
import { IonRippleEffect } from "@ionic/vue";
import IconCustom from "@/views/Components/IconCustom.vue";
const props = defineProps({
  icon_primary: {
    type: String,
    default: '',
  },
  icon_secondary: {
    type: String,
    default: '',
  },
  tipo: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  focus: {
    type: Boolean,
    default: false,
  }
})

const model = defineModel();
const emit = defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <div class="flex w-full items-center gap-2 text-lg">
    <icon-custom v-if="icon_primary !== ''" :icon="icon_primary"/>
    <input v-model="model" :type="tipo" :placeholder="placeholder" class="flex-1 w-full p-2" :class="!focus ? 'focus:outline-none focus:ring-0' : ''"/>
    <div v-if="icon_secondary !== ''" class="ion-activatable relative overflow-hidden inline-flex items-center justify-center rounded-full py-1 px-1.5" @click="emit('click')">
      <icon-custom v-if="icon_secondary !== ''" :icon="icon_secondary"/>
      <ion-ripple-effect/>
    </div>
  </div>
</template>
