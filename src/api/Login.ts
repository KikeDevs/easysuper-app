import {LoginResponse} from "@/interfaces/types";
import {getDeviceName} from "@/utils/getDevice";
import {api} from "@/services/api";
import {SocialLogin} from "@capgo/capacitor-social-login";

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

export async function loginWithGoogle(): Promise<LoginResponse> {
    try {
        const device_name = await getDeviceName();
        //const WEB_CLIENT_ID = '542553177675-36nq11dik6t2mblrhhjff6ojmk17kctc.apps.googleusercontent.com';

        const loginResult = await SocialLogin.login({
            provider: "google",
            options: {}
        });

        console.log("[GoogleLogin] result:", loginResult);

        const profile =
            loginResult?.result?.profile ||
            loginResult?.profile ||
            loginResult?.result;

        const email = profile?.email;
        const username = profile?.name || profile?.givenName || email;

        // Si el plugin aún así devuelve algún idToken, lo mandamos como extra,
        // pero tu back ya no lo exige.
        const idToken =
            loginResult?.result?.idToken ||
            loginResult?.authentication?.idToken ||
            loginResult?.result?.authentication?.idToken ||
            null;

        if (!email) {
            return { status: "error", message: "No se pudo obtener el correo de Google." };
        }

        const resp = await api.post<LoginResponse>("login-google", {
            email,
            username,
            device_name,
            id_token: idToken,
        });

        return resp.data;
    } catch (error: any) {
        console.error("[GoogleLogin] Error:", error);
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Error de red al iniciar sesión con Google.";
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