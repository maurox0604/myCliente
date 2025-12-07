// context/ReportesContext.js
import React, { createContext, useContext, useState } from "react";
import { getTopSaboresRequest } from "../api/reportes.api";

const ReportesContext = createContext();
export const useReportes = () => useContext(ReportesContext);

export const ReportesProvider = ({ children }) => {
  const [topSabores, setTopSabores] = useState([]);

  // recibe strings "YYYY-MM-DD" o null
  const loadTopSabores = async (startStr = null, endStr = null) => {
    try {
      let query = "";
      if (startStr && endStr) query = `?start=${startStr}&end=${endStr}`;
      console.log("📡 loadTopSabores -> query:", query);
      const datos = await getTopSaboresRequest(query); // devuelve json.data [] según api
      console.log("🔍 raw topSabores:", datos);

      // Normalizar: asegurarnos de que tenemos { sabor, total: Number, total_vendido: Number }
      const normalized = (Array.isArray(datos) ? datos : []).map((it, i) => {
        const sabor = (it.sabor ?? it.name ?? `item-${i}`).toString().trim();
        const totalNum = Number(String(it.total ?? it.total_vendido ?? 0).replace(/\D+/g, "")) || 0;
        return {
          ...it,
          sabor,
          total: totalNum,
          total_vendido: totalNum
        };
      });

      console.log("🔥 Top Sabores cargados (normalized):", normalized);
      setTopSabores(normalized);
    } catch (error) {
      console.error("Error cargando top sabores", error);
      setTopSabores([]);
    }
  };

  return (
    <ReportesContext.Provider value={{ topSabores, loadTopSabores }}>
      {children}
    </ReportesContext.Provider>
  );
};
