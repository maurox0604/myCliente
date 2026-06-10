import { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * BootstrapContext
 *
 * Hace UN solo fetch al arrancar la app y expone los datos crudos
 * para que SedeContext, CategoriasContext y HeladosContext los consuman
 * directamente — sin hacer sus propios fetches iniciales.
 *
 * Árbol esperado en App.js:
 *   <BootstrapProvider>
 *     <SedeProvider>
 *       <CategoriasProvider>
 *         <HeladosProvider>
 *           ...
 */

const BootstrapContext = createContext(null);

export function BootstrapProvider({ children }) {
  const [bootstrapData, setBootstrapData] = useState(null); // null = aún no cargó
  const [bootstrapError, setBootstrapError] = useState(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);

  const cargarBootstrap = useCallback(async () => {
    try {
      setBootstrapLoading(true);
      setBootstrapError(null);

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/bootstrap`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (!data.ok) {
        throw new Error("Respuesta inválida del servidor");
      }

      setBootstrapData({
        productos: Array.isArray(data.productos) ? data.productos : [],
        categorias: Array.isArray(data.categorias) ? data.categorias : [],
        sedes: Array.isArray(data.sedes) ? data.sedes : [],
      });
    } catch (err) {
      console.error("❌ Bootstrap falló:", err.message);
      setBootstrapError(err.message);
    } finally {
      setBootstrapLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBootstrap();
  }, []);

  return (
    <BootstrapContext.Provider
      value={{
        bootstrapData,      // { productos, categorias, sedes } | null
        bootstrapLoading,   // true mientras carga la primera vez
        bootstrapError,     // string | null
        recargarBootstrap: cargarBootstrap,
      }}
    >
      {children}
    </BootstrapContext.Provider>
  );
}

export const useBootstrap = () => useContext(BootstrapContext);
