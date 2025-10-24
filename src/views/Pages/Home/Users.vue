<script setup lang="ts">
import {
  IonPage, IonContent, IonRippleEffect,
  IonModal, IonAvatar, IonToast, IonRefresher, IonRefresherContent
} from '@ionic/vue';
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import {computed, onMounted, ref} from "vue";
import {Profile} from "@/types/types";
import {addPerfil, edittPerfil, userPerfiles} from "@/api/UserProfiles";
import ItemUser from "@/views/Components/ItemUser.vue";
import {useProfileStore} from "@/stores/profile";
import router from "@/router/router";
import {colorFromTextStable} from "@/utils/colorFromText";


const toast = ref({ show: false, message: "" });
function showToast(message: string) {
  toast.value.message = message;
  toast.value.show = true;
}

const namePerfil = ref<HTMLInputElement | null>(null);
function focusNamePerfil(): void {
  requestAnimationFrame(() => {
    setTimeout(() => namePerfil.value?.focus(),0)
  })
}

const editPerfil = ref({
  edit: false,
  icon: 'pencil',
  text: 'Editar'
});

const showModalPerfil = ref({
  show: false,
  tipo: 'agregar',
  img: '',
  username: ''

});

const itemPerfil = ref<Profile | null>(null);
function openModalPerfil(tipo: string, p: Profile | null): void {
  itemPerfil.value = p;
  if (tipo === "agregar") {
    showModalPerfil.value = {
      show: true,
      tipo: "agregar",
      img: '',
      username: '',
    }
  } else {
    showModalPerfil.value = {
      show: true,
      tipo: 'editar',
      img: '',
      username: p?.name_perfil ?? '',
    }
  }
}

function closeAddPerfil(): void {
  showModalPerfil.value.show = false;
  itemPerfil.value = null;
}
function editarPerfiles(): void {
  if (editPerfil.value.edit) {
    editPerfil.value = {
      edit: false,
      icon: 'pencil',
      text: 'Editar'
    }
  } else {
    editPerfil.value = {
      edit: true,
      icon: 'cross-small',
      text: 'Listo'
    }
  }
}

const Profiles = ref<Profile[]>([])
async function userProfiles(): Promise<void> {
  const resp = await userPerfiles();

  if (resp.status === "ok"){
    Profiles.value = resp.profiles ? resp.profiles : [];
  }

  if (resp.status === "error"){
    showToast(resp.message);
  }

}
function onSelectProfile(p: Profile): void {
  useProfileStore().select(p);
  router.replace('/home');
}

const bg = computed(() => colorFromTextStable(showModalPerfil.value.username));


async function agregarPerfil(): Promise<void> {
  const resp = await addPerfil(showModalPerfil.value.username);
  showToast(resp.message);
  Profiles.value = []
  await userProfiles();
  closeAddPerfil();
}
async function editarPerfil(): Promise<void> {
  const resp = await edittPerfil(itemPerfil.value?.profile_id ?? null,showModalPerfil.value.username);
  showToast(resp.message);
  Profiles.value = []
  await userProfiles();

  editPerfil.value = {
    edit: false,
    icon: 'pencil',
    text: 'Editar'
  }

  closeAddPerfil();
}
async function actionModal(): Promise<void> {
  if (showModalPerfil.value.tipo === "agregar") {
    await agregarPerfil();
  } else {
    await editarPerfil();
  }
}

async function doRefresh(ev: CustomEvent): Promise<void> {
  try {
    await userProfiles();
  } finally {
    await (ev.target as HTMLIonRefresherElement).complete();
  }
}


onMounted(() => {
  userProfiles();
})

</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">

      <ion-refresher slot="fixed" @ionRefresh="doRefresh" class="mt-8">
        <ion-refresher-content
            pulling-text="Desliza para recargar"
            refreshing-text="Actualizando..."
            refreshing-spinner="lines"
        />
      </ion-refresher>

      <div class="w-full h-full flex flex-col justify-center items-center gap-3 pt-6">
        <div class="w-full flex flex-col items-center relative">
          <div class="absolute overflow-hidden flex rounded-full p-1 right-0 ion-activatable not-dark:text-blue-400 dark:bg-[#2a2a2a]">
            <icon-custom icon="info" size="2xl"/>
            <ion-ripple-effect/>
          </div>
          <img class="w-24 h-24" src="/assets/logo.png" alt="">
          <p class="text-xl font-bold text-blue-400 dark:text-white">SELECCIONA UN PERFIL</p>
        </div>

        <!--Recargar metodo userProfiles con un reload como en las apps?-->
        <div class="w-full h-full flex-1 flex items-end overflow-y-auto min-h-0">
          <div class="w-full grid grid-cols-2 gap-2">
            <item-user v-for="(s,i) in Profiles" :key="i" :profile="s"
                       :edit="editPerfil.edit"
                       @edit="openModalPerfil('editar', s)"
                       @select="onSelectProfile(s)"/>
          </div>
        </div>

        <div class="w-full grid grid-cols-2 gap-2">
          <btn-primary fill="clear" size="large" class="w-full" @click="editarPerfiles">
            <div class="flex items-center gap-2">
              <icon-custom :icon="editPerfil.icon"/>
              {{ editPerfil.text }}
            </div>
          </btn-primary>

          <btn-primary shape="round">
            <div class="flex items-center gap-2" @click="openModalPerfil('agregar', null)">
              <icon-custom icon="add"/>
              Agregar
            </div>
          </btn-primary>

        </div>
      </div>

      <ion-modal v-model:is-open="showModalPerfil.show"
                 @didPresent="focusNamePerfil"
                 @didDismiss="closeAddPerfil">
        <div class="w-full flex flex-col gap-3 px-3 pt-3 pb-5">
          <div class="w-full flex items-center">
            <p class="w-full text-xl">{{ showModalPerfil.tipo === 'agregar' ? 'Agregar' : 'Editar'  }}</p>
            <div class="flex items-center relative overflow-hidden rounded-full ion-activatable p-1">
              <icon-custom icon="cross-small" @click="showModalPerfil.show = false"/>
              <ion-ripple-effect/>
            </div>
          </div>
          <div class="w-full flex flex-col items-center gap-4">
            <div class="w-fit h-fit relative overflow-hidden rounded-lg">
              <ion-avatar class="w-24 h-24 flex items-center justify-center rounded-full overflow-hidden"
                          :style="showModalPerfil.username === '' ? {background: '#2b7fff'} : {background: bg}"
              >
                <icon-custom icon="user" size="6xl" class="text-white"/>
              </ion-avatar>
            </div>

            <div class="rounded-full flex w-full px-3 items-center gap-2 dark:bg-[#2a2a2a] not-dark:bg-gray-200">
              <div class="flex items-center">
                <icon-custom icon="user" />
                <input ref="namePerfil" v-model="showModalPerfil.username" type="text" placeholder="Nombre perfil"
                       class="flex-1 w-full p-2 focus:outline-none focus:ring-0">
              </div>
            </div>


            <div class="w-full">
              <btn-primary size="large" shape="round" class="w-full" @click="actionModal">
                Aceptar
              </btn-primary>
            </div>
          </div>
        </div>
      </ion-modal>

      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          @didDismiss="toast.show = false"
          :message="toast.message"
      />

    </ion-content>
  </ion-page>
</template>

<style scoped>
ion-modal{
  --width: fit-content;
  --min-width: 300px;
  --height: fit-content;
  --border-radius: 10px;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}
</style>