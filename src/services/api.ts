// src/services/api.ts
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import { useAuthStore } from "@/stores/auth";

const isNative = Capacitor.isNativePlatform();

const local = false;

const BASE_URL_NATIVE = local ? "http://192.168.100.104:8000/api/" : "https://darkgrey-jaguar-767398.hostingersite.com/api/";
const BASE_URL_WEB    = local ? "http://192.168.100.104:8000/api/" : "https://darkgrey-jaguar-767398.hostingersite.com/api/"; // no importa si no usas web

export const api = axios.create({
    baseURL: isNative ? BASE_URL_NATIVE : BASE_URL_WEB,
    timeout: 10000,
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
