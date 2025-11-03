import {ListReboot, miList, ProductList} from "@/interfaces/types";
import {api} from "@/services/api";
import {userPerfiles} from "@/api/UserProfiles";
import {useProfileStore} from "@/stores/profile";


interface actionListsResponse {
    status: "ok" | "error" | "warning"
    message: string
}

export async function addList(nameList: string): Promise<actionListsResponse> {
    try {
        const resp = await api.post<actionListsResponse>('add-list', {name_list: nameList})
        return resp.data
    } catch (error: any) {
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}
export async function deleteList(listId: number): Promise<actionListsResponse> {
    try {
        const resp = await api.post<actionListsResponse>('delete-list', {userlist_id: listId})
        return resp.data
    } catch (error: any) {
        const message = error?.response?.data?.message
            ?? error?.message
            ?? "Error de red al registrar";
        return { status: "error", message };
    }
}
export async function rebootList(listId: number,nameList:string ,perfilId: number ,tipoReboot: string): Promise<actionListsResponse> {
    try {
        const resp = await api.post<actionListsResponse>('reboot-list', {
            userlist_id: listId,
            name_list: nameList,
            perfil_id: perfilId,
            tipo: tipoReboot,
        });
        return resp.data;
    } catch (error: any){
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}


interface misListResponse {
    status: "ok" | "error" | "warning"
    misLists?: miList[]
    message: string
}

export async function misList(): Promise<misListResponse> {
    try {
        const resp = await api.post<misListResponse>('mis-lists', {})
        return resp.data
    } catch (error: any) {
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

interface miListResponse {
    status: "ok" | "error" | "warning"
    listDetalles?: ProductList[]
    message: string
}

export async function getListDetails(userlistId: number): Promise<miListResponse> {
    try {
        const resp = await api.post<miListResponse>('mi-list', {userlist_id: userlistId})
        return resp.data
    } catch (error: any) {
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

interface listFinishedResponse {
    status: "ok" | "error" | "warning"
    listReboots?: ListReboot[]
    message: string
}

export async function getListsFinished(): Promise<listFinishedResponse> {
    try {
        const resp = await api.post<listFinishedResponse>('lists-finished',{});
        return resp.data;
    } catch (error: any) {
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}