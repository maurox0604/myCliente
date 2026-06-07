import { createContext, useEffect, useState, useRef } from "react";

export const PublicProductosContext = createContext();

export function PublicProductosProvider({ children }) {
  const [productos, setProductos] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProductos = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/public/productos`);
      const data = await res.json();
      console.log("🔥 RESPUESTA BACKEND:", data);
      setProductos(data);
    } catch (err) {
      console.error("❌ Error cargando catálogo público", err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos(); // carga inicial

    // 🔄 Polling cada 60 segundos — mantiene el stock actualizado
    const intervalo = setInterval(() => {
      fetchProductos();
    }, 60000);

    return () => clearInterval(intervalo); // limpia al desmontar
  }, []);

  return (
    <PublicProductosContext.Provider value={{ productos, loading, fetchProductos }}>
      {children}
    </PublicProductosContext.Provider>
  );
}
