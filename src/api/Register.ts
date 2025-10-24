import { api } from "@/services/api";
import { RegisterResponse } from "@/types/types";
import {getDeviceName} from "@/utils/getDevice";

export async function addUser(map: {
    username: string;
    email: string;
    password: string;
}): Promise<RegisterResponse> {
    try {
        const device_name = await getDeviceName();

        const resp = await api.post<RegisterResponse>("register", {
            username: map.username?.trim(),
            email: map.email?.trim(),
            password: map.password,
            device_name: device_name,
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
