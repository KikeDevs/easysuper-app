<script setup lang="ts">
import {
  IonPage, IonAvatar, IonHeader, IonTitle, IonContent,
  IonToast, IonRippleEffect
} from "@ionic/vue";
import { getSaludo } from "@/utils/saludo";
import { useRouter } from "vue-router";
import {computed, ref} from "vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import InputContainer from "@/views/Components/InputContainer.vue";
import InputCustom from "@/views/Components/InputCustom.vue";
import CardCustom from "@/views/Components/CardCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import {useProfileStore} from "@/stores/profile";
import {colorFromTextStable} from "@/utils/colorFromText";
import ModalIniciarCompra from "@/views/Pages/Compras/ModalIniciarCompra.vue";

const saludo = getSaludo();
const router = useRouter();

const buscar = ref('');

function goConfigs(): void { router.push('configs') }
function goListas(): void { router.push('listas'); }
function goOfertas(): void { router.push('ofertas') }

// Toast
const showToast = ref({ show: false, message: "", color: "danger" })
function openToast(message: string, color: string = 'danger'): void {
  showToast.value.show = true
  showToast.value.message = message
  showToast.value.color = color
}

const bg = computed(() => colorFromTextStable(useProfileStore().selected?.name_perfil ?? ''));

const modalIniciar = ref<boolean>(false);
function closeModal(): void {
  modalIniciar.value = false;
}

</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border" id="header">
      <toolbar-custom class="px-3 md-toolbar padding-bottom">
        <ion-title>
          <div class="flex items-center gap-0.5">
            <img class="w-9 h-9" src="/assets/logo.png" alt="logo"/>
            <p class="font-bold not-dark:text-blue-500">EasySuper</p>
          </div>
        </ion-title>
        <template #end>
          <div class="relative w-8 h-8 overflow-hidden flex items-center justify-center mr-2 rounded-full ion-activatable">
            <icon-custom icon="marker" size="xl"/>
            <ion-ripple-effect/>
          </div>

          <ion-avatar class="w-8 h-8 flex items-center justify-center" @click="goConfigs" :style="{background: bg}">
            <icon-custom icon="user" size="xl" class="text-white"/>
          </ion-avatar>
        </template>
      </toolbar-custom>
    </ion-header>

    <!-- IMPORTANTE: dejamos scroll-y=false y hacemos scroll en la lista -->
    <ion-content ref="contentRef" :fullscreen="true" :scroll-y="false" class="ion-padding">
      <div class="w-full h-full flex flex-col gap-5">

        <input-container class="not-dark:border-2 not-dark:border-blue-400">
          <input-custom
              v-model="buscar"
              icon_primary="search"
              placeholder="Buscar"
              :icon_secondary="buscar !== '' ? 'cross-small':''"
              @click="buscar = '';"
              @update:modelValue=""
              class="not-dark:text-blue-500"
          />
        </input-container>

        <!-- Portada -->
        <div class="flex-1 w-full h-full flex flex-col gap-5 justify-center">
          <div>
            <h4 class="tracking-wide">¡Hola <span class="font-bold text-blue-600 dark:text-white">{{useProfileStore().selected?.name_perfil}}</span>!</h4>
            <p>{{saludo}}</p>
          </div>
          <card-custom class="h-40 not-dark:bg-gray-50 relative" :ripple="true" @click="goListas">
            <div class="absolute inset-0">
              <img class="w-full h-full" src="/assets/images/home/Mis-Listas-2.png">
            </div>
            <div class="px-5 py-5 flex flex-col justify-center h-full not-dark:text-fuchsia-800">
              <p class="text-4xl font-bold">Mis listas</p>
              <p class="w-3/5 leading-4 text-sm">Gestionar tus listas y agregar productos</p>
            </div>
          </card-custom>
          <card-custom class="h-24 bg-blue-400 text-white dark:bg-blue-400 relative"
                       :ripple="true"
                       @click="() => modalIniciar = true"
          >
            <div class="absolute inset-0">
              <img src="/assets/images/home/Iniciar-Compra-2.png">
            </div>
            <div class="py-3 px-5 flex flex-col w-full h-full justify-center">
              <p>Iniciar</p>
              <p class="text-3xl tracking-wide font-bold">COMPRA</p>
            </div>
          </card-custom>
          <card-custom class="h-24 bg-fuchsia-700 text-white dark:bg-fuchsia-700 relative" :ripple="true" @click="goOfertas">
            <div class="py-3 px-5 flex flex-col justify-center h-full">
              <p class="text-3xl font-bold tracking-wide">OFERTAS</p>
            </div>
            <div class="absolute inset-0">
              <img src="/assets/images/home/Ofertas-2.png" alt="">
            </div>
          </card-custom>
        </div>

      </div>

      <modal-iniciar-compra
          v-model:is-open="modalIniciar"
          @close="closeModal"
      />

      <ion-toast
          :is-open="showToast.show"
          :message="showToast.message"
          :color="showToast.color"
          :duration="3000"
          position="bottom"
          position-anchor="header"
          @didDismiss="showToast.show = false"
      />
    </ion-content>
  </ion-page>
</template>

