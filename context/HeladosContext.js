import { createContext, useState, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useBootstrap } from "./BootstrapContext";

export const HeladosContext = createContext();

/**
 * HeladosProvider
 *
 * Cambios respecto a la versión anterior:
 * 1. El estado inicial viene del BootstrapContext — cero fetches extra al arrancar.
 * 2. El polling de 60 s solo corre cuando la app está en foreground.
 * 3. fetchHelados sigue disponible para refresco manual o desde otras pantallas.
 */
export const HeladosProvider = ({ children }) => {
  const { bootstrapData } = useBootstrap();

  const [helados, setHelados] = useState([]);
  const [filteredHelados, setFilteredHelados] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // ── Inicializar desde bootstrap ──────────────────────────────────────────
  useEffect(() => {
    if (!bootstrapData?.productos) return;

    setHelados(bootstrapData.productos);
    setFilteredHelados(bootstrapData.productos);
  }, [bootstrapData]);

  /* ================= FETCH PRODUCTOS ACTIVOS ================= */
  const fetchHelados = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/productos/all`,
      );

      if (!res.ok) {
        console.error("❌ Error HTTP:", res.status);
        return;
      }

      const data = await res.json();
      const productos = Array.isArray(data)
        ? data
        : Array.isArray(data.productos)
          ? data.productos
          : [];

      setHelados(productos);
      setFilteredHelados(productos);
    } catch (err) {
      console.error("❌ fetchHelados falló:", err.message);
    }
  };

  /* ================= FETCH PRODUCTOS ADMIN ================= */
  const fetchHeladosAdmin = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/productos/admin`,
      );
      const data = await res.json();
      const productos = Array.isArray(data.productos) ? data.productos : [];
      setHelados(productos);
      setFilteredHelados(productos);
    } catch (err) {
      console.error("❌ fetchHeladosAdmin falló:", err);
    }
  };

  /* ================= POLLING — solo en foreground ================= */
  const appState = useRef(AppState.currentState);
  const intervaloRef = useRef(null);

  const iniciarPolling = () => {
    if (intervaloRef.current) return; // ya activo
    intervaloRef.current = setInterval(fetchHelados, 60_000);
  };

  const detenerPolling = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  };

  useEffect(() => {
    // Arrancar polling solo si ya tenemos datos del bootstrap
    if (bootstrapData) iniciarPolling();

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        // Volvió al foreground → refrescar inmediatamente y reanudar polling
        fetchHelados();
        iniciarPolling();
      } else if (nextState.match(/inactive|background/)) {
        detenerPolling();
      }
      appState.current = nextState;
    });

    return () => {
      detenerPolling();
      subscription.remove();
    };
  }, [bootstrapData]); // re-evaluar cuando bootstrap esté listo

  /* ================= BUSCADOR ================= */
  const handleSearch = (text) => {
    if (!text) {
      setFilteredHelados(helados);
      return;
    }
    const filtered = helados.filter((h) =>
      h.sabor.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredHelados(filtered);
  };

  /* ================= UPDATE CANTIDAD ================= */
  const updateHeladoCantidad = (id, nuevaCantidad) => {
    const updater = (prev) =>
      prev.map((h) => (h.id === id ? { ...h, cantidad: nuevaCantidad } : h));
    setHelados(updater);
    setFilteredHelados(updater);
  };

  /* ================= ORDEN ================= */
  const ordenarPorNombre = () => {
    setFilteredHelados((prev) =>
      [...prev].sort((a, b) => a.sabor.localeCompare(b.sabor)),
    );
  };

  const ordenarPorCantidad = () => {
    setFilteredHelados((prev) =>
      [...prev].sort((a, b) => a.cantidad - b.cantidad),
    );
  };

  /* ================= ACTIVAR / DESACTIVAR ================= */
  const _toggleActivo = (id, valor) => {
    const updater = (prev) =>
      prev.map((h) => (h.id === id ? { ...h, activo: valor } : h));
    setHelados(updater);
    setFilteredHelados(updater);
  };

  const activarProducto = async (id) => {
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/productos/${id}/activar`,
        { method: "PUT" },
      );
      _toggleActivo(id, 1);
    } catch (err) {
      console.error("❌ Error activando producto:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const desactivarProducto = async (id) => {
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/productos/${id}/desactivar`,
        { method: "PUT" },
      );
      _toggleActivo(id, 0);
    } catch (err) {
      console.error("❌ Error desactivando producto:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <HeladosContext.Provider
      value={{
        helados,
        filteredHelados,
        fetchHelados,
        fetchHeladosAdmin,
        handleSearch,
        updateHeladoCantidad,
        ordenarPorNombre,
        ordenarPorCantidad,
        activarProducto,
        desactivarProducto,
        loadingId,
      }}
    >
      {children}
    </HeladosContext.Provider>
  );
};
