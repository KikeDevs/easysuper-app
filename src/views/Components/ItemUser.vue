<template>
  <div class="w-full h-full flex flex-col items-center justify-center gap-1">
    <ion-avatar
        class="ion-activatable overflow-hidden relative w-24 h-24 flex items-center justify-center not-dark:shadow-lg"
        :style="{ background: bg }"
        @click="onAvatarClick"
    >
      <icon-custom icon="user" size="6xl" class="text-white" />

      <!-- Overlay editar -->
      <div
          v-if="edit"
          class="absolute inset-0 flex justify-center items-center bg-black/60"
          @click.stop="emit('edit')"
      >
        <i class="fi fi-rr-pencil flex text-3xl text-white" />
      </div>

      <ion-ripple-effect />
    </ion-avatar>

    <p class="text-sm">{{ profile.name_perfil }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonAvatar, IonRippleEffect } from "@ionic/vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import type { Profile } from "@/interfaces/types";
import { computed } from "vue";
import { colorFromTextStable } from "@/utils/colorFromText";

const props = defineProps<{ profile: Profile; edit: boolean }>();

const emit = defineEmits<{
  (e: "select"): void;
  (e: "edit"): void;
}>();

const bg = computed(() => colorFromTextStable(props.profile.name_perfil));

function onAvatarClick() {
  if (props.edit) return;        // si está en modo editar, no seleccionar
  emit("select");
}
</script>
