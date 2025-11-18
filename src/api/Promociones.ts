import {Promo} from "@/interfaces/promos";
import {api} from "@/services/api";

type ResponsePromos = {
    status: 'ok'| 'error';
    all_promos?: Promo[];
    esp_promos?: Promo[];
    message: string;
}
export async function getPromos(brand_id:number,googleId:string): Promise<ResponsePromos> {
    try {
        const resp = await api.post<ResponsePromos>('promos',{
            brand: brand_id,
            google_id: googleId,
        });
        return resp.data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Error de red al iniciar sesión con Google.";
        return { status: "error", message };
    }
}

export async function getPromosMap(googleId:string,nameBrand:string): Promise<ResponsePromos> {
    try {
        const resp = await api.post<ResponsePromos>('promos-map',{
            google_id: googleId,
            brand: nameBrand,
        });
        return resp.data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Error de red al iniciar sesión con Google.";
        return { status: "error", message };
    }
}