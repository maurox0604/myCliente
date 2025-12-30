import { createContext, useState, useEffect } from "react";


export const HeladosContext = createContext();

export const HeladosProvider = ({ children }) => {
  const [helados, setHelados] = useState([]);
  const [filteredHelados, setFilteredHelados] = useState([]);

  /* ================= FETCH ================= */
    const fetchHelados = async () => {
    try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/productos/all`);

        if (!res.ok) {
        console.error("❌ Error HTTP:", res.status);
        setHelados([]);
        setFilteredHelados([]);
        return;
        }

        const data = await res.json();

        // 🔒 BLINDAJE TOTAL
        const productos = Array.isArray(data)
        ? data
        : Array.isArray(data.productos)
            ? data.productos
            : [];

        setHelados(productos);
        setFilteredHelados(productos);
    } catch (err) {
        console.error("❌ fetchHelados falló:", err);
        setHelados([]);
        setFilteredHelados([]);
    }
    };
  /* ================= BUSCADOR ================= */
  const handleSearch = (text) => {
    if (!text) {
      setFilteredHelados(helados);
      return;
    }

    const filtered = helados.filter(h =>
      h.sabor.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredHelados(filtered);
  };

  /* ================= UPDATE CANTIDAD ================= */
  const updateHeladoCantidad = (id, nuevaCantidad) => {
    setHelados(prev =>
      prev.map(h =>
        h.id === id ? { ...h, cantidad: nuevaCantidad } : h
      )
      );
      
      handleSearch(""); // refresca búsqueda
      
    setFilteredHelados(prev =>
      prev.map(h =>
        h.id === id ? { ...h, cantidad: nuevaCantidad } : h
      )
      );
      
  };

  /* ================= ORDEN ================= */
  const ordenarPorNombre = () => {
    setFilteredHelados(prev =>
      [...prev].sort((a, b) => a.sabor.localeCompare(b.sabor))
    );
  };

  const ordenarPorCantidad = () => {
    setFilteredHelados(prev =>
      [...prev].sort((a, b) => a.cantidad - b.cantidad )
    );
  };

  useEffect(() => {
    fetchHelados();
  }, []);

  return (
    <HeladosContext.Provider
      value={{
        helados,
        filteredHelados,
        fetchHelados,
        handleSearch,
        updateHeladoCantidad,
        ordenarPorNombre,
        ordenarPorCantidad,
      }}
    >
      {children}
    </HeladosContext.Provider>
  );
};
