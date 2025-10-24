// src/router/guard.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useProfileStore } from "@/stores/profile";

export function installGuards(router: Router) {
    router.beforeEach((to) => {
        const auth = useAuthStore();
        const prof = useProfileStore();

        const needsAuth    = to.meta?.requiresAuth === true;
        const needsProfile = to.meta?.requiresProfile === true;

        if (needsAuth && !auth.isLogged) {
            return { path: "/", query: { redirect: to.fullPath } };
        }
        if (needsProfile && auth.isLogged && !prof.selected) {
            return { path: "/users", query: { redirect: to.fullPath } };
        }
        if (to.path === "/" && auth.isLogged) {
            return prof.selected ? { path: "/home" } : { path: "/users" };
        }
        return true;
    });
}
