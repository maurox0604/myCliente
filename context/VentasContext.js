import { createContext, useContext, useState } from "react";
import { cargarVentas } from "../api/ventas.api";
import { getAuth } from "firebase/auth";

export const VentaContext = createContext();

export const useVentas = () => {
  const context = useContext(VentaContext);
  if (!context)
    throw new Error("useVentas must be used within a VentasContextProvider");
  return context;
};

const getToken = async () => {
  const auth = getAuth();
  return await auth.currentUser?.getIdToken();
};

const API = process.env.EXPO_PUBLIC_API_URL;

export const VentasContextProvider = ({ children }) => {
  const [ventas, setVentas] = useState([]);
  const [modoVenta, setModoVenta] = useState("normal");
  const [fechaManual, setFechaManual] = useState(null);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [lastRange, setLastRange] = useState(null);

  const activarVentaManual = (fecha) => {
    setModoVenta("manual");
    setFechaManual(fecha);
  };
  const activarVentaNormal = () => {
    setModoVenta("normal");
    setFechaManual(null);
  };

  const loadVentas = async () => {
    if (loadingVentas) return;
    setLoadingVentas(true);
    try {
      const ventasData = await cargarVentas();
      if (ventasData) setVentas(ventasData);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    } finally {
      setLoadingVentas(false);
    }
  };

  const loadVentasByDateRange = async (startDate, endDate, force = false) => {
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];
    const rangeKey = `${start}_${end}`;

    if (loadingVentas) return;
    if (!force && lastRange === rangeKey) return;

    setLastRange(rangeKey);
    setLoadingVentas(true);

    try {
      const token = await getToken();
      const response = await fetch(`${API}/ventas?start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setVentas(data.ventas ?? []);
    } catch (error) {
      console.error("Error al cargar ventas por rango:", error);
    } finally {
      setLoadingVentas(false);
    }
  };

  const sortVentas = (criterion) => {
    const sortedVentas = [...ventas];
    if (criterion === "fecha") {
      sortedVentas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    } else if (criterion === "producto") {
      sortedVentas.sort((a, b) => b.cantidad - a.cantidad);
    }
    setVentas(sortedVentas);
  };

  // ─────────────────────────────────────────────
  // NUEVAS: edición de facturas e ítems
  // ─────────────────────────────────────────────

  // Editar fecha o sede de una factura
  // body: { fecha?, id_sede? }
  const editarFactura = async (id_factura, body) => {
    const token = await getToken();
    const res = await fetch(`${API}/ventas/factura/${id_factura}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al editar factura");
    }
    return await res.json();
  };

  // Cancelar (soft delete) una factura completa
  const cancelarFactura = async (id_factura) => {
    const token = await getToken();
    const res = await fetch(`${API}/ventas/factura/${id_factura}/cancelar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al cancelar factura");
    }
    return await res.json();
  };

  // Editar un ítem: { id_helado?, cantidad?, motivo? }
  const editarItem = async (id_item, body) => {
    const token = await getToken();
    const res = await fetch(`${API}/ventas/item/${id_item}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al editar ítem");
    }
    return await res.json();
  };

  // Cancelar (soft delete) un ítem individual
  const cancelarItem = async (id_item) => {
    const token = await getToken();
    const res = await fetch(`${API}/ventas/item/${id_item}/cancelar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al cancelar ítem");
    }
    return await res.json();
  };

  return (
    <VentaContext.Provider
      value={{
        ventas,
        setVentas,
        loadVentas,
        loadVentasByDateRange,
        sortVentas,
        loadingVentas,
        modoVenta,
        fechaManual,
        activarVentaManual,
        activarVentaNormal,
        // nuevas
        editarFactura,
        cancelarFactura,
        editarItem,
        cancelarItem,
      }}
    >
      {children}
    </VentaContext.Provider>
  );
};
