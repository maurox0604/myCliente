import { createContext, useEffect, useState } from "react";

export const PublicProductosContext = createContext();

export function PublicProductosProvider({ children }) {
  const [productos, setProductos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://backend-de-prueba-delta.vercel.app/productos/all")
      .then(res => res.json())
      .then(data => {
        console.log("🔥 RESPUESTA BACKEND:", data);

        setProductos(
          data.productos.map(p => ({
            ...p,
            nombre: p.sabor, // normalización temporal
          }))
        );
      })
      .catch(err => {
        console.error("❌ Error cargando catálogo público", err);
        setProductos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicProductosContext.Provider value={{ productos, loading }}>
      {children}
    </PublicProductosContext.Provider>
  );
}
