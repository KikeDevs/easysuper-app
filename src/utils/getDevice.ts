import {Device} from "@capacitor/device";

export async function getDeviceName():Promise<string> {
    try {
        const info = await Device.getInfo()
        const id = await Device.getId()

        return `${info.platform}-${info.model ?? 'model'}-${id.identifier.slice(0,8)}`
    } catch {
        return navigator.userAgent ?? 'web-client';
    }
}