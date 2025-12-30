import { defineStore } from "pinia";
import type { Profile } from "@/interfaces/types";

const LS_SELECTED = "es_profile_selected";
const LS_LOC = "es_location_granted";

export const useProfileStore = defineStore("profile", {
    state: () => ({
        selected: null as Profile | null,
        locationGranted: false,
    }),
    getters: {
        hasSelected: (s) => !!s.selected,
    },
    actions: {
        hydrate() {
            try {
                const raw = localStorage.getItem(LS_SELECTED);
                this.selected = raw ? (JSON.parse(raw) as Profile) : null;

                const loc = localStorage.getItem(LS_LOC);
                this.locationGranted = loc === "1";
            } catch {
                this.selected = null;
                this.locationGranted = false;
            }
        },
        select(profile: Profile) {
            this.selected = profile;
            localStorage.setItem(LS_SELECTED, JSON.stringify(profile));
        },
        clear() {
            this.selected = null;
            localStorage.removeItem(LS_SELECTED);
        },
        setLocationGranted(v: boolean) {
            this.locationGranted = v;
            localStorage.setItem(LS_LOC, v ? "1" : "0");
        },
    },
});