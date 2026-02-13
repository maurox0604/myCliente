import { createContext, useState, useEffect } from "react";


export const HeladosContext = createContext();

export const HeladosProvider = ({ children }) => {
  const [helados, setHelados] = useState([]);
  const [filteredHelados, setFilteredHelados] = useState([]);
  const [loadingId, setLoadingId] = useState(null);


  /* ================= FETCH PRODUCTOS ACTIVOS ================= */
    const fetchHelados = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/productos/all`);
      
      console.log("SOLO FFFFETCH SOLO ACTIVOS")

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
        console.log("Dentro de Heladoscontext productos: ", productos)
        setHelados(productos);
        setFilteredHelados(productos);
    } catch (err) {
        console.error("❌ fetchHelados falló:", err);
        setHelados([]);
        setFilteredHelados([]);
    }
  };
  
  /* ================= FETCH PRODUCTOS ADMIN (ACTIVOS E INACTIVOS) ================= */
  const fetchHeladosAdmin = async () => {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/productos/admin` );
      console.log("SOLO FFFFETCH SOLO ADMIN")
    const data = await res.json();

    const productos = Array.isArray(data.productos)
      ? data.productos
      : [];

    setHelados(productos);
    setFilteredHelados(productos);

  } catch (err) {
    console.error("❌ fetchHeladosAdmin falló:", err);
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

  //================= ACTIVAR Y DESACTIVAR PRODUCTOS =================
  // Activar producto
  const activarProducto = async (id) => {
  try {
    await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/productos/${id}/activar`,
      { method: "PUT" }
    );

    setHelados(prev =>
      prev.map(h =>
        h.id === id ? { ...h, activo: 1 } : h
      )
    );

    setFilteredHelados(prev =>
      prev.map(h =>
        h.id === id ? { ...h, activo: 1 } : h
      )
    );

  } catch (err) {
    console.error("❌ Error activando producto:", err);
  }finally {
    setLoadingId(null);
  }
};


  // Desactivar producto
const desactivarProducto = async (id) => {
  try {
    await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/productos/${id}/desactivar`,
      { method: "PUT" }
    );

    setHelados(prev =>
      prev.map(h =>
        h.id === id ? { ...h, activo: 0 } : h
      )
    );

    setFilteredHelados(prev =>
      prev.map(h =>
        h.id === id ? { ...h, activo: 0 } : h
      )
    );

  } catch (err) {
    console.error("❌ Error desactivando producto:", err);
  }finally {
    setLoadingId(null);
  }
};



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
        activarProducto,
        desactivarProducto,
        loadingId,
        fetchHeladosAdmin,
      }}
    >
      {children}
    </HeladosContext.Provider>
  );
};
