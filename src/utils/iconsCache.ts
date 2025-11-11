import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

function nameFrom(url: string): string {
    const noQs = url.split("?")[0];
    const ext  = (noQs.split(".").pop() || "png").toLowerCase();
    const b64  = btoa(unescape(encodeURIComponent(url)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/,"");
    return `${b64}.${ext}`;
}

async function getLocalUri(path: string) {
    const uri = await Filesystem.getUri({ path, directory: Directory.Cache });
    return Capacitor.convertFileSrc(uri.uri);
}

export async function ensureLocalIcon(url: string): Promise<string> {
    const fname = nameFrom(url);
    const path  = `pins/${fname}`;
    try {
        // si ya existe, usa local
        await Filesystem.stat({ path, directory: Directory.Cache });
        return await getLocalUri(path);
    } catch {}
    // bajar y guardar
    const res = await fetch(url, { cache: "reload" });
    if (!res.ok) throw new Error(`Icon fetch failed: ${res.status}`);
    const blob = await res.blob();
    const buf  = await blob.arrayBuffer();
    const b64  = btoa(String.fromCharCode(...new Uint8Array(buf)));
    await Filesystem.writeFile({
        path, data: b64, directory: Directory.Cache, recursive: true
    });
    return await getLocalUri(path);
}
