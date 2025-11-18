<script setup lang="ts">
import {IonModal,IonContent} from "@ionic/vue";

import {miList} from "@/interfaces/types";
import {ref, watch} from "vue";
import {misList} from "@/api/Lists";
import {colorFromTextStable, readableTextColor} from "@/utils/colorFromText";
import IconCustom from "@/views/Components/IconCustom.vue";
import {useRouter} from "vue-router";

const router = useRouter();

const isOpen = defineModel<boolean>('is-open',{default: false});
const emit = defineEmits<{
  (e: 'close'): void
}>();

const usersLists = ref<miList[]>([])
async function getMisLists(): Promise<void>{
  const resp = await misList();
  usersLists.value = resp.misLists ?? [];
}

function iniciarCompra(l: miList): void {
  emit('close');
  router.push(
      {
        name: "Compra",
        params: {
          userlistId: l.userlist_id,
          nameList: l.name_list,
        }
      }
  );
}

watch(isOpen, (open) => {
  if (open) {
    getMisLists();
  }
});
</script>

<template>
  <ion-modal
      v-model:is-open="isOpen"
      @didDismiss="emit('close')"
      :initial-breakpoint="[0.7]"
  >
    <ion-content :fullscreen="true" class="ion-padding">
      <p class="font-bold">Elige una de tus listas</p>
      <p class="text-xs italic text-gray-400">Solo puede seleccionar las que tengan productos agregados.</p>

      <!-- ModalIniciarCompra.vue (template) -->
      <div v-for="l in usersLists"
           :key="l.userlist_id"
           class="flex gap-2 py-2 items-center border-b-1 border-b-gray-400">
        <button
            type="button"
            class="flex items-center gap-2 w-full text-left disabled:opacity-40"
            :disabled="(l.t_products ?? 0) === 0"
            @click="iniciarCompra(l)"
        >
          <div class="w-14 h-14 rounded-full flex items-center justify-center"
               :class="[
           l.name_list == 'Hogar' ? 'bg-blue-500 text-white' : '',
           l.name_list == 'Oficina' ? 'bg-green-600 text-white' : '',
         ]"
               :style="(l.name_list == 'Hogar' || l.name_list == 'Oficina')
           ? {}
           : { background: colorFromTextStable(l.name_list),
               color: readableTextColor(colorFromTextStable(l.name_list)) }"
          >
            <img v-if="l.name_list === 'Hogar' || l.name_list === 'Oficina'"
                 :src="l.name_list === 'Hogar' ? '/assets/images/listas/hogar.png' : '/assets/images/listas/oficina.png'"
                 :alt="l.name_list">
            <icon-custom v-else icon="document-signed" size="2xl"/>
          </div>

          <div class="flex-1 w-full">
            <p class="font-bold">{{ l.name_list }}</p>
          </div>
          <icon-custom icon="cart-shopping-fast"/>
        </button>
      </div>


    </ion-content>
  </ion-modal>
</template>

<style scoped>
ion-modal {
  --border-radius: 16px;
}
</style>