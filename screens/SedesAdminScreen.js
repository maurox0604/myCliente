import { useState, useEffect } from "react";
import { Platform } from "react-native";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";

const API = process.env.EXPO_PUBLIC_API_URL;

const showAlert = (title, msg) => {
  if (Platform.OS === "web") window.alert(`${title}\n${msg}`);
};

export default function SedesAdminScreen() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaNombre, setNueva] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null); // { id, nombre }

  const fetchSedes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/sedes`);
      const data = await res.json();
      setSedes(Array.isArray(data) ? data : []);
    } catch (e) {
      showAlert("Error", "No se pudieron cargar las sedes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  /* ── Crear ── */
  const crearSede = async () => {
    if (!nuevaNombre.trim()) return;
    try {
      setGuardando(true);
      const res = await fetch(`${API}/sedes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevaNombre.trim() }),
      });
      if (!res.ok) throw new Error();
      setNueva("");
      fetchSedes();
    } catch {
      showAlert("Error", "No se pudo crear la sede");
    } finally {
      setGuardando(false);
    }
  };

  /* ── Editar ── */
  const guardarEdicion = async () => {
    if (!editando?.nombre.trim()) return;
    try {
      setGuardando(true);
      const res = await fetch(`${API}/sedes/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: editando.nombre.trim() }),
      });
      if (!res.ok) throw new Error();
      setEditando(null);
      fetchSedes();
    } catch {
      showAlert("Error", "No se pudo actualizar la sede");
    } finally {
      setGuardando(false);
    }
  };

  /* ── Toggle activo ── */
  const toggleSede = async (id, activo) => {
    try {
      await fetch(`${API}/sedes/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo }),
      });
      setSedes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, activo: activo ? 1 : 0 } : s)),
      );
    } catch {
      showAlert("Error", "No se pudo cambiar el estado");
    }
  };

  return (
    <View style={s.container}>
      {/* ── CREAR NUEVA SEDE ── */}
      <View style={s.card}>
        <Text style={s.cardTitle}>➕ Nueva sede</Text>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            placeholder="Nombre de la sede..."
            placeholderTextColor="#bbb"
            value={nuevaNombre}
            onChangeText={setNueva}
          />
          <Pressable
            onPress={crearSede}
            disabled={guardando || !nuevaNombre.trim()}
            style={[
              s.btnCrear,
              (!nuevaNombre.trim() || guardando) && s.btnDisabled,
            ]}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.btnCrearTxt}>Crear</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* ── LISTA ── */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#e91e63" />
      ) : (
        <FlatList
          data={sedes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 90 }}
          ListEmptyComponent={
            <Text style={s.empty}>No hay sedes registradas</Text>
          }
          renderItem={({ item }) => (
            <View style={[s.row, !item.activo && s.rowInactivo]}>
              {editando?.id === item.id ? (
                /* ── Modo edición ── */
                <View style={s.editRow}>
                  <TextInput
                    style={s.inputEdit}
                    value={editando.nombre}
                    onChangeText={(t) =>
                      setEditando({ ...editando, nombre: t })
                    }
                    autoFocus
                  />
                  <Pressable onPress={guardarEdicion} style={s.btnSave}>
                    <Text style={s.btnSaveTxt}>✓</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setEditando(null)}
                    style={s.btnCancel}
                  >
                    <Text style={s.btnCancelTxt}>✕</Text>
                  </Pressable>
                </View>
              ) : (
                /* ── Modo lectura ── */
                <>
                  <View style={{ flex: 1 }}>
                    <Text style={s.nombre}>{item.nombre}</Text>
                    <Text
                      style={[
                        s.estado,
                        { color: item.activo ? "#2e7d32" : "#c62828" },
                      ]}
                    >
                      {item.activo ? "● Activa" : "● Inactiva"}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      setEditando({ id: item.id, nombre: item.nombre })
                    }
                    style={s.btnEdit}
                  >
                    <Text style={s.btnEditTxt}>✏️</Text>
                  </Pressable>

                  <Switch
                    value={item.activo === 1}
                    onValueChange={(val) => toggleSede(item.id, val)}
                    trackColor={{ false: "#eee", true: "#a5d6a7" }}
                    thumbColor={item.activo ? "#2e7d32" : "#bbb"}
                  />
                </>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fafafa",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#eee",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  inputRow: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    color: "#333",
  },
  btnCrear: {
    backgroundColor: "#e91e63",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  btnDisabled: { backgroundColor: "#ccc" },
  btnCrearTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: "#f0f0f0",
  },
  rowInactivo: { opacity: 0.5 },
  nombre: { fontSize: 16, fontWeight: "600", color: "#222" },
  estado: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  btnEdit: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  btnEditTxt: { fontSize: 16 },
  editRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  inputEdit: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e91e63",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 15,
  },
  btnSave: {
    backgroundColor: "#2e7d32",
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSaveTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  btnCancel: {
    backgroundColor: "#c62828",
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  empty: { textAlign: "center", color: "#bbb", marginTop: 40 },
});
