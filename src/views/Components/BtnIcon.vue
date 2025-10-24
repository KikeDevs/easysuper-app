<script setup lang="ts">
import {IonButton} from "@ionic/vue";
import IconCustom from "@/views/Components/IconCustom.vue";

const props = defineProps({
  icon: {
    type: String,
    default: 'world'
  },
  tipo: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits([
    'click'
]);

</script>
<template>
  <ion-button shape="round" @click="emit('click')" class="group">
    <i class="dark:group-focus:text-white not-dark:group-focus:text-[#2a2a2a]" :class="'flex text-xl fi fi-rr-' + icon"/>
  </ion-button>
</template>
