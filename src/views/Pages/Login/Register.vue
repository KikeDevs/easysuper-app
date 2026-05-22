<script setup lang="ts">
import {
  IonPage, IonContent, isPlatform, IonHeader, IonBackButton, IonToast, onIonViewDidEnter, useIonRouter, IonModal
} from "@ionic/vue";
import InputContainer from "@/views/Components/InputContainer.vue";
import InputCustom from "@/views/Components/InputCustom.vue";
import { computed, ref } from "vue";
import BtnPrimary from "@/views/Components/BtnPrimary.vue";
import BtnSecondary from "@/views/Components/BtnSecondary.vue";
import ToolbarCustom from "@/views/Components/ToolbarCustom.vue";
import IconCustom from "@/views/Components/IconCustom.vue";
import {useAuthStore} from "@/stores/auth";
import {useProfileStore} from "@/stores/profile";
import { addUser } from "@/api/Register";
import {useUiStore} from "@/stores/statusbar";
import {loginWithGoogle} from "@/api/Login";

const isIos = computed(() => isPlatform('ios'));
const router = useIonRouter();
const ui = useUiStore();

const newUser = ref({
  username: '',
  email: '',
  password: '',
});
const confirmPass = ref('');

const inputPass = ref({
  tipo: 'password',
  eye: false
});


const dialog = ref({
  open: false,
  title: "Listo",
  message: ""
});

let dialogTimer: number | null = null;
function showToast(message: string,title: string): void {
  dialog.value = {
    open: true,
    title: title,
    message: message,
  };

  if (dialogTimer) window.clearTimeout(dialogTimer);
  dialogTimer = window.setTimeout(() => {
    dialog.value.open = false;
  }, 3000);

}


function verPass(): void {
  inputPass.value.eye = !inputPass.value.eye;
  inputPass.value.tipo = inputPass.value.eye ? 'text' : 'password';
}

// Validaciones reactivas
const passMatch = computed(() => newUser.value.password.length > 0
    && confirmPass.value.length > 0
    && newUser.value.password === confirmPass.value);

const passTouched = computed(() => confirmPass.value.length > 0);
const canSubmit = computed(() =>
    newUser.value.username.trim().length >= 3 &&
    /\S+@\S+\.\S+/.test(newUser.value.email) &&
    newUser.value.password.length >= 8 &&
    passMatch.value
);

const loading = ref(false);

async function nuevoUser(): Promise<void> {
  if (!canSubmit.value) {
    showToast(!passMatch.value ? 'Las contraseñas no coinciden.' : 'Revisa los campos obligatorios.',"Info");
    return;
  }

  loading.value = true;
  try {
    const resp = await addUser(newUser.value);

    if (resp.status === 'ok') {
      // 1) Guarda token + user en Pinia (persistente)
      if (resp.token && resp.user) {
        await useAuthStore().setSession(resp.token, resp.user);
      } else {
        // Por si el backend aún no devuelve token/user
        showToast('El servidor no devolvió token/usuario.',"Error");
        return;
      }

      // 2) Limpia form
      showToast(resp.message || 'Usuario creado correctamente.',"Listo");
      newUser.value = { username: '', email: '', password: '' };
      confirmPass.value = '';

      // 3) Limpia perfil seleccionado (por si acaso) y navega al selector
      const prof = useProfileStore()
      prof.clear()

      // 4) Ve directo al selector de perfiles
      router.replace('/users');  // <- tu ruta del selector

      return;
    }

    if (resp.status === 'warning') {
      showToast(resp.message || 'El usuario ya existe.',"Aviso");
      return;
    }

    showToast(resp.message || 'No se pudo registrar.',"Error");
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || 'Error al registrar.';
    showToast(msg,"Error");
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
      showToast("Sesión iniciada con Google.","Listo");
      router.replace("/users");
      return;
    }

    showToast(resp.message || "No se pudo iniciar sesión con Google.","Error");
  } catch (e: any) {
    console.error("[loginGoogle] error:", e);
    const msg = e?.message || "Error inesperado en Google Login.";
    showToast(msg,"Error");
  } finally {
    loading.value = false;
  }
}

onIonViewDidEnter(async () => {
  await ui.refresh();
})

</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <toolbar-custom class="px-2" :style="{paddingTop: ui.toolbarPaddingTop + 'px'}">
        <template #start>
          <ion-back-button />
        </template>
      </toolbar-custom>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="w-full h-full flex flex-col justify-center items-center gap-3">
        <h1 class="font-bold text-3xl not-dark:text-blue-400">CREAR CUENTA</h1>

        <div class="w-full flex flex-col gap-1 justify-center items-center px-3">
          <p>Regístrate para continuar</p>

          <div class="w-full h-full flex flex-col items-center gap-3">
            <input-container>
              <input-custom
                  v-model="newUser.username"
                  placeholder="Nombre de usuario"
                  icon_primary="user"
              />
            </input-container>

            <input-container>
              <input-custom
                  v-model="newUser.email"
                  placeholder="Email"
                  icon_primary="envelope"
                  tipo="email"
              />
            </input-container>

            <div class="w-full flex gap-2 items-center">
              <input-container>
                <input-custom
                    v-model="newUser.password"
                    placeholder="Contraseña"
                    icon_primary="lock"
                    :tipo="inputPass.tipo"
                    :icon_secondary="inputPass.eye ? 'eye-crossed' : 'eye'"
                    @click="verPass"
                />
              </input-container>
            </div>

            <div class="w-full flex flex-col gap-1 justify-start">
              <div class="w-full flex items-center gap-2">
                <input-container>
                  <input-custom
                      v-model="confirmPass"
                      placeholder="Confirmar contraseña"
                      icon_primary="lock"
                      tipo="password"
                  />
                </input-container>
                <icon-custom v-if="passTouched && !passMatch" icon="cross-circle" size="xl" class="bg-red-600 rounded-full text-white p-1"/>
                <icon-custom v-if="passTouched && passMatch" icon="check-circle" size="xl" class="bg-green-600 rounded-full text-white p-1"/>
              </div>
              <div v-if="passTouched && !passMatch" class="w-full flex gap-1 justify-center">
                <p class="text-xs text-red-600 font-bold">Las contraseñas no coinciden</p>
              </div>
            </div>

            <btn-primary
                shape="round"
                size="large"
                class="w-full mt-3"
                :class="{'opacity-60 pointer-events-none': !canSubmit || loading}"
                @click="nuevoUser"
            >
              <div>{{ loading ? 'Registrando...' : 'Registrarse' }}</div>
            </btn-primary>

            <div class="flex w-full items-center mt-3">
              <div class="w-1/4 h-[2px] bg-orange-400"></div>
              <p class="w-2/4 text-xs text-center">o ingresa con tus cuentas</p>
              <div class="w-1/4 h-[2px] bg-orange-400"></div>
            </div>

            <btn-secondary class="w-full mt-3" @click="loginGoogle">
              <div class="flex items-center gap-2 py-2">
                <img class="w-6 h-6" src="/assets/images/login/google.png" alt="">
                Continuar con Google
              </div>
            </btn-secondary>

            <!--<btn-secondary v-if="isIos" class="w-full">
              <div class="flex items-center gap-2 py-2">
                <img class="w-6 h-6" src="/assets/images/login/logotipo-de-apple.png" alt="">
                Continuar con Apple
              </div>
            </btn-secondary>-->
          </div>
        </div>
      </div>

      <ion-modal
          :is-open="dialog.open"
          :backdrop-dismiss="true"
          :show-backdrop="true"
          class="mini-dialog"

          @didDismiss="dialog.open = false"
      >
        <div class="mini-card">
          <p class="mini-title">{{ dialog.title }}</p>
          <p class="mini-msg">{{ dialog.message }}</p>
        </div>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>
<style scoped>
.mini-dialog {
  --width: 85%;
  --max-width: 320px;
  --height: auto;
  --border-radius: 18px;
  --backdrop-opacity: 0.35;
  --background: oklch(62.3% 0.214 259.815);
}

.mini-card {
  padding: 14px 16px;
  text-align: center;
}

.mini-title {
  font-weight: 700;
  font-size: 16px;
  margin: 0 0 6px 0;
  color: white;
}

.mini-msg {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  color: white;
}

</style>