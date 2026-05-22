import {api} from "@/services/api";

type Response = {
    status: string;
    datos?: any;
    message: string;
};


// @ts-ignore
export async function ServicioGeneral(ip: string, payload: any):Promise<Response> {
    try {
        const resp = await api.post(ip, payload);
        return resp.data;
    } catch (e: any) {
        toResponse(e,ip);
    }
}

function toResponse(e:any,api: string):Response {
    return {
        status: 'error',
        message: e.message ?? `Error al obtener ${api}`,
    }
}

export function getUrl(url: string): string {
    return `https://${url}/api`;
}
export function getUrlBase(url:string):string {
    return `https://easysuper.cloud/${url}`;
}