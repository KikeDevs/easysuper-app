import {LoginResponse} from "@/interfaces/types";
import {getDeviceName} from "@/utils/getDevice";
import {api} from "@/services/api";

export async function logUser(map: {
    email: string,
    password: string,
}): Promise<LoginResponse> {
    try {
        const device_name = await getDeviceName();
        const resp = await api.post<LoginResponse>('login', {
            email: map.email?.trim(),
            password: map.password,
            device_name: device_name,
        });
        return resp.data
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Error de red al registrar";
        return { status: "error", message };
    }
}

interface logOutResponse {
    status: "error" | "ok" | "cancel";
    message: string;
}

export async function logOutUser() : Promise<logOutResponse> {
    try {
        const deviceName = await getDeviceName();
        const resp = await api.post<logOutResponse>('logout', {
            device_name: deviceName
        });
        return resp.data;
    } catch (error: any) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Error de red al registrar";
        return { status: "error", message };
    }
}