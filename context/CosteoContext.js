import { createContext, useContext, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";

const API = process.env.EXPO_PUBLIC_API_URL;

export const CosteoContext = createContext();

export function CosteoProvider({ children }) {
  const { user } = useContext(AuthContext);

  const [ingredientes, setIngredientes] = useState([]);
  const [preparaciones, setPreparaciones] = useState([]);
  const [packaging, setPackaging] = useState([]);
  const [bases, setBases] = useState([]);
  const [costosFijos, setCostosFijos] = useState(null);
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(false);

  const getToken = async () => user?.getIdToken();

  const headers = async () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${await getToken()}`,
  });

  // Lanza Error con el mensaje del servidor si la respuesta no es 2xx.
  // (lo usan ingredientes, bases y recetas; el resto de CRUDs queda como estaba)
  const assertOk = async (res, fallback) => {
    if (res.ok) return;
    let msg = fallback;
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch (_) {}
    throw new Error(msg);
  };

  // ── fetch helpers ─────────────────────────────────────────
  const fetchIngredientes = useCallback(async () => {
    const res = await fetch(`${API}/api/costeo/ingredientes`, {
      headers: await headers(),
    });
    const data = await res.json();
    setIngredientes(Array.isArray(data) ? data : []);
  }, [user]);

  const fetchPreparaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/costeo/preparaciones`, {
        headers: await headers(),
      });
      const data = await res.json();
      setPreparaciones(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("No se pudieron cargar preparaciones:", e);
    }
  }, [user]);

  const fetchPackaging = useCallback(async () => {
    const res = await fetch(`${API}/api/costeo/packaging`, {
      headers: await headers(),
    });
    const data = await res.json();
    setPackaging(Array.isArray(data) ? data : []);
  }, [user]);

  const fetchBases = useCallback(async () => {
    const res = await fetch(`${API}/api/costeo/bases`, {
      headers: await headers(),
    });
    const data = await res.json();
    setBases(Array.isArray(data) ? data : []);
  }, [user]);

  const fetchCostosFijos = useCallback(async () => {
    const res = await fetch(`${API}/api/costeo/costos-fijos`, {
      headers: await headers(),
    });
    const data = await res.json();
    setCostosFijos(data);
  }, [user]);

  const fetchRecetas = useCallback(async () => {
    const res = await fetch(`${API}/api/costeo/recetas`, {
      headers: await headers(),
    });
    const data = await res.json();
    setRecetas(Array.isArray(data) ? data : []);
  }, [user]);

  const fetchRecetaDetalle = useCallback(
    async (helado_id) => {
      const res = await fetch(`${API}/api/costeo/recetas/${helado_id}`, {
        headers: await headers(),
      });
      if (!res.ok) return null;
      return await res.json();
    },
    [user],
  );

  // Carga inicial del módulo
  const initCosteo = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchIngredientes(),
        fetchPreparaciones(),
        fetchPackaging(),
        fetchBases(),
        fetchCostosFijos(),
        fetchRecetas(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [
    fetchIngredientes,
    fetchPreparaciones,
    fetchPackaging,
    fetchBases,
    fetchCostosFijos,
    fetchRecetas,
  ]);

  // ── INGREDIENTES CRUD ────────────────────────────────────
  // Cambiar el precio de un ingrediente cambia el costo de preparaciones y bases
  // (los calcula el servidor): se recargan para no mostrar costos viejos.
  const refrescarPorIngrediente = async () => {
    await fetchIngredientes();
    try {
      await Promise.all([fetchPreparaciones(), fetchBases()]);
    } catch (_) {}
  };

  const guardarIngrediente = async (data, id = null) => {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API}/api/costeo/ingredientes/${id}`
      : `${API}/api/costeo/ingredientes`;
    const res = await fetch(url, {
      method,
      headers: await headers(),
      body: JSON.stringify(data),
    });
    await assertOk(res, "No se pudo guardar el ingrediente");
    await refrescarPorIngrediente();
  };

  const borrarIngrediente = async (id) => {
    const res = await fetch(`${API}/api/costeo/ingredientes/${id}`, {
      method: "DELETE",
      headers: await headers(),
    });
    await assertOk(res, "No se pudo eliminar el ingrediente");
    await refrescarPorIngrediente();
  };

  // ── PREPARACIONES CRUD ───────────────────────────────────
  const guardarPreparacion = async (data, id = null) => {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API}/api/costeo/preparaciones/${id}`
      : `${API}/api/costeo/preparaciones`;
    await fetch(url, {
      method,
      headers: await headers(),
      body: JSON.stringify(data),
    });
    await fetchPreparaciones();
  };

  const borrarPreparacion = async (id) => {
    await fetch(`${API}/api/costeo/preparaciones/${id}`, {
      method: "DELETE",
      headers: await headers(),
    });
    await fetchPreparaciones();
  };

  // ── PACKAGING CRUD ───────────────────────────────────────
  const guardarPackaging = async (data, id = null) => {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API}/api/costeo/packaging/${id}`
      : `${API}/api/costeo/packaging`;
    await fetch(url, {
      method,
      headers: await headers(),
      body: JSON.stringify(data),
    });
    await fetchPackaging();
  };

  const borrarPackaging = async (id) => {
    await fetch(`${API}/api/costeo/packaging/${id}`, {
      method: "DELETE",
      headers: await headers(),
    });
    await fetchPackaging();
  };

  // ── BASES CRUD ───────────────────────────────────────────
  const guardarBase = async (data, id = null) => {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API}/api/costeo/bases/${id}`
      : `${API}/api/costeo/bases`;
    const res = await fetch(url, {
      method,
      headers: await headers(),
      body: JSON.stringify(data),
    });
    await assertOk(res, "No se pudo guardar la base");
    await fetchBases();
  };

  const borrarBase = async (id) => {
    const res = await fetch(`${API}/api/costeo/bases/${id}`, {
      method: "DELETE",
      headers: await headers(),
    });
    await assertOk(res, "No se pudo eliminar la base");
    await fetchBases();
  };

  // ── COSTOS FIJOS CRUD ────────────────────────────────────
  const guardarCostoFijo = async (data, id = null) => {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API}/api/costeo/costos-fijos/${id}`
      : `${API}/api/costeo/costos-fijos`;
    await fetch(url, {
      method,
      headers: await headers(),
      body: JSON.stringify(data),
    });
    await fetchCostosFijos();
  };

  const borrarCostoFijo = async (id) => {
    await fetch(`${API}/api/costeo/costos-fijos/${id}`, {
      method: "DELETE",
      headers: await headers(),
    });
    await fetchCostosFijos();
  };

  const actualizarUnidadesMes = async (unidades_mes) => {
    await fetch(`${API}/api/costeo/costos-fijos/config/unidades-mes`, {
      method: "PUT",
      headers: await headers(),
      body: JSON.stringify({ unidades_mes }),
    });
    await fetchCostosFijos();
  };

  // ── RECETAS ──────────────────────────────────────────────
  // Lanza Error si el servidor rechaza la receta (RecetasTab muestra el mensaje).
  const guardarReceta = async (helado_id, data) => {
    const res = await fetch(`${API}/api/costeo/recetas/${helado_id}`, {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify(data),
    });
    await assertOk(res, "No se pudo guardar la receta");
    await fetchRecetas();
    return await res.json();
  };

  return (
    <CosteoContext.Provider
      value={{
        ingredientes,
        preparaciones,
        packaging,
        bases,
        costosFijos,
        recetas,
        loading,
        initCosteo,
        fetchIngredientes,
        fetchPreparaciones,
        fetchPackaging,
        fetchBases,
        fetchCostosFijos,
        fetchRecetas,
        fetchRecetaDetalle,
        guardarIngrediente,
        borrarIngrediente,
        guardarPreparacion,
        borrarPreparacion,
        guardarPackaging,
        borrarPackaging,
        guardarBase,
        borrarBase,
        guardarCostoFijo,
        borrarCostoFijo,
        actualizarUnidadesMes,
        guardarReceta,
      }}
    >
      {children}
    </CosteoContext.Provider>
  );
}

export const useCosteo = () => useContext(CosteoContext);
