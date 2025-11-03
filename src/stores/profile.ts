import {defineStore} from "pinia";
import {Profile} from "@/interfaces/types";

export const useProfileStore = defineStore("profile", {
    state: () => ({
        selected: null as Profile | null,
        locationGranted: false,
    }),
    actions: {
        select(profile: Profile) {
            this.selected = profile;
        },
        clear() {
            this.selected = null
        },
        setLocationGranted(v: boolean) {
            this.locationGranted = v
        }
    },
})