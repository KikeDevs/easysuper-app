import {Geolocation} from "@capacitor/geolocation/";
import {currentUbicacion} from "@/interfaces/ubicacion";

export async function initUbicacionForeground() : Promise<currentUbicacion>{
    const permStatus = await Geolocation.checkPermissions();
    if (permStatus.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if(req.location !== 'granted') {
            throw new Error('El usuario no dio permiso de ubicacion');
        }
    }

    const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
    });

    return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy:pos.coords.accuracy,
    }
}