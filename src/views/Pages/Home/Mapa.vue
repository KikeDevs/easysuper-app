<script setup lang="ts">
import {
  IonPage, IonContent, IonHeader, IonBackButton, IonTitle,
  onIonViewDidEnter, onIonViewWillLeave, IonToast, IonModal
} from "@ionic/vue";
import {computed, ref} from "vue";
import {GoogleMap} from "@capacitor/google-maps";
import { Geolocation } from "@capacitor/geolocation";
import { useUiStore } from "@/stores/statusbar";
import {fetchNearbySupers, SuperPlace} from "@/api/Map";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import {Capacitor} from "@capacitor/core";
import IconCustom from "@/views/Components/IconCustom.vue";
import {getPromosMap} from "@/api/Promociones";
import {Promo} from "@/interfaces/promos";
import BtnSecondary from "@/views/Components/BtnSecondary.vue";
import {useRouter} from "vue-router";


const GMAPS_KEY = Capacitor.getPlatform() === "ios"
    ? import.meta.env.VITE_GMAPS_IOS_KEY
    : import.meta.env.VITE_GMAPS_ANDROID_KEY;

const initialLoading = ref(false);
const ui = useUiStore();
const router = useRouter();

const addButtonStyle = computed(() => ({
  bottom: (16 + ui.footerPaddingBottom) + "px", // 16px (bottom-4) + safe-area
}));

const openOfertas = ref(false);
function openModal(){
  openOfertas.value = true;
}

const superSelect = ref<SuperPlace>();

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const prevStyles = { bodyBg: "", rootBg: "", ionBgVar: "", ionAppBg: "" };

function makeBodyTransparent() {
  prevStyles.bodyBg  = document.body.style.background || "";
  prevStyles.rootBg  = document.documentElement.style.background || "";
  prevStyles.ionBgVar = getComputedStyle(document.documentElement).getPropertyValue("--ion-background-color");
  const ionApp = document.querySelector("ion-app") as HTMLElement | null;
  prevStyles.ionAppBg = ionApp?.style.background || "";
  document.body.style.background = "transparent";
  document.documentElement.style.background = "transparent";
  document.documentElement.style.setProperty("--ion-background-color", "transparent");
  if (ionApp) ionApp.style.background = "transparent";
}
function restoreBodyBackground() {
  document.body.style.background = prevStyles.bodyBg;
  document.documentElement.style.background = prevStyles.rootBg;
  document.documentElement.style.setProperty("--ion-background-color", prevStyles.ionBgVar || "");
  const ionApp = document.querySelector("ion-app") as HTMLElement | null;
  if (ionApp) ionApp.style.background = prevStyles.ionAppBg;
}

const mapEl = ref<HTMLElement | null>(null);
let map: GoogleMap | null = null;
let markerIds: string[] = [];

function withTimeout<T>(p: Promise<T>, ms = 10000, label = "timeout"): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    p.then(v => { clearTimeout(t); resolve(v); })
        .catch(e => { clearTimeout(t); reject(e); });
  });
}


async function createGoogleMap(): Promise<void> {
  // Asegura que el contenedor existe y tiene altura visible
  if (!mapEl.value) { showToast("Contenedor de mapa no está listo."); throw new Error("mapEl null"); }
  const rect = mapEl.value.getBoundingClientRect();
  if (rect.height < 50) {
    // fuerza una altura mínima por si estilos no entraron todavía
    mapEl.value.style.minHeight = "300px";
  }

  await Geolocation.requestPermissions().catch(()=>{});

  // Fallback CDMX si geoloc falla/está lenta
  let center = { lat: 19.4326, lng: -99.1332 };
  try {
    const pos = await withTimeout(
        Geolocation.getCurrentPosition({ enableHighAccuracy: true }),
        8000,
        "geo timeout"
    );
    center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch (e) {
    console.warn("Geoloc fallback:", e);
    showToast("Usando ubicación por defecto.");
  }

  try {
    map = await withTimeout(GoogleMap.create({
      id: "easy-super-map",
      element: mapEl.value!,
      apiKey: GMAPS_KEY,
      config: {
        center,
        zoom: 14,
        mapTypeId: "ROADMAP",
        styles: [
          { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
          { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        ],
      },
    }), 10000, "map create timeout");
  } catch (e:any) {
    console.error("GoogleMap.create failed:", e);
    showToast("No se pudo crear el mapa.");
    throw e;
  }

  try {
    await map.setCamera({ coordinate: center, zoom: 15, animate: true });
    await map.enableCurrentLocation(true).catch(()=>{});
  } catch (e) {
    console.warn("Camera/currentLocation:", e);
  }

  await attachCameraLimits(center);

  const supers = await fetchNearbySupers(center,3000, 15);

  const markerById = new Map<string,SuperPlace>();

  for (const s of supers) {

    if (!superSelect.value?.id) superSelect.value = s;

    const markerId = await map.addMarker({
      coordinate: {
        lat: s.lat,
        lng: s.lng,
      },
     title: s.title,
     iconUrl: s.icon,
     iconSize: {
       width: 40,
       height: 40,
     }
    });

    markerById.set(markerId,s);

  }

  await map.setOnMarkerClickListener(async (event) => {
    const clicked = markerById.get(event.markerId)
    if (!clicked) return;
    superSelect.value = clicked;
    await ofertasMap(clicked.id,clicked.brand);
    await map?.setCamera({
      coordinate: {
        lat: clicked.lat,
        lng: clicked.lng,
      },
      zoom: 16,
    });

  });

}

const RADIUS_KM = 4;
const EARTH_KM_PER_DEG = 111.32;

interface LatLng {
  lat: number;
  lng: number;
}

// Distancia aprox entre dos puntos en km (suficiente para radios pequeños)
function distanceInKm(a: LatLng, b: LatLng): number {
  const latCenterRad = (a.lat * Math.PI) / 180;

  const dLat = b.lat - a.lat;
  const dLng = (b.lng - a.lng) * Math.cos(latCenterRad);

  const dy = dLat * EARTH_KM_PER_DEG;
  const dx = dLng * EARTH_KM_PER_DEG;

  return Math.sqrt(dx * dx + dy * dy);
}

// Si target está fuera del radio, lo trae al borde del círculo
function clampToRadius(center: LatLng, target: LatLng, maxKm: number): LatLng {
  const latCenterRad = (center.lat * Math.PI) / 180;

  const dLat = target.lat - center.lat;
  const dLng = (target.lng - center.lng) * Math.cos(latCenterRad);

  const dy = dLat * EARTH_KM_PER_DEG;
  const dx = dLng * EARTH_KM_PER_DEG;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (!dist || dist <= maxKm) {
    return target; // ya está dentro
  }

  const scale = maxKm / dist;
  const clampedDx = dx * scale;
  const clampedDy = dy * scale;

  const newLat = center.lat + clampedDy / EARTH_KM_PER_DEG;
  const newLng = center.lng + clampedDx / (EARTH_KM_PER_DEG * Math.cos(latCenterRad));

  return { lat: newLat, lng: newLng };
}

let adjustingCamera = false; // fuera de la función, para evitar loops

async function attachCameraLimits(center: LatLng): Promise<void> {
  const MIN_ZOOM = 13;
  const MAX_ZOOM = 16;

  await map?.setOnCameraIdleListener(async (camera) => {
    if (adjustingCamera) return;

    let zoom = camera.zoom ?? 15;

    // Posición actual de la cámara
    let target: LatLng = {
      lat: camera.latitude,
      lng: camera.longitude,
    };

    let needAdjust = false;

    // 1) Limitar radio a 10km
    const dist = distanceInKm(center, target);
    if (dist > RADIUS_KM) {
      target = clampToRadius(center, target, RADIUS_KM);
      needAdjust = true;
    }

    // 2) Limitar zoom
    if (zoom < MIN_ZOOM) {
      zoom = MIN_ZOOM;
      needAdjust = true;
    } else if (zoom > MAX_ZOOM) {
      zoom = MAX_ZOOM;
      needAdjust = true;
    }

    if (!needAdjust) return;

    adjustingCamera = true;
    try {
      await map?.setCamera({
        coordinate: target,
        zoom,
        animate: true, // sin animación para que no parpadee
      });
    } finally {
      adjustingCamera = false;
    }
  });
}

const allPromos = ref<Promo[]>([]);
const espPromos = ref<Promo[]>([]);
async function ofertasMap(id:string,marca:string): Promise<void> {
  allPromos.value = []; espPromos.value = [];
  const resp = await getPromosMap(id,marca);
  allPromos.value = resp.all_promos ?? [];
  espPromos.value = resp.esp_promos ?? [];
  if (resp.status == 'ok' && (allPromos.value.length > 0 || espPromos.value.length > 0)) openOfertas.value = true;
  else showToast('No hay ofertas agregadas.')
}
function urlPromos(img_promo: string): string {
  const BASE = 'https://darkgrey-jaguar-767398.hostingersite.com/';
  const CARP = 'ofertas/';

  const brand = superSelect?.value;
  const brandSeg = brand ? `${encodeURIComponent(brand.brand)}/` : '';

  return `${BASE}${CARP}${brandSeg}${encodeURIComponent(img_promo)}`;
}

function openOfertasGoogle(): void {
  router.push({
    name: 'Ofertas',
    params: {
      googleId: superSelect.value?.id
    }
  })
}

onIonViewDidEnter(async () => {
  initialLoading.value = true;
  try {
    makeBodyTransparent();
    await ui.refresh();
    await createGoogleMap();
  } catch (e) {
    console.error(e);
    showToast("No se pudo inicializar el mapa.");
  } finally {
    initialLoading.value = false;
  }
});
onIonViewWillLeave(async () => {
  try {
    if (map && markerIds.length) {
      await map.removeMarkers(markerIds);
      markerIds = [];
    }
  } catch {}
  if (map) { await map.destroy(); map = null; }
  restoreBodyBackground();
});

</script>


<template>
  <ion-page class="mapa">
    <ion-header class="ion-no-border">
      <toolbar-custom class="px-2" :style="{ paddingTop: ui.toolbarPaddingTop + 'px' }">
        <ion-title>Supermercados</ion-title>
        <template #start>
          <ion-back-button />
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-no-padding mapa" :fullscreen="true">
      <!-- MAPA a pantalla completa -->
      <capacitor-google-map ref="mapEl" class="map-box" />

      <!-- Loaders / Toasts -->
      <loader-normal :open="initialLoading" />
      <ion-toast
          :is-open="toast.show"
          :duration="3000"
          :message="toast.message"
          @didDismiss="toast.show = false"
      />

      <ion-modal
          v-model:is-open="openOfertas"
          @didDismiss="openOfertas = false"
          :initial-breakpoint="0.65"
      >
        <ion-header class="ion-no-border">
          <toolbar-custom class="px-2">
            <ion-title>{{superSelect?.title}}</ion-title>
          </toolbar-custom>
        </ion-header>
        <ion-content :fullscreen="true">
          <div class="w-full h-full flex flex-col items-start gap-2 bg-[#f5f5f5] dark:bg-[#121212] p-5">
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
            <btn-secondary class="w-full mt-3" @click="openOfertasGoogle">
              Ver mas
            </btn-secondary>
          </div>
        </ion-content>
      </ion-modal>

    </ion-content>

    <div v-if="espPromos.length > 0 || allPromos.length > 0" class="fixed inset-x-0 w-full flex justify-center pointer-events-none" :style="addButtonStyle">
      <div
          class="text-white flex p-4 shadow-md rounded-full bg-blue-400 ion-activatable overflow-hidden pointer-events-auto"
          @click="openModal"
      >
        <icon-custom icon="angle-small-up" size="2xl"/>
        <ion-ripple-effect/>
      </div>
    </div>

  </ion-page>
</template>


<style scoped>
ion-page.mapa { background: transparent !important; position: relative; }
ion-content.mapa { --background: transparent !important; }

.map-box {
  position: absolute;
  inset: 0;
  display: block;
  background: transparent !important;
}

ion-modal {
  --border-radius: 16px;
}

</style>

