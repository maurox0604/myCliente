// utils/fmt.js — formateo de números para IceQueen
// Uso: import { fmtPeso, fmtCant } from "../../utils/fmt";

/**
 * Formatea un valor monetario (pesos colombianos).
 * 3600    → "3.600"
 * 3600.5  → "3.601"  (redondea al peso más cercano)
 */
export const fmtPeso = (n) => {
  const v = Math.round(Number(n ?? 0));
  if (isNaN(v)) return "0";
  return v.toLocaleString("es-CO");
};

/**
 * Formatea una cantidad (gr, ml, unidades).
 * 90.0000 → "90"
 * 1.5     → "1.5"
 * 0.0250  → "0.025"
 */
export const fmtCant = (n) => {
  const v = Number(n ?? 0);
  if (isNaN(v)) return "0";
  // Elimina ceros finales innecesarios
  return v % 1 === 0 ? String(v) : parseFloat(v.toFixed(4)).toString();
};
