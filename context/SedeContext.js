import { createContext, useContext, useState, useEffect } from "react";
import { useBootstrap } from "./BootstrapContext";

const SedeContext = createContext();

export function SedeProvider({ children }) {
  const { bootstrapData } = useBootstrap();

  const [sedes, setSedes] = useState([]);
  const [sedeActiva, setSedeActiva] = useState(null);
  const sedePrincipal = "Local";

  // ── Cuando el bootstrap termina, inicializar sedes ──────────────────────
  useEffect(() => {
    if (!bootstrapData?.sedes?.length) return;

    const data = bootstrapData.sedes;
    setSedes(data);

    // Respetar la selección activa si el usuario ya eligió una sede
    if (sedeActiva) return;

    const sedeLocal = data.find((s) => s.nombre === sedePrincipal);
    setSedeActiva(sedeLocal || data[0]);
  }, [bootstrapData]);

  // ── Cambio manual de sede ────────────────────────────────────────────────
  const cambiarSede = (sede) => {
    setSedeActiva(sede);
    console.log("SEDE activa:", sede);
  };

  return (
    <SedeContext.Provider value={{ sedes, sedeActiva, cambiarSede }}>
      {children}
    </SedeContext.Provider>
  );
}

export const useSede = () => useContext(SedeContext);
