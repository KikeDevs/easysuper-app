import {api} from "@/services/api";
import {Terminada} from "@/interfaces/types";

interface actionResponse {
    status: 'ok'| 'error' | 'warning';
    message: string;
}

export async function productComprado(
    userlistId: number,
    perfilId: number,
    productId: number,
    productStatus: number
) :Promise<actionResponse> {
    try {
        const resp = await api.post<actionResponse>('product-compra',
        {
            userlist_id: userlistId,
            perfil_id: perfilId,
            product_id: productId,
            status_pro: productStatus
        });
        return resp.data;
    } catch (error: any) {
        const message = error?.response?.data?.message
            ?? error?.message
            ?? "Error de red al registrar";
        return { status: "error", message };
    }
}

export async function terminarCompra(userlistId: number, perfilId: number) {
    try{
        const resp = await api.post<actionResponse>('terminar-compra',{
            userlist_id: userlistId,
            perfil_id: perfilId,
        })
        return resp.data;
    } catch (error: any){
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return { status: "error", message };
    }
}


interface TerminadaResponse {
    status: 'ok'| 'error' | 'warning';
    terminada?: Terminada[]
    message: string;
}

export async function terminadaCompra(userlistId:number): Promise<TerminadaResponse>{
    try {
        const resp = await api.post<TerminadaResponse>('compra_terminada',
            {
                userlist_id: userlistId,
            });
        return resp.data;
    } catch (error: any){
        const message = error?.response?.data?.message
        ?? error?.message
        ?? "Error de red al registrar";
        return {status: "error",message}
    }
}