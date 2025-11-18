<script setup lang="ts">
import {miList} from "@/interfaces/types";
import {computed} from "vue";
import {colorFromTextStable, readableTextColor} from "@/utils/colorFromText";
import IconCustom from "@/views/Components/IconCustom.vue";
import {IonRippleEffect} from "@ionic/vue";

const props = defineProps<{
  item: miList
}>();
const bg = computed(() => colorFromTextStable(props.item.name_list));
const fg = computed(() => readableTextColor(bg.value));

const emit = defineEmits<{
  (e: 'ver'): void,
}>();

</script>

<template>
    <div class="flex items-center gap-2 py-2 px-3 rounded-xl shadow-lg" @click="emit('ver')"
         :class="[
                 item.name_list === 'Hogar' ? 'bg-blue-500 text-white' : '',
                 item.name_list === 'Oficina' ? 'bg-green-600 text-white' : '',
             ]"
         :style="item.name_list === 'Hogar' || item.name_list === 'Oficina' ? {} : {backgroundColor: bg, color: fg}"
    >
      <div class=" w-16 h-16 relative flex items-center rounded-full justify-center">
        <img v-if="item.name_list === 'Hogar' || item.name_list === 'Oficina'" :src="item.name_list === 'Hogar' ? '/assets/images/listas/hogar.png' : '/assets/images/listas/oficina.png'" :alt="item.name_list">
        <icon-custom v-else icon="document-signed" size="3xl"/>
      </div>

      <div class="flex-1 w-full">
        <p class="text-xs m-0 p-0 leading-none">Lista</p>
        <p class="w-full font-bold text-2xl leading-none">{{item.name_list}}</p>
      </div>

      <slot/>
    </div>
</template>
