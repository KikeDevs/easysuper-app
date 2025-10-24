<script setup lang="ts">
import IconCustom from "@/views/Components/IconCustom.vue";
import {IonRippleEffect, IonContent, IonToast} from "@ionic/vue";
import {ref, watch} from "vue";
import {ListReboot} from "@/types/types";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import {formatFechaLarga} from "@/utils/formatFecha";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import BtnSecondary from "@/views/Components/BtnSecondary.vue";
import {rebootList} from "@/api/Lists";
import {useProfileStore} from "@/stores/profile";

const props = defineProps<{
  listsFinished?: ListReboot[];
}>();
const isOpen = defineModel<boolean>('is-open',{default: false});
const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const listSelect = ref<ListReboot | null>(null);

async function reiniciarLista(tipo: string): Promise<void> {
  const resp = await rebootList(listSelect.value?.userlist_id ?? 0,listSelect.value?.name_list ?? '',useProfileStore().selected?.profile_id ?? 0,tipo);
  if (resp.status == 'ok'){
    emit('refresh');
  }
  showToast(resp.message);
}


watch(isOpen, (open) => {
  if (open) {
    listSelect.value = null;
  }
});

</script>

<template>
  <ion-modal
      v-model:is-open="isOpen"
      :backdrop-dismiss="false"
      @didDismiss="emit('refresh')"
  >
    <ion-header class="ion-no-border">
      <toolbar-custom class="pl-2 border-b-1 border-b-gray-400">
        <ion-title>Reiniciar Lista</ion-title>
        <template #end>
          <div class="relative w-8 h-8 overflow-hidden flex items-center justify-center mr-2 rounded-full ion-activatable"
               @click="isOpen = false"
          >
            <icon-custom icon="cross"/>
            <ion-ripple-effect/>
          </div>
        </template>
      </toolbar-custom>
    </ion-header>
    <ion-content>
      <div
          v-for="l in listsFinished"
          class="relative flex items-center gap-1 border-b-1 border-b-gray-400 py-2 px-3 transition-colors ease-in-out duration-300"
          :class="listSelect?.userlist_id == l.userlist_id ? 'bg-gray-200 dark:bg-gray-800' : ''"
          @click="listSelect = l"
      >
        <div class="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-full not-dark:text-blue-500">
          <icon-custom icon="document-signed" size="xl"/>
        </div>
        <div class="flex flex-col">
          <p class="text-xs m-0 p-0 leading-none">Lista</p>
          <p class="font-bold m-0 p-0 leading-none text-lg">{{l.name_list}}</p>
        </div>

        <p class="absolute bottom-0 right-1 italic text-xs text-gray-300">{{formatFechaLarga(l.created_at)}}</p>
      </div>


      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          :message="toast.message"
          @didDismiss="toast.show = false"
      />
    </ion-content>
    <ion-footer>
      <div class="w-full px-3 py-1 flex gap-1">
        <btn-secondary v-if="listSelect != null" @click="reiniciarLista('nueva')">Lista nueva</btn-secondary>
        <btn-primary shape="round" size="large" v-if="listSelect != null" @click="reiniciarLista('reiniciar')">Reiniciar lista</btn-primary>
      </div>
    </ion-footer>
  </ion-modal>
</template>

<style scoped>
ion-modal{
  --width: 90%;
  --height: 60%;
  --border-radius: 10px;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}
</style>