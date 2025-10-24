// color-from-text-stable.ts (versión vibrante)
function hashString(str: string): number {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
    return h >>> 0;
}
function map(hash: number, min: number, max: number) {
    const span = max - min;
    return min + (hash % (span * 1000)) / 1000;
}
function hslToHex(h: number, s: number, l: number) {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (v: number) => Math.round(255 * v).toString(16).padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
function normalizeText(t: string) {
    return t.trim().normalize("NFKC").toLocaleLowerCase("es-MX");
}

/** Bandas de tono vibrantes (evitamos dorados/ocres/oliva 35–65°) */
const VIBRANT_HUE_BANDS: Array<[number, number]> = [
    [200, 230], // azul
    [230, 260], // índigo
    [265, 290], // violeta
    [300, 330], // magenta/fucsia
    [330, 350], // rosa/rojo vivo (evita dorados)
    [10,  20],  // rojo-anaranjado controlado
    [160, 185], // teal
    [185, 200], // cian
    [120, 140], // verde lima (brilla sin ser amarillento)
];

/** Mismo texto -> color vibrante (sin dorados) */
export function colorFromTextStable(text: string): string {
    const base = normalizeText(text);
    const h = hashString(base);

    // 1) Elegimos una banda estable por índice
    const bandIdx = h % VIBRANT_HUE_BANDS.length;
    const [hMin, hMax] = VIBRANT_HUE_BANDS[bandIdx];

    // 2) Tono dentro de la banda (estable con otro “trozo” del hash)
    const hue = map(h >>> 8, hMin, hMax);

    // 3) Saturación alta y Luminosidad media para vibrar en UI oscura/clara
    let sat = Math.round(map(h >>> 16, 78, 96)); // alto: evita grises
    let lig = Math.round(map(h >>> 24, 48, 62)); // medio: evita negro/blanco

    // Sutileza: si cae en un punto demasiado “plano”, empujamos al centro
    if (lig < 50 && sat < 82) { sat = 85; }
    if (lig > 60 && sat < 85) { sat = 88; }

    return hslToHex(hue, sat, lig);
}

/** Contraste legible (YIQ) */
export function readableTextColor(bgHex: string): "#000000" | "#ffffff" {
    const hex = bgHex.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? "#000000" : "#ffffff";
}

/** Atajo para chips/badges */
export function badgeColorsFor(text: string) {
    const bg = colorFromTextStable(text);
    const fg = readableTextColor(bg);
    return { bg, fg };
}
