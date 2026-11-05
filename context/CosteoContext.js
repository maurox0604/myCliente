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
  const guardarIngrediente = async (data, id = null) => {
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API}/api/costeo/ingredientes/${id}`
      : `${API}/api/costeo/ingredientes`;
    await fetch(url, {
      method,
      headers: await headers(),
      body: JSON.stringify(data),
    });
    await fetchIngredientes();
  };

  const borrarIngrediente = async (id) => {
    await fetch(`${API}/api/costeo/ingredientes/${id}`, {
      method: "DELETE",
      headers: await headers(),
    });
    await fetchIngredientes();
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
    await fetch(url, {
      method,
      headers: await headers(),
      body: JSON.stringify(data),
    });
    await fetchBases();
  };

  const borrarBase = async (id) => {
    await fetch(`${API}/api/costeo/bases/${id}`, {
      method: "DELETE",
      headers: await headers(),
    });
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
  const guardarReceta = async (helado_id, data) => {
    await fetch(`${API}/api/costeo/recetas/${helado_id}`, {
      method: "POST",
      headers: await headers(),
      body: JSON.stringify(data),
    });
    await fetchRecetas();
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
