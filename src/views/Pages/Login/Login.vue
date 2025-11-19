<script setup lang="ts">
import {
  IonPage, IonContent, IonImg, IonBackButton, IonButton,
  IonToast, isPlatform, useIonRouter, IonHeader, onIonViewDidEnter
} from "@ionic/vue";
import InputCustom from "@/views/Components/InputCustom.vue";
import { computed, ref } from "vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import BtnSecondary from "@/views/Components/BtnSecondary.vue";
import InputContainer from "@/views/Components/InputContainer.vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import {loginWithGoogle, logUser} from "@/api/Login";
import { useAuthStore } from "@/stores/auth";
import {useUiStore} from "@/stores/statusbar";

const isIos = computed(() => isPlatform('ios'));
const ionRouter = useIonRouter();
const ui = useUiStore();

const toast = ref({ show: false, message: "" });
const showToast = (message: string) => { toast.value = { show: true, message }; };

const User = ref({
  email: "",
  password: "",
});

const inputPass = ref({
  tipo: "password", // oculto por defecto
  eye: false,       // false = oculto, true = visible
});

function verPass(): void {
  inputPass.value.eye = !inputPass.value.eye;
  inputPass.value.tipo = inputPass.value.eye ? "text" : "password";
}

const loading = ref(false);
async function inUser(): Promise<void> {
  if (!User.value.email || !User.value.password) {
    showToast("Ingresa tu correo y contraseña.");
    return;
  }

  loading.value = true;
  try {
    const resp = await logUser({
      email: User.value.email.trim(),
      password: User.value.password,
    });

    // resp esperado: { status: "ok" | "error" | "warning", user?, token?, message }
    if (resp.status === "ok") {
      if (resp.token && resp.user) {
        await useAuthStore().setSession(resp.token, resp.user);// -> setea Bearer y persiste
      }
      showToast(resp.message || "Inicio de sesión exitoso.");
      // limpia password por seguridad
      User.value.password = "";
      // navega al selector de perfiles
      ionRouter.replace("/users")
      return;
    }

    if (resp.status === "warning") {
      showToast(resp.message || "No se pudo iniciar sesión.");
      return;
    }

    // status === "error" u otros
    showToast(resp.message || "Error al iniciar sesión.");
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || "Error de red.";
    showToast(msg);
  } finally {
    loading.value = false;
  }
}


async function loginGoogle(): Promise<void> {
  loading.value = true;
  try {
    const resp = await loginWithGoogle();
    console.log("[loginGoogle] resp:", resp);

    if (resp.status === "ok") {
      if (resp.token && resp.user) {
        await useAuthStore().setSession(resp.token, resp.user);
      }
      showToast("Sesión iniciada con Google.");
      ionRouter.replace("/users");
      return;
    }

    showToast(resp.message || "No se pudo iniciar sesión con Google.");
  } catch (e: any) {
    console.error("[loginGoogle] error:", e);
    const msg = e?.message || "Error inesperado en Google Login.";
    showToast(msg);
  } finally {
    loading.value = false;
  }
}


function goRegister(): void {
  ionRouter.push("register");
}
function goRecuperar(): void {
  ionRouter.push("olvidar");
}

onIonViewDidEnter(async ()=> {
  await ui.refresh();
})
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <toolbar-custom class="px-2" :style="{paddingTop: ui.toolbarPaddingTop + 'px'}">
        <template #start>
          <ion-back-button/>
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="w-full h-full flex flex-col gap-5">
        <div class="flex flex-col items-center gap-3">
          <ion-img class="w-26 h-26" src="/assets/logo.png" alt="logo"/>
          <h1 class="not-dark:text-blue-400 text-3xl font-bold">BIENVENIDO</h1>
        </div>

        <div class="w-full flex flex-col items-center gap-3">
          <p>Inicia sesión para continuar</p>

          <div class="w-full flex flex-col items-center gap-3 py-3 px-3">
            <input-container>
              <!-- CORREGIDO: email -->
              <input-custom
                  v-model="User.email"
                  icon_primary="envelope"
                  placeholder="Email"
                  tipo="email"
                  @keyup.enter="inUser"
              />
            </input-container>

            <input-container>
              <input-custom
                  v-model="User.password"
                  icon_primary="lock"
                  placeholder="Contraseña"
                  :tipo="inputPass.tipo"
                  :icon_secondary="inputPass.eye ? 'eye-crossed' : 'eye'"
                  @click="verPass"
                  @keyup.enter="inUser"
              />
            </input-container>

            <ion-button
                fill="clear"
                class="underline normal-case dark:text-white"
                @click="goRecuperar"
            >¿Olvidaste tu contraseña?</ion-button>

            <!-- BOTÓN LOGIN: usa inUser -->
            <btn-primary
                shape="round"
                size="large"
                class="w-full mt-3"
                :disabled="loading || !User.password || !User.email"
                @click="inUser"
            >
              <span v-if="!loading">Iniciar Sesión</span>
              <span v-else>Ingresando…</span>
            </btn-primary>

            <div class="flex w-full items-center mt-3">
              <div class="w-1/4 h-[2px] bg-orange-400"></div>
              <p class="w-2/4 text-xs text-center">o ingresa con tus cuentas</p>
              <div class="w-1/4 h-[2px] bg-orange-400"></div>
            </div>

            <btn-secondary v-if="!isIos" class="w-full mt-3" @click="loginGoogle">
              <div class="flex items-center gap-2 py-2">
                <img class="w-6 h-6" src="/assets/images/login/google.png" alt="">
                Continuar con Google
              </div>
            </btn-secondary>

            <btn-secondary v-if="isIos" class="w-full">
              <div class="flex items-center gap-2 py-2">
                <img class="w-6 h-6" src="/assets/images/login/logotipo-de-apple.png" alt="">
                Continuar con Apple
              </div>
            </btn-secondary>

            <div class="w-full flex justify-center items-center gap-1 pt-2">
              <p class="font-bold">¿Aun no tienes una cuenta?</p>
              <p class="italic underline not-dark:text-blue-400" @click="goRegister">Registrate.</p>
            </div>
          </div>
        </div>
      </div>

      <ion-toast
          :is-open="toast.show"
          :duration="5000"
          @didDismiss="toast.show = false"
          :message="toast.message"
      />
    </ion-content>
  </ion-page>
</template>


