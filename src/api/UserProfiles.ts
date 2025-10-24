import {Profile} from "@/types/types";
import {api} from "@/services/api";

interface ProfilesResponse {
    status: "ok" | "warning" | "error";
    profiles?: Profile[];
    message: string;
}

export async function userPerfiles(): Promise<ProfilesResponse>{
    try {
        const resp = await api.post<ProfilesResponse>("user-perfiles", {});
        return resp.data;
    } catch (error: any) {
        const message = error?.response?.data?.message
            ?? error?.message
            ?? "Error de red al registrar";
        return { status: "error", message };
    }
}


interface actionPerfilResponse {
    status: "ok" | "warning" | "error";
    message: string;
}

export async function addPerfil(namePerfil: string): Promise<actionPerfilResponse> {
    try {
        const resp = await api.post('add-perfil',{name_perfil:namePerfil});
        return resp.data;
    } catch (error: any){
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

export async function edittPerfil(perfilId: number | null, namePerfil: string): Promise<actionPerfilResponse> {
    try {
        const resp = await api.post('edit-perfil',{perfil_id:perfilId, name_perfil:namePerfil});
        return resp.data;
    } catch (error: any) {
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}