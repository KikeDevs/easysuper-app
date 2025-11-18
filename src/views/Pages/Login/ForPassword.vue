<script setup lang="ts">
import {IonBackButton, IonHeader, IonImg, IonPage, IonToast, onIonViewDidEnter} from "@ionic/vue";
import {computed, ref, watch} from "vue";

import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import {actualizarPassword, runPassReset, verificarCode} from "@/api/PassReset"; // aquí seguirías usando tu API
import {useRouter} from "vue-router";
import {useUiStore} from "@/stores/statusbar";

const router = useRouter();
const ui = useUiStore()

const email = ref<string>('');
const sendCode = ref(false);
const resetPassword = ref(false);


const loadingSendCode = ref(false);
const loadingResetPass = ref(false);
const step = computed(() => {
  if (!sendCode.value) return 1;           // Email
  if (sendCode.value && !resetPassword.value) return 2; // Código
  return 3;                                // Nueva contraseña
});

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const emailEl = ref<HTMLInputElement | null>(null);
function focusEmail(): void {
  requestAnimationFrame(() => {
    setTimeout(() => emailEl.value?.focus(), 300);
  });
}

function onEmailInput(ev: Event): void {
  const target = ev.target as HTMLInputElement;
  const clean = target.value.replace(/\s/g, '');
  email.value = clean;
  target.value = clean;
}

// ========= CÓDIGO 6 DÍGITOS =========
const DIGITS = 6;
const codeDigits = ref<string[]>(Array(DIGITS).fill(""));   // ['','','','','','']
const codeInputs = ref<(HTMLInputElement | null)[]>(Array(DIGITS).fill(null));

function setCodeInputRef(el: HTMLInputElement | null, index: number) {
  codeInputs.value[index] = el;
}

function focusDigit(index: number) {
  const el = codeInputs.value[index];
  if (el) {
    el.focus();
    el.select();
  }
}

function getFullCode(): string {
  return codeDigits.value.join("");
}


const lastCode = ref<string>('');
async function onCodeCompleted() {
  const code = getFullCode();
  if (code.length !== DIGITS) return;

  const resp = await verificarCode(email.value, code);
  if (resp.status == 'ok'){
    resetPassword.value = true;
    lastCode.value = code;
  }
  showToast(resp.message);
}

function onCodeInput(ev: Event, index: number) {
  const target = ev.target as HTMLInputElement;
  let value = target.value.replace(/\D/g, ""); // solo dígitos

  if (value.length > 1) {
    // Si pegaron más de un dígito, nos quedamos con el último
    value = value.slice(-1);
  }

  codeDigits.value[index] = value;
  target.value = value;

  if (value && index < DIGITS - 1) {
    // ir al siguiente input
    focusDigit(index + 1);
  }

  // Si es el último y todos los dígitos están llenos → enviar
  if (index === DIGITS - 1) {
    const full = getFullCode();
    if (full.length === DIGITS && full.match(/^\d{6}$/)) {
      onCodeCompleted();
    }
  }
}

function onCodeKeydown(ev: KeyboardEvent, index: number) {
  const target = ev.target as HTMLInputElement;

  if (ev.key === "Backspace") {
    if (!target.value && index > 0) {
      // Si está vacío y presionan backspace → ir al anterior
      focusDigit(index - 1);
    } else {
      // limpiar este dígito
      codeDigits.value[index] = "";
    }
  }
}

// Cuando se cambia a "introducir código", enfocamos el primer input
watch(sendCode, (val) => {
  if (val) {
    requestAnimationFrame(() => {
      setTimeout(() => focusDigit(0), 300);
    });
  }
});
const passInput = ref<HTMLInputElement | null>(null);

watch(resetPassword, (val) => {
  if (val) {
    requestAnimationFrame(() => {
      setTimeout(() => passInput.value?.focus(), 300);
    });
  }
});
// ========= ENVIAR CÓDIGO AL CORREO =========
async function enviarCode(): Promise<void> {
  if (!email.value) {
    showToast("Ingresa un correo válido.");
    return;
  }

  emailEl.value?.blur();

  loadingSendCode.value = true;
  const resp = await runPassReset(email.value);
  loadingSendCode.value = false;

  showToast(resp.message);
  if (resp.status == 'ok') sendCode.value = true;
}

async function resetPass(): Promise<void> {
  if (!passMatch.value) {
    showToast("Las contraseñas no coinciden.");
    return;
  }

  loadingResetPass.value = true;
  const resp = await actualizarPassword(email.value, newPassword.value, lastCode.value);
  loadingResetPass.value = false;

  showToast(resp.message);
  if (resp.status == 'ok') await router.push("/");
}


const newPassword = ref<string>('');
const confirmPass = ref('');
const verPassword = ref<boolean>(false);
const passMatch = computed(() => confirmPass.value.length > 0
    && newPassword.value === confirmPass.value);

const passTouched = computed(() => confirmPass.value.length > 0);

onIonViewDidEnter(async () => {
  await ui.refresh();
  focusEmail();
});
</script>
<template>
  <ion-page>
    <ion-header id="header" :translucent="true" class="ion-no-border">
      <toolbar-custom class="px-2" :style="{paddingTop: ui.toolbarPaddingTop + 'px'}">
        <template #start>
          <ion-back-button size="small" />
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <div class="flex flex-col items-center w-full h-full">
        <div class="flex flex-col items-center gap-3">
          <ion-img class="w-26 h-26" src="/assets/logo.png" alt="logo"/>
          <h1 class="not-dark:text-blue-400 text-3xl font-bold">RECUPERACIÓN</h1>
        </div>

        <transition name="step-fade">
          <div v-if="step === 1"
               key="step-email"
               class="w-full flex flex-col gap-4 mt-3">

            <p class="text-center">
              Ingrese el correo con el que te registraste para restablecer la contraseña
            </p>

            <div class="w-full flex items-center border rounded-full border-gray-300 dark:border-0 px-3 gap-2 shadow-md dark:shadow-none dark:bg-[#2a2a2a]">
              <icon-custom icon="envelope" />
              <input
                  ref="emailEl"
                  type="email"
                  placeholder="Ingrese email"
                  class="py-2 px-1 w-full focus:outline-none focus:ring-0"
                  @input="onEmailInput"
              >
            </div>

            <btn-primary
                size="large"
                shape="round"
                class="w-full mt-4"
                :disabled="loadingSendCode"
                @click="enviarCode"
            >
              <span v-if="!loadingSendCode">Enviar Código</span>
              <span v-else>Enviando...</span>
            </btn-primary>
          </div>
        </transition>

        <transition name="step-fade">
          <div v-if="step === 2"
               key="step-code"
               class="flex-1 w-full h-full flex flex-col gap-4 mt-3">
            <p class="text-center">Ingresa el código que llegó a tu correo.</p>

            <div class="w-full grid grid-cols-6 gap-2">
              <input
                  v-for="(digit, index) in codeDigits"
                  :key="index"
                  type="text"
                  inputmode="numeric"
                  pattern="\d*"
                  autocomplete="one-time-code"
                  maxlength="1"
                  class="py-2 px-1 text-2xl font-bold text-center rounded-lg border border-gray-300 dark:border-gray-600"
                  :value="digit"
                  :ref="el => setCodeInputRef(el as HTMLInputElement | null, index)"
                  @input="(ev) => onCodeInput(ev, index)"
                  @keydown="(ev) => onCodeKeydown(ev as KeyboardEvent, index)"
              />
            </div>
          </div>
        </transition>

        <transition name="step-fade">
          <div v-if="step === 3"
               key="step-pass"
               class="flex-1 w-full h-full flex flex-col gap-3 mt-3"
          >
            <p class="text-center">Restablece tu contraseña por favor.</p>

            <!-- Nueva contraseña -->
            <div class="w-full flex items-center border rounded-full border-gray-300 dark:border-0 px-3 gap-2 shadow-md dark:shadow-none dark:bg-[#2a2a2a]">
              <icon-custom icon="lock" />
              <input
                  ref="passInput"
                  :type="verPassword ? 'text' : 'password'"
                  placeholder="Nueva contraseña"
                  class="py-2 px-1 w-full focus:outline-none focus:ring-0"
                  v-model="newPassword"
              />

              <div class="relative p-1 ion-activatable overflow-y-hidden flex rounded-full" @click="verPassword = !verPassword">
                <icon-custom :icon="verPassword ? 'eye-crossed' : 'eye'" />
                <ion-ripple-effect />
              </div>
            </div>

            <!-- Confirmar contraseña -->
            <div class="w-full flex items-center border rounded-full border-gray-300 dark:border-0 px-3 gap-2 shadow-md dark:shadow-none dark:bg-[#2a2a2a]">
              <icon-custom icon="lock" />
              <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  class="py-2 px-1 w-full focus:outline-none focus:ring-0"
                  v-model="confirmPass"
              >
              <icon-custom
                  v-if="passTouched && !passMatch"
                  icon="cross-circle"
                  size="xl"
                  class="bg-red-600 rounded-full text-white p-1"
              />
              <icon-custom
                  v-if="passTouched && passMatch"
                  icon="check-circle"
                  size="xl"
                  class="bg-green-600 rounded-full text-white p-1"
              />
            </div>

            <div v-if="passTouched && !passMatch" class="w-full flex gap-1 justify-center">
              <p class="text-xs text-red-600 font-bold">Las contraseñas no coinciden</p>
            </div>

            <!-- En guardar contraseña -->
            <btn-primary
                size="large"
                shape="round"
                class="w-full"
                :disabled="loadingResetPass || !passMatch"
                @click="resetPass"
            >
              <span v-if="!loadingResetPass">Guardar Contraseña</span>
              <span v-else>Guardando...</span>
            </btn-primary>

          </div>
        </transition>

      </div>

      <ion-toast
          :is-open="toast.show"
          :duration="5000"
          position="top"
          position-anchor="header"
          @didDismiss="toast.show = false"
          :message="toast.message"
      />
    </ion-content>
  </ion-page>
</template>
<style scoped>
.step-fade-enter-active,
.step-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.step-fade-enter-from,
.step-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.step-fade-enter-to,
.step-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

</style>