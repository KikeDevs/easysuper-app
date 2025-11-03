// src/utils/ubicacionPermisos.ts
import { Geolocation } from "@capacitor/geolocation";

export async function verificarPermisoUbicacion(): Promise<boolean> {
    // 1. Revisar permiso actual
    const current = await Geolocation.checkPermissions();

    if (current.location === "granted") {
        return true;
    }
    // 2. Pedir permiso en runtime
    const req = await Geolocation.requestPermissions();
    // true si el usuario dijo que sí
    return req.location === "granted";
}
