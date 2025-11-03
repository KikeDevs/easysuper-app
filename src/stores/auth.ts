// src/stores/auth.ts
import axios from "axios";
import { defineStore } from "pinia";
import { Preferences } from "@capacitor/preferences";
import type { UserLite } from "@/interfaces/types";
import {useProfileStore} from "@/stores/profile";

const TOKEN_KEY = "auth.token";
const USER_KEY  = "auth.user";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: "" as string,
        user: null as UserLite | null,
    }),
    getters: {
        isLogged: (s) => !!s.token,
    },
    actions: {
        async setSession(token: string, user: UserLite) {
            this.token = token;
            this.user  = user;
            axios.defaults.headers.common.Authorization = `Bearer ${token}`;
            // Persistir en el dispositivo
            await Preferences.set({ key: TOKEN_KEY, value: token });
            await Preferences.set({ key: USER_KEY,  value: JSON.stringify(user) });
        },
        async loadFromPreferences() {
            const [t, u] = await Promise.all([
                Preferences.get({ key: TOKEN_KEY }),
                Preferences.get({ key: USER_KEY }),
            ]);
            this.token = t.value ?? "";
            this.user  = u.value ? (JSON.parse(u.value) as UserLite) : null;
            if (this.token) {
                axios.defaults.headers.common.Authorization = `Bearer ${this.token}`;
            }
        },
        async logout() {
            this.token = "";
            this.user  = null;
            delete axios.defaults.headers.common.Authorization;
            await Preferences.remove({ key: TOKEN_KEY });
            await Preferences.remove({ key: USER_KEY });
        },
        async logoutAndReset() {
            await this.logout();

            const profile = useProfileStore();
            profile.$reset();
        }
    },
});
