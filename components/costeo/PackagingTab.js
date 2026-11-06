import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert,
} from "react-native";
import { useCosteo } from "../../context/CosteoContext";

const TIPOS = ["vaso", "cono", "tapa", "cuchara", "servilleta", "bolsa", "otro"];

const EMPTY = { nombre: "", tipo: "vaso", precio_compra: "", cantidad_compra: "" };

const fmt = (val) => {
  const n = Number(val);
  if (isNaN(n) || n === 0) return "—";
  return n % 1 === 0
    ? n.toLocaleString()
    : n.toFixed(2).replace(/\.?0+$/, "");
};

export default function PackagingTab() {
  const { packaging, guardarPackaging, borrarPackaging } = useCosteo();
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);

  const precioUnitario = () => {
    const c = Number(form.precio_compra);
    const q = Number(form.cantidad_compra);
    if (!c || !q || q === 0) return null;
    return c / q;
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      Alert.alert("Falta el nombre del packaging");
      return;
    }
    if (!form.precio_compra || !form.cantidad_compra) {
      Alert.alert("Ingresa el precio y cantidad de compra");
      return;
    }
    try {
      await guardarPackaging(
        {
          nombre:          form.nombre.trim(),
          tipo:            form.tipo,
          precio_compra:   Number(form.precio_compra),
          cantidad_compra: Number(form.cantidad_compra),
        },
        editId
      );
      setForm(EMPTY);
      setEditId(null);
      setShowForm(false);
    } catch (e) {
      Alert.alert("Error al guardar", e.message);
    }
  };

  const handleEdit = (item) => {
    setForm({
      nombre:          item.nombre,
      tipo:            item.tipo ?? "vaso",
      precio_compra:   String(item.precio_compra ?? ""),
      cantidad_compra: String(item.cantidad_compra ?? ""),
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Eliminar packaging",
      `¿Eliminar "${item.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => borrarPackaging(item.id) },
      ]
    );
  };

  const pu = precioUnitario();

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Packaging</Text>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => { setForm(EMPTY); setEditId(null); setShowForm(!showForm); }}
        >
          <Text style={s.addBtnTxt}>{showForm ? "✕ Cerrar" : "+ Agregar"}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={s.form}>
          <Text style={s.label}>Nombre</Text>
          <TextInput
            style={s.input}
            value={form.nombre}
            onChangeText={(v) => setForm({ ...form, nombre: v })}
            placeholder="ej. Vaso 8oz"
          />

          <Text style={s.label}>Tipo</Text>
          <View style={s.tiposRow}>
            {TIPOS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.tipoBadge, form.tipo === t && s.tipoBadgeActive]}
                onPress={() => setForm({ ...form, tipo: t })}
              >
                <Text style={[s.tipoTxt, form.tipo === t && s.tipoTxtActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Precio de compra total ($)</Text>
          <TextInput
            style={s.input}
            value={form.precio_compra}
            onChangeText={(v) => setForm({ ...form, precio_compra: v })}
            keyboardType="decimal-pad"
            placeholder="ej. 5000"
          />

          <Text style={s.label}>Cantidad comprada (unidades)</Text>
          <TextInput
            style={s.input}
            value={form.cantidad_compra}
            onChangeText={(v) => setForm({ ...form, cantidad_compra: v })}
            keyboardType="decimal-pad"
            placeholder="ej. 100"
          />

          {pu !== null && (
            <View style={s.calcBox}>
              <Text style={s.calcTxt}>
                💰 Precio por unidad: <Text style={s.calcVal}>${fmt(pu)}</Text>
              </Text>
            </View>
          )}

          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveBtnTxt}>{editId ? "Actualizar" : "Guardar"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={packaging}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const pu_item = item.precio_compra && item.cantidad_compra
            ? Number(item.precio_compra) / Number(item.cantidad_compra)
            : Number(item.precio_unidad ?? 0);
          return (
            <View style={s.row}>
              <View style={s.rowInfo}>
                <Text style={s.rowNombre}>{item.nombre}</Text>
                <Text style={s.rowSub}>
                  {item.tipo} · ${fmt(pu_item)} / unidad
                  {item.precio_compra
                    ? `  (${fmt(item.precio_compra)} × ${fmt(item.cantidad_compra)} und)`
                    : ""}
                </Text>
              </View>
              <View style={s.rowActions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={s.iconBtn}>
                  <Text>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={s.iconBtn}>
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={s.empty}>Sin packaging. Agrega vasos, conos, tapas…</Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: "row", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 12 },
  title:          { fontSize: 18, fontWeight: "700", color: "#1a1a2e" },
  addBtn:         { backgroundColor: "#4a90d9", paddingHorizontal: 14,
                    paddingVertical: 8, borderRadius: 8 },
  addBtnTxt:      { color: "#fff", fontWeight: "600" },
  form:           { backgroundColor: "#f8f9fa", borderRadius: 10, padding: 16,
                    marginBottom: 16, borderWidth: 1, borderColor: "#e0e0e0" },
  label:          { fontSize: 13, color: "#555", marginBottom: 4, marginTop: 10 },
  input:          { borderWidth: 1, borderColor: "#ddd", borderRadius: 8,
                    paddingHorizontal: 12, paddingVertical: 8, fontSize: 15,
                    backgroundColor: "#fff" },
  tiposRow:       { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  tipoBadge:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
                    backgroundColor: "#e9ecef", borderWidth: 1, borderColor: "#ddd" },
  tipoBadgeActive:{ backgroundColor: "#4a90d9", borderColor: "#4a90d9" },
  tipoTxt:        { fontSize: 12, color: "#555" },
  tipoTxtActive:  { color: "#fff", fontWeight: "600" },
  calcBox:        { backgroundColor: "#e8f4e8", borderRadius: 8, padding: 10,
                    marginTop: 12 },
  calcTxt:        { fontSize: 13, color: "#2d7a2d" },
  calcVal:        { fontWeight: "700" },
  saveBtn:        { backgroundColor: "#2ecc71", borderRadius: 10, padding: 14,
                    alignItems: "center", marginTop: 16 },
  saveBtnTxt:     { color: "#fff", fontWeight: "700", fontSize: 15 },
  row:            { flexDirection: "row", alignItems: "center", paddingVertical: 12,
                    borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  rowInfo:        { flex: 1 },
  rowNombre:      { fontSize: 15, fontWeight: "600", color: "#1a1a2e" },
  rowSub:         { fontSize: 12, color: "#777", marginTop: 2 },
  rowActions:     { flexDirection: "row", gap: 8 },
  iconBtn:        { padding: 6 },
  empty:          { textAlign: "center", color: "#aaa", paddingVertical: 30 },
});
