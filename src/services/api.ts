// src/services/api.ts
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import { useAuthStore } from "@/stores/auth";
import {getUrl} from "@/services/services";

const isNative = Capacitor.isNativePlatform();

export const api = axios.create({
    baseURL: isNative ? getUrl("easysuper.cloud") : getUrl("easysuper.cloud"),
    timeout: 15000,
});

export function wireApiAuth() {
    api.interceptors.request.use((config) => {
        const auth = useAuthStore();
        if (auth.token) {
            // @ts-ignore
            config.headers = {
                ...(config.headers ?? {}),
                "Cache-Control": "no-store,no-cache,must-revalidate",
                Pragma: "no-cache",
            }

            config.headers.Authorization = `Bearer ${auth.token}`;
        }
        return config;
    });
}