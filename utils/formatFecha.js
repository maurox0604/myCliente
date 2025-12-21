export function formatFechaCO(fechaUTC) {
  if (!fechaUTC) return "";
  return new Date(fechaUTC).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
