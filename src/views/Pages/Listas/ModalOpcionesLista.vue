<script setup lang="ts">

import { IonModal, IonContent, IonList } from '@ionic/vue'

import IconCustom from "@/views/Components/IconCustom.vue";
import ItemCustom from "@/views/Components/ItemCustom.vue";

import {miList} from "@/interfaces/types";
import {computed} from "vue";
import {colorFromTextStable, readableTextColor} from "@/utils/colorFromText";
import {useProfileStore} from "@/stores/profile";

const props = defineProps<{
  item: miList
}>();
const bg = computed(() => colorFromTextStable(props.item.name_list));
const fg = computed(() => readableTextColor(bg.value));


const isOpen = defineModel<boolean>('is-open', { default: false })
const emit = defineEmits<{
  (e: 'update:is-open', v: boolean): void
  (e: 'eliminar'): void
  (e: 'compra'): void
  (e: 'compartir'): void
}>()


</script>

<template>
  <!-- v-model:is-open maneja abrir/cerrar automáticamente -->
  <ion-modal
      v-model:is-open="isOpen"
      @didDismiss="emit('update:is-open', false)"
  >
    <ion-content>
      <div class="flex items-center gap-2 px-3 pt-2 pb-1 border-b-1 border-b-gray-400">
        <div class="rounded-full w-10 h-10 overflow-hidden flex justify-center items-center"
             :class="[
                 item.name_list === 'Hogar' ? 'bg-blue-500 text-white' : '',
                 item.name_list === 'Oficina' ? 'bg-green-600 text-white' : '',
             ]"
             :style="item.name_list === 'Hogar' || item.name_list === 'Oficina' ? {} : {backgroundColor: bg, color: fg}">
          <img v-if="item.name_list === 'Hogar' || item.name_list === 'Oficina'" :src="item.name_list === 'Hogar' ? '/assets/images/listas/hogar.png' : '/assets/images/listas/oficina.png'" :alt="item.name_list">
          <icon-custom v-else icon="document-signed" size="2xl"/>
        </div>
        <div class="flex-1 flex flex-col w-full">
          <p class="text-base font-bold">{{ item.name_list }}</p>
          <div class="flex items-center gap-1 text-sm text-gray-300">
            <p>{{useProfileStore().selected?.name_perfil}}</p>
            <div class="w-1 h-1 rounded-full bg-gray-300"></div>
            <p class="italic">{{ item.t_products ? item.t_products : 0 }} productos</p>
          </div>
        </div>
        <icon-custom icon="cross" @click="emit('update:is-open', false)"/>
      </div>

      <ion-list lines="none">
        <item-custom icon="shopping-cart" size="xl" title="Iniciar Compra" @click="emit('compra')"/>
        <item-custom icon="share" size="xl" title="Compartir Lista" @click="emit('compartir')"/>
        <item-custom icon="trash" size="xl" title="Eliminar Lista"
                     :disabled="item.name_list === 'Hogar' || item.name_list === 'Oficina'"
                     class="disabled:opacity-40" @click="emit('eliminar')"/>
        <item-custom icon="pencil" size="xl" title="Editar Lista"
                     :disabled="item.name_list === 'Hogar' || item.name_list === 'Oficina'"
                     class="disabled:opacity-40"
        />
      </ion-list>

    </ion-content>
  </ion-modal>
</template>
<style scoped>
ion-modal{
  --width: 85%;
  --max-width: 420px;
  --height: 270px;
  --border-radius: 10px;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}

</style>