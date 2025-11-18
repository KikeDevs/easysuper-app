import {api} from "@/services/api";
import {setResponseError} from "@/utils/globals";

type ResponsePass = {
    status: 'warning'| 'error' | 'ok';
    message: string;
}

export async function runPassReset(emailUser:string): Promise<ResponsePass> {
    try {
        const resp = await api.post<ResponsePass>('send-code',{
            email: emailUser,
        });
        return resp.data;
    } catch (error: any) {
        return setResponseError(error);
    }
}

export async function verificarCode(emailUser:string,code: string): Promise<ResponsePass> {
    try {
        const resp = await api.post<ResponsePass>('verify-code',{
            email: emailUser,
            code: code,
        });
        return resp.data;
    } catch (error: any) {
        return setResponseError(error);
    }
}

export async function actualizarPassword(emailUser:string,password: string,code:string): Promise<ResponsePass> {
    try {
        const resp = await api.post<ResponsePass>('reset-password',{
            email: emailUser,
            password: password,
            code: code,
        });
        return resp.data;
    } catch (error: any) {
        return setResponseError(error);
    }
}