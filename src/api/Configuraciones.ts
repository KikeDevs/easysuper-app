import {User} from "@/interfaces/configs";
import {api} from "@/services/api";

interface userResponse {
    status: 'ok'| 'error' | 'warning'
    user?: User
    message: string
}

export async function getUser(): Promise<userResponse> {
    try {
        const resp = await api.post<userResponse>('config-user', {});
        return resp.data;
    } catch (error: any){
        const message = error?.response?.data?.message
            ?? error?.message
            ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

export async function updateUser(pass: string, name: string): Promise<userResponse> {
    try {
        const resp = await api.post<userResponse>('config-update-user', {
            password: pass,
            username: name,
        })
        return resp.data;
    } catch (error: any){
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}
