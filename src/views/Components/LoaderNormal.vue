<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount } from "vue";

const props = withDefaults(defineProps<{
  open: boolean;
  color?: string;
  /** Cerrar tocando el fondo */
  backdropClose?: boolean;
  /** Blur del fondo en px */
  blur?: number;
}>(), {
  color: "#5f2da9",
  backdropClose: false,
  blur: 10
});

const emit = defineEmits<{ (e: "close"): void }>();

const lockBody = () => document?.body?.classList?.add("overflow-hidden");
const unlockBody = () => document?.body?.classList?.remove("overflow-hidden");

onMounted(() => { if (props.open) lockBody(); });
onBeforeUnmount(() => unlockBody());
watch(() => props.open, (v) => v ? lockBody() : unlockBody());

const cardStyle = computed(() => ({ borderColor: props.color }));
const backdropStyle = computed(() => ({ backdropFilter: `blur(${props.blur}px)` }));

function onBackdropClick() {
  if (props.backdropClose) emit("close");
}
</script>

<template>
  <teleport to="body">
    <Transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
      <div
          v-if="open"
          class="fixed inset-0 z-[9999] flex items-center justify-center"
          role="alertdialog"
          aria-live="assertive"
          aria-busy="true"
      >
        <!-- Backdrop (oscurecido + blur) -->
        <div
            class="absolute inset-0 bg-black/20 dark:bg-black/30"
            :style="backdropStyle"
            @click="onBackdropClick"
        />

        <!-- Tarjeta -->
        <div
            class="relative py-3 px-4 rounded-xl w-fit max-w-[90vw] bg-white/90 dark:bg-[#2a2a2a] shadow-2xl backdrop-blur-md"
            :style="cardStyle"
        >
          <div class="flex items-center gap-4">
            <!-- Spinner -->
            <svg class="w-8 h-8 shrink-0" viewBox="0 0 50 50" fill="none" aria-hidden="true">
              <!-- aro base -->
              <circle
                  cx="25" cy="25" r="20"
                  stroke="currentColor" stroke-width="6"
                  class="text-neutral-900/20 dark:text-white/30"
              />
              <!-- segmento activo -->
              <circle
                  cx="25" cy="25" r="20"
                  stroke="currentColor" stroke-width="6" stroke-linecap="round"
                  stroke-dasharray="100" stroke-dashoffset="60"
                  class="animate-spin-smooth-origin text-blue-500 dark:text-white"
              />
            </svg>
          </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<style>
/* Animación del segmento (rotación suave). Tailwind no trae esta keyframe por defecto. */
@keyframes spin-smooth {
  to { transform: rotate(360deg); }
}
.animate-spin-smooth-origin {
  transform-origin: 50% 50%;
  animation: spin-smooth 1s linear infinite;
}
</style>
