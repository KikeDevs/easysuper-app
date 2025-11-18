<script setup lang="ts">
import {IonAvatar} from "@ionic/vue";
import {computed} from "vue";
import {useRouter} from "vue-router";
import {useProfileStore} from "@/stores/profile";
import {colorFromTextStable} from "@/utils/colorFromText";

import IconCustom from "@/views/Components/IconCustom.vue";


const router = useRouter();
const bg = computed(() => colorFromTextStable(useProfileStore().selected?.name_perfil ?? ''));

</script>

<template>
  <ion-avatar
      class="w-8 h-8 flex items-center justify-center"
      @click="router.push('configs')"
      :style="{background: bg}">
    <icon-custom icon="user" size="xl" class="text-white"/>
  </ion-avatar>
</template>