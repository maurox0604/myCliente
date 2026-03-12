import { createContext, useEffect, useState } from "react";

export const PublicProductosContext = createContext();

export function PublicProductosProvider({ children }) {
  const [productos, setProductos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch("https://backend-de-prueba-delta.vercel.app/api/public/productos")
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/public/productos`)
    
    .then(res => res.json())
    .then(data => {
      console.log("🔥 RESPUESTA BACKEND:", data);
      setProductos(data);
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
