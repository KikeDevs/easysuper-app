<script setup lang="ts">
import {
  IonBackButton, IonHeader, IonTitle, IonPage,
  IonContent, onIonViewDidEnter, IonToast, IonRefresherContent, IonRefresher
} from "@ionic/vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import {ref} from "vue";
import {useUiStore} from "@/stores/statusbar";
import {getBrandsSuper} from "@/api/Productos";
import {BrandSuper} from "@/interfaces/brands";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";
import AvatarPerfil from "@/views/Components/AvatarPerfil.vue";
import {Promo} from "@/interfaces/promos";
import {getPromos} from "@/api/Promociones";

const props = defineProps<{
  googleId: string;
}>();

const initLoading = ref(false);
const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const ui = useUiStore();

const brandsSupers = ref<BrandSuper[]>([]);
const selectedBrandSuper = ref<number>(0);
async function marcasSuper(): Promise<void> {
  const resp = await getBrandsSuper();
  brandsSupers.value = resp.brands_super ?? [];
  selectedBrandSuper.value = brandsSupers.value[0].brand_id ?? 0;
}

const allPromos = ref<Promo[]>([]);
const espPromos = ref<Promo[]>([]);
async function loadPromos(): Promise<void> {
  allPromos.value = [];espPromos.value = [];
  const resp = await getPromos(selectedBrandSuper.value, props.googleId);
  allPromos.value = resp.all_promos ?? [];
  espPromos.value = resp.esp_promos ?? [];
  //showToast(resp.message)
}

async function selectBrandSuper(id: number): Promise<void> {
  selectedBrandSuper.value = id;
  await loadPromos();
}

function urlPromos(img_promo: string): string {
  const BASE = 'https://darkgrey-jaguar-767398.hostingersite.com/';
  const CARP = 'ofertas/';

  const brand = brandsSupers.value.find(b => b.brand_id === selectedBrandSuper.value);
  const brandSeg = brand ? `${encodeURIComponent(brand.name_brand)}/` : '';

  return `${BASE}${CARP}${brandSeg}${encodeURIComponent(img_promo)}`;
}
async function doRefresh(ev: CustomEvent): Promise<void> {
  try {
    await loadPromos();
  } finally {
    await (ev.target as HTMLIonRefresherElement).complete();
  }
}

onIonViewDidEnter(async () => {
  initLoading.value = true;
  try {
    await Promise.all([
        ui.refresh(),
        marcasSuper(),
        loadPromos()
    ]);
  } finally {
    initLoading.value = false;
  }
})

</script>

<template>
  <ion-page>
  <!-- Header -->
  <ion-header :translucent="true" class="ion-no-border">
    <toolbar-custom class="px-2" :style="{paddingTop: ui.toolbarPaddingTop + 'px'}">
      <ion-title>Ofertas</ion-title>

      <template #start>
        <ion-back-button size="small" />
      </template>

      <template #end>
        <avatar-perfil/>
      </template>
    </toolbar-custom>
    <toolbar-custom class="px-2">
      <div class="w-full overflow-x-auto flex flex-nowrap gap-2 overflow-y-hidden">
        <div v-for="b in brandsSupers"
             class="rounded-full px-2 py-1 text-base w-fit whitespace-nowrap"
             :class="[selectedBrandSuper == b.brand_id ? 'bg-blue-500 dark:bg-gray-800 text-white' : 'bg-gray-300 dark:bg-[#2a2a2a]']"
             @click="selectBrandSuper(b.brand_id)"
        >
          <p class="w-fit">{{b.name_brand}}</p>
        </div>
      </div>
    </toolbar-custom>
  </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">

      <ion-refresher slot="fixed" @ionRefresh="doRefresh">
        <ion-refresher-content
            pulling-text="Desliza para recargar"
            refreshing-text="Actualizando..."
            refreshing-spinner="lines"
        />
      </ion-refresher>

      <div v-if="allPromos.length == 0 && espPromos.length == 0" class="w-full h-full flex items-center justify-center">
        <p class="text-gray-400">No hay ofertas agregadas.</p>
      </div>

      <TransitionGroup
          name="list-fade"
          tag="div"
          appear
          class="w-full flex flex-col gap-5"
      >
        <img v-for="a in allPromos" :key="`all-${a.promo_id}`"
             :src="urlPromos(a.img_promo)" :alt="a.img_promo" loading="lazy"
             class="shadow-md rounded-4xl"/>
        <img v-for="e in espPromos" :key="`esp-${e.promo_id}`"
             :src="urlPromos(e.img_promo)" :alt="e.img_promo" loading="lazy"
             class="shadow-md rounded-4xl"/>
      </TransitionGroup>


      <loader-normal :open="initLoading"/>

      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          :message="toast.message"
          @didDismiss="toast.show = false"
      />
    </ion-content>
  </ion-page>
</template>
<style scoped>
</style>