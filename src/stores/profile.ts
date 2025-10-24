import {defineStore} from "pinia";
import {Profile} from "@/types/types";

export const useProfileStore = defineStore("profile", {
    state: () => ({
        selected: null as Profile | null,
    }),
    actions: {
        select(profile: Profile) {
            this.selected = profile;
        },
        clear() {
            this.selected = null
        },
    },
})