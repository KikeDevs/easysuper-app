<script setup lang="ts">
import IconCustom from "@/views/Components/IconCustom.vue";
import {IonItem} from "@ionic/vue";

const props = withDefaults(defineProps<{
  title?: string,
  size?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl'
      | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl',
  icon?: string,
}>(),{
  title: 'Item Custom',
  size: 'lg',
  icon: 'world',
})
</script>

<template>
  <ion-item class="ion-activatable">
    <div class="flex items-center gap-5 px-3">
      <icon-custom :icon="icon" :size="size"/>
      <p>{{title}}</p>
    </div>
  </ion-item>
</template>

