export function getSaludo(date: Date = new Date()){
    const hour = Number(
        new Intl.DateTimeFormat("es-MX",{
            hour: "numeric",
            hour12: false,
            timeZone: "America/Mexico_City",
        }).format(date)
    );

    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 20) return "Buenas tardes";
    return "Buenas noches";
}