function parseMySQLDateTime(s: string): Date | null {
    if (!s) return null;
    // s = "2025-10-16 16:14:14"
    const [d, t] = s.split(" ");
    if (!d) return null;
    const [Y, M, D] = d.split("-").map(n => parseInt(n, 10));
    const [h = 0, m = 0, sec = 0] = (t ?? "00:00:00").split(":").map(n => parseInt(n, 10));
    // new Date(año, mesIndex, día, hora, minuto, segundo) usa zona local del dispositivo
    return new Date(Y, (M - 1), D, h, m, sec);
}

const fmtLargoMX = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    // Si también quieres el día de la semana, descomenta:
    // weekday: "long",
});

export function formatFechaLarga(fechaMySQL: string): string {
    const dt = parseMySQLDateTime(fechaMySQL);
    if (!dt || isNaN(dt.getTime())) return "";
    // Por convención en español los meses van en minúsculas; si quieres capitalizar:
    // return capitalizar(fmtLargoMX.format(dt));
    return fmtLargoMX.format(dt); // ej. "16 de octubre de 2025"
}