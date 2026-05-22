<script setup lang="ts">
import { IonModal } from "@ionic/vue";
import { computed, ref, watch } from "vue";

import IconCustom from "@/views/Components/IconCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import BtnSecondary from "@/views/Components/BtnSecondary.vue";
import LoaderNormal from "@/views/Components/LoaderNormal.vue";

import { updateList } from "@/api/Lists";

const props = defineProps<{
  isOpen: boolean;
  listId: number;
  nameList: string;
}>();

const emit = defineEmits<{
  (e: "update:isOpen", v: boolean): void;
  (e: "actualizar"): void;
}>();

const open = computed({
  get: () => props.isOpen,
  set: (v: boolean) => emit("update:isOpen", v),
});

const saving = ref(false);
const name = ref("");

watch(
    () => props.isOpen,
    (v) => {
      if (v) {
        name.value = (props.nameList ?? "").trim();
      }
    }
);

function close(): void {
  open.value = false;
}

const canSave = computed(() => name.value.trim().length > 0);

async function save(): Promise<void> {
  if (saving.value) return;
  if (!props.listId || props.listId <= 0) return;
  if (!canSave.value) return;

  saving.value = true;
  try {
    const resp = await updateList(props.listId, name.value.trim());

    if (resp?.status !== "ok") {
      // Aquí no uses console.log; si quieres notificación visual,
      // puedes emitir un evento "alerta" o usar tu mini-dialog global.
      // Como no lo pasaste, solo cierro o dejo abierto según prefieras.
      // Yo lo dejo abierto:
      return;
    }

    close();
    emit("actualizar");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <ion-modal
      :is-open="open"
      :backdrop-dismiss="!saving"
      :show-backdrop="true"
      @didDismiss="close"
      class="modal-edit"
  >
    <div class="card">
      <!-- Header -->
      <div class="header">
        <div class="left">
          <p class="title">Editar lista</p>
          <p class="sub">Cambia el nombre de tu lista.</p>
        </div>

        <button class="close" :disabled="saving" @click="close">
          <icon-custom icon="cross" size="xl" />
        </button>
      </div>

      <div class="divider" />

      <!-- Body -->
      <div class="body">
        <label class="label">Nombre</label>
        <input
            v-model="name"
            type="text"
            class="input"
            placeholder="Ej. Súper de la semana"
            :disabled="saving"
            maxlength="40"
        />

        <div class="actions">
          <btn-secondary class="w-full" :disabled="saving" @click="close">
            Cancelar
          </btn-secondary>

          <btn-primary class="w-full" shape="round" :disabled="saving || !canSave" @click="save">
            <div class="flex items-center justify-center gap-2">
              <icon-custom icon="check" />
              <span>Guardar</span>
            </div>
          </btn-primary>
        </div>
      </div>
    </div>

    <loader-normal :open="saving" />
  </ion-modal>
</template>

<style scoped>
.modal-edit {
  --width: 92%;
  --max-width: 420px;
  --height: auto;
  --border-radius: 22px;
  --backdrop-opacity: 0.35;
}

.card {
  padding: 14px 14px 16px 14px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title {
  margin: 0;
  font-weight: 800;
  font-size: 16px;
}

.sub {
  margin: 0;
  font-size: 12px;
  opacity: 0.65;
}

.close {
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 999px;
}

.divider {
  height: 1px;
  background: rgba(0,0,0,0.06);
  margin: 12px 0;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.8;
}

.input {
  width: 100%;
  border-radius: 14px;
  padding: 12px 12px;
  border: 1px solid rgba(0,0,0,0.12);
  outline: none;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 6px;
}
</style>
