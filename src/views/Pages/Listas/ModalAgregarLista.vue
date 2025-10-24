<script setup lang="ts">
import IconCustom from "@/views/Components/IconCustom.vue";
import {IonContent, IonModal} from "@ionic/vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import {ref} from "vue";


const isOpen = defineModel<boolean>('is-open',{default: false});
const textInput = defineModel<string>('text-input', {default: ''});

const nameList = ref<HTMLInputElement | null>(null);
function focusNameList(): void {
  requestAnimationFrame(() => {
    setTimeout(() => nameList.value?.focus(),0)
  })
}

const emit = defineEmits<{
  (e: 'agregar'): void;
  (e: 'update:is-open', v: boolean): void;
}>()

</script>

<template>
  <ion-modal
      v-model:is-open="isOpen"
      @didDismiss="emit('update:is-open', false)"
      @didPresent="focusNameList"
      class="add-list"
  >
    <ion-content>
      <div class="flex items-center px-3 pt-2 pb-1 border-b-1 border-gray-700">
        <p class="text-lg font-bold flex-1">Agregar lista</p>
        <icon-custom icon="cross" @click="isOpen = false"/>
      </div>

      <div class="w-full p-3 flex flex-col gap-5 justify-center items-center">
        <div class="rounded-full flex w-full px-3 items-center gap-2 dark:bg-[#2a2a2a] not-dark:bg-gray-200">
          <div class="flex items-center">
            <icon-custom icon="document-signed" />
            <input ref="nameList" v-model="textInput" type="text" placeholder="Nombre de la lista"
                   class="flex-1 w-full p-2 focus:outline-none focus:ring-0">
          </div>
        </div>
        <div class="flex-1 flex w-full h-full">
          <btn-primary size="large" shape="round" class="w-full" @click="emit('agregar')">
            <p>Agregar</p>
          </btn-primary>
        </div>
      </div>

    </ion-content>
  </ion-modal>

</template>

<style scoped>
ion-modal.add-list::part(content) {
  /* ocupa ancho completo y un alto fijo (ajústalo) */
  width: 80%;
  height: 25%;
  max-height: 90vh;

  /* estilo del panel */
  border-radius: 15px;
  overflow: hidden;
}
</style>