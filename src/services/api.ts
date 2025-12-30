// src/services/api.ts
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import { useAuthStore } from "@/stores/auth";

const isNative = Capacitor.isNativePlatform();


const BASE_URL_NATIVE = "http://srv1170449.hstgr.cloud/api/";
const BASE_URL_WEB = "http://srv1170449.hstgr.cloud/api/"; // no importa si no usas web

export const api = axios.create({
    baseURL: isNative ? BASE_URL_NATIVE : BASE_URL_WEB,
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
