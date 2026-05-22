<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonModal,
  IonPage,
  IonRippleEffect,
  IonTitle,
  IonToast,
} from "@ionic/vue";
import {computed, ref, watch} from "vue";

import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";
import {Departamento} from "@/interfaces/types";
import {useUiStore} from "@/stores/statusbar";
import {useProfileStore} from "@/stores/profile";
import {ServicioGeneral} from "@/services/services";
// import { addProductUser } from "@/api/Productos";

const props = defineProps<{
  categorias: Departamento[],
}>();

const isOpen = defineModel<boolean>("is-open", { default: false });

const ui = useUiStore();
const perfilId = useProfileStore().selected?.profile_id ?? 0;

const loading = ref(false);
const toast = ref({ show: false, message: "" });

const categoriaSelect = ref<Departamento | null>(null);
const showCategorias = ref(false);
const productName = ref("");

const canSave = computed(() =>
    categoriaSelect.value !== null && productName.value.trim().length >= 2
);

function showToast(message: string): void {
  toast.value = { show: true, message };
}

function resetForm(): void {
  categoriaSelect.value = null;
  showCategorias.value = false;
  productName.value = "";
}

function closeModal(): void {
  isOpen.value = false;
}

function toggleCategorias(): void {
  showCategorias.value = !showCategorias.value;
}

function selectCategoria(c: Departamento): void {
  categoriaSelect.value = c;
  showCategorias.value = false;
}

async function guardarProducto(): Promise<void> {
  const nombre = productName.value.trim();

  if (!categoriaSelect.value) {
    showToast("Selecciona una categoría.");
    return;
  }

  if (nombre.length < 2) {
    showToast("Escribe un nombre de producto válido.");
    return;
  }

  loading.value = true;

  try {
    const payload = {
      category_id: categoriaSelect.value.departament_id,
      product: nombre,
      profile_id: perfilId,
    };

    const resp = await ServicioGeneral('new-product', payload);

    if (resp.status === "ok") {
      showToast(resp.message);
      resetForm();
      isOpen.value = false;
    } else  {
      showToast(resp.message ?? "Error al guardar producto nuevo.");
    }

  } catch {
    showToast("No se pudo agregar el producto.");
  } finally {
    loading.value = false;
  }
}

watch(isOpen, (open) => {
  if (open) resetForm();
});
</script>

<template>
  <ion-modal v-model:is-open="isOpen">
    <ion-page>
      <ion-header class="ion-no-border">
        <toolbar-custom class="px-2" :style="{ paddingTop: ui.toolbarPaddingTop + 'px' }">
          <ion-title>Nuevo producto</ion-title>

          <template #start>
            <div
                class="flex p-1.5 rounded-full ion-activatable overflow-hidden relative"
                @click="closeModal"
            >
              <icon-custom icon="arrow-small-left" size="3xl" />
              <ion-ripple-effect />
            </div>
          </template>
        </toolbar-custom>
      </ion-header>

      <ion-content class="ion-padding">
        <div class="flex flex-col gap-4">
          <div>
            <p class="text-sm mb-2 text-gray-500 dark:text-gray-300">
              Categoría
            </p>

            <div
                class="w-full rounded-2xl border border-gray-300 dark:border-white/10 px-3 py-3 flex items-center justify-between"
                @click="toggleCategorias"
            >
              <p :class="[categoriaSelect ? '' : 'text-gray-400']">
                {{ categoriaSelect?.name_departament ?? "Selecciona una categoría" }}
              </p>
              <icon-custom icon="chevron-down" size="lg" />
            </div>

            <div
                v-if="showCategorias"
                class="mt-2 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            >
              <div
                  v-for="c in categorias"
                  :key="c.departament_id"
                  class="px-3 py-3 border-b last:border-b-0 border-gray-200 dark:border-white/10"
                  @click="selectCategoria(c)"
              >
                <p>{{ c.name_departament }}</p>
              </div>
            </div>
          </div>

          <div>
            <p class="text-sm mb-2 text-gray-500 dark:text-gray-300">
              Nombre del producto
            </p>

            <input
                v-model="productName"
                type="text"
                maxlength="100"
                placeholder="Ej. Coca Cola 600 ml"
                class="w-full rounded-2xl border border-gray-300 dark:border-white/10 px-3 py-3 bg-transparent focus:outline-none"
            />
          </div>

          <div class="pt-2">
            <btn-primary
                shape="round"
                size="large"
                class="w-full"
                :disabled="!canSave || loading"
                @click="guardarProducto"
            >
              <div class="flex items-center justify-center gap-2">
                <icon-custom icon="plus" />
                <p>Agregar producto</p>
              </div>
            </btn-primary>
          </div>
        </div>

        <ion-toast
            :is-open="toast.show"
            :duration="2500"
            :message="toast.message"
            position="middle"
            @didDismiss="toast.show = false"
        />

        <loader-normal :open="loading" />
      </ion-content>
    </ion-page>
  </ion-modal>
</template>