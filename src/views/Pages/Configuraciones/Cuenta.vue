<script setup lang="ts">
import {IonPage, IonBackButton, IonRippleEffect, onIonViewDidEnter, IonToast, IonAvatar, IonModal} from "@ionic/vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import CardCustom from "@/views/Components/CardCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import {getUser, updateUser} from "@/api/Configuraciones";
import {User} from "@/interfaces/configs";
import {computed, ref} from "vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";

const initialLoading = ref(false);

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const statusUser = ref<User | null>();
async function obUser(): Promise<void> {
  const resp = await getUser();
  statusUser.value = resp.user ?? null;
}


const upUser = ref({
  show: false,
  tipo: 0,
  username: "",
  password: "",
});

const confirmePass = ref<string>('');

const namePerfil = ref<HTMLInputElement | null>(null);
function focusNamePerfil(): void {
  requestAnimationFrame(() => {
    setTimeout(() => namePerfil.value?.focus(),0)
  })
}

function openModal(t: number): void {
  upUser.value.show = true;
  upUser.value.tipo = t;
}
async function closeModal(): Promise<void> {
  upUser.value = {
    show: false,
    tipo: 0,
    username: "",
    password: "",
  }

  confirmePass.value = '';
  await obUser();
}

const passMatch = computed(() => upUser.value.password.length > 0
    && confirmePass.value.length > 0
    && upUser.value.password === confirmePass.value);
const passTouched = computed(() => confirmePass.value.length > 0);

async function actualizarUser(): Promise<void> {
  if (upUser.value.tipo == 2) {
    if (!passMatch.value) return showToast('Contraseñas no coinciden');
  }

  const resp = await updateUser(upUser.value.password,upUser.value.username);
  showToast(resp.message);

  if (resp.status == 'ok'){
    upUser.value.show = false;
  }

}


onIonViewDidEnter(async () => {
  initialLoading.value = true;
  try {
    await Promise.all([obUser()])
  } finally {
   initialLoading.value = false;
  }
})

</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <toolbar-custom class="px-2">
        <ion-title>Cuenta</ion-title>
        <template #start>
          <ion-back-button/>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
      <p class="text-lg font-bold">Detalles de la cuenta</p>

      <card-custom class="mt-3">
        <div class="p-3 border-b-1 border-b-gray-400 flex flex-col justify-center gap-3">
          <p class="text-lg font-bold leading-none">Email</p>
          <p class="leading-none">{{statusUser?.email}}</p>
        </div>
        <div class="p-3 border-b-1 border-b-gray-400 flex flex-col justify-center gap-3">
          <div class="w-full flex items-center justify-between">
            <p class="text-lg font-bold leading-none">Contraseña</p>
            <div
                class="relative w-8 h-8 overflow-hidden flex items-center justify-center mr-2 rounded-full ion-activatable"
                @click="openModal(2)"
            >
              <icon-custom icon="pencil" size="xl"/>
              <ion-ripple-effect/>
            </div>
          </div>
          <p>-------</p>
        </div>
        <div class="p-3 flex flex-col justify-center gap-3">
          <div class="w-full flex items-center justify-between">
            <p class="text-lg font-bold leading-none">Nombre</p>
            <div
                class="relative w-8 h-8 overflow-hidden flex items-center justify-center mr-2 rounded-full ion-activatable"
                @click="openModal(1)"
            >
              <icon-custom icon="pencil" size="xl"/>
              <ion-ripple-effect/>
            </div>
          </div>
          <p>{{statusUser?.username}}</p>
        </div>
      </card-custom>



      <!-- Toast -->
      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          :message="toast.message"
          @didDismiss="toast.show = false"
      />

      <ion-modal v-model:is-open="upUser.show"
                 @didPresent="focusNamePerfil"
                 :backdrop-dismiss="false"
                 @didDismiss="closeModal">

        <div class="w-full flex flex-col gap-3 px-3 pt-3 pb-5">
          <div class="w-full flex items-center">
            <p class="w-full text-xl">Actualizar datos</p>
            <div class="flex items-center relative overflow-hidden rounded-full ion-activatable p-1">
              <icon-custom icon="cross-small" @click="upUser.show = false"/>
              <ion-ripple-effect/>
            </div>
          </div>
          <div class="w-full flex flex-col items-center gap-4">

            <div class="rounded-full flex w-full px-3 items-center gap-2 dark:bg-[#2a2a2a] not-dark:bg-gray-200">
              <div class="flex items-center">
                <icon-custom :icon="upUser.tipo == 1 ? 'user' : 'lock'" />
                <input v-if="upUser.tipo == 1" ref="namePerfil" v-model="upUser.username" type="text" placeholder="Nombre perfil"
                       class="flex-1 w-full p-2 focus:outline-none focus:ring-0">
                <input v-else-if="upUser.tipo == 2" ref="namePerfil" v-model="upUser.password" type="text" placeholder="Nueva contraseña"
                       class="flex-1 w-full p-2 focus:outline-none focus:ring-0">
              </div>
            </div>

            <div v-if="upUser.tipo == 2" class="rounded-full flex w-full px-3 items-center gap-2 dark:bg-[#2a2a2a] not-dark:bg-gray-200">
              <div class="flex items-center">
                <icon-custom icon="lock" />
                <div class="w-full flex items-center">
                  <input v-model="confirmePass" type="password" placeholder="Confirme nueva contraseña"
                         class="flex-1 w-full p-2 focus:outline-none focus:ring-0">
                  <icon-custom v-if="passTouched && !passMatch" icon="cross-circle" size="xl" class="bg-red-600 rounded-full text-white p-1"/>
                  <icon-custom v-if="passTouched && passMatch" icon="check-circle" size="xl" class="bg-green-600 rounded-full text-white p-1"/>
                </div>
              </div>
            </div>


            <div class="w-full">
              <btn-primary size="large" shape="round" class="w-full" @click="actualizarUser">
                Aceptar
              </btn-primary>
            </div>
          </div>
        </div>
      </ion-modal>

      <loader-normal :open="initialLoading"/>
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