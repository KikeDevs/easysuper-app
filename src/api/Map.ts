import { api } from "@/services/api";

export type SuperPlace = { id: string; title: string; lat: number; lng: number, brand: string, icon: string };

export async function fetchNearbySupers(
    center: { lat: number; lng: number },
    radius = 3000,
    limit = 20
): Promise<SuperPlace[]> {
    const { lat, lng } = center;

    try {
        // 2º arg = BODY; 3º arg = CONFIG (headers, timeout, etc)
        const res = await api.post(
            "places-supermarkets",
            { lat, lng, radius, limit },
            { headers: { "Cache-Control": "no-store" }, timeout: 15000 }
        );

        if (res.data?.ok === true && Array.isArray(res.data.results)) {
            return res.data.results as SuperPlace[];
        }
        throw new Error(res.data?.error || "Respuesta inválida");
    } catch (e: any) {
        const status  = e?.response?.status;
        const details = e?.response?.data || e?.message;
        // Esto lo verás en chrome://inspect y podemos toastearlo
        console.error("POST places-supermarkets:", status, details);
        throw new Error(typeof details === "string" ? details : JSON.stringify(details));
    }
}
