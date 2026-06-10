import { createContext, useContext, useEffect, useState } from "react";
import { useBootstrap } from "./BootstrapContext";

const CategoriasContext = createContext();

export function CategoriasProvider({ children }) {
  const { bootstrapData, recargarBootstrap } = useBootstrap();

  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  // ── Inicializar desde bootstrap ──────────────────────────────────────────
  useEffect(() => {
    if (!bootstrapData) return; // aún cargando

    setLoadingCategorias(false);

    const data = bootstrapData.categorias ?? [];
    setCategorias(data);

    if (!categoriaActiva && data.length > 0) {
      setCategoriaActiva(data[0].id);
    }
  }, [bootstrapData]);

  /**
   * recargarCategorias — hace un nuevo bootstrap completo.
   * Si en el futuro necesitas un endpoint /categorias/all independiente
   * puedes agregarlo aquí sin tocar el resto de la app.
   */
  const recargarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      await recargarBootstrap();
    } finally {
      setLoadingCategorias(false);
    }
  };

  return (
    <CategoriasContext.Provider
      value={{
        categorias,
        categoriaActiva,
        setCategoriaActiva,
        loadingCategorias,
        recargarCategorias,
      }}
    >
      {children}
    </CategoriasContext.Provider>
  );
}

export const useCategorias = () => useContext(CategoriasContext);
