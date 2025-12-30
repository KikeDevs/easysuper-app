// src/utils/ubicacionPermisos.ts
import { Geolocation } from "@capacitor/geolocation";

export async function verificarPermisoUbicacion(): Promise<boolean> {
    const st = await Geolocation.checkPermissions();

    if (st.location === "granted") return true;

    // En Android a veces regresa "prompt-with-rationale"
    if (st.location === "prompt" || st.location === "prompt-with-rationale") {
        const req = await Geolocation.requestPermissions();
        return req.location === "granted";
    }

    return false; // denied
}
