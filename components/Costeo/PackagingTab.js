// components/costeo/PackagingTab.js
// Gestiona los materiales de empaque: vasos, palitos, bolsas, stickers, etc.
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Alert, Modal,
} from "react-native";
import { useState } from "react";
import { useCosteo } from "../../context/CosteoContext";

const TIPOS = ["vaso", "palito", "bolsa", "sticker", "tapa", "etiqueta", "otro"];
const EMPTY  = { nombre: "", tipo: "vaso", costo_unitario: "", proveedor: "", notas: "" };

const TIPO_ICON = {
  vaso: "🥤", palito: "🍡", bolsa: "🛍️", sticker: "🏷️",
  tapa: "🔵", etiqueta: "📋", otro: "📦",
};

export default function PackagingTab() {
  const { packaging, guardarPackaging, borrarPackaging } = useCosteo();
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const abrir = (item = null) => {
    setEditId(item?.id ?? null);
    setForm(item
      ? {
          nombre: item.nombre,
          tipo: item.tipo ?? "otro",
          costo_unitario: String(item.costo_unitario),
          proveedor: item.proveedor ?? "",
          notas: item.notas ?? "",
        }
      : EMPTY
    );
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return Alert.alert("Nombre requerido");
    await guardarPackaging({
      ...form,
      costo_unitario: Number(form.costo_unitario) || 0,
    }, editId);
    setModal(false);
  };

  const borrar = (item) =>
    Alert.alert("Eliminar", `¿Eliminar "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => borrarPackaging(item.id) },
    ]);

  return (
    <View style={s.container}>
      <Pressable style={s.addBtn} onPress={() => abrir()}>
        <Text style={s.addBtnText}>+ Nuevo material de empaque</Text>
      </Pressable>

      <FlatList
        data={packaging}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <Text style={s.empty}>No hay materiales de empaque definidos.</Text>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.icon}>{TIPO_ICON[item.tipo] ?? "📦"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.nombre}>{item.nombre}</Text>
              <Text style={s.detalle}>
                ${Number(item.costo_unitario).toLocaleString("es-CO", { minimumFractionDigits: 0 })} / unidad
                {item.proveedor ? `  ·  ${item.proveedor}` : ""}
              </Text>
              {item.notas ? <Text style={s.notas}>{item.notas}</Text> : null}
            </View>
            <Pressable onPress={() => abrir(item)} style={s.iconBtn}><Text>✏️</Text></Pressable>
            <Pressable onPress={() => borrar(item)} style={s.iconBtn}><Text>🗑️</Text></Pressable>
          </View>
        )}
      />

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>{editId ? "Editar" : "Nuevo"} empaque</Text>

            <Text style={s.label}>Nombre</Text>
            <TextInput style={s.input} value={form.nombre}
              onChangeText={v => setForm(f => ({ ...f, nombre: v }))}
              placeholder="ej: Vaso plástico 100ml" />

            <Text style={s.label}>Tipo</Text>
            <View style={s.chipRow}>
              {TIPOS.map(t => (
                <Pressable key={t}
                  style={[s.chip, form.tipo === t && s.chipActivo]}
                  onPress={() => setForm(f => ({ ...f, tipo: t }))}
                >
                  <Text style={[s.chipText, form.tipo === t && s.chipTextActivo]}>
                    {TIPO_ICON[t]} {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.label}>Costo por unidad ($)</Text>
            <TextInput style={s.input} value={form.costo_unitario}
              onChangeText={v => setForm(f => ({ ...f, costo_unitario: v }))}
              keyboardType="numeric" placeholder="350" />

            <Text style={s.label}>Proveedor (opcional)</Text>
            <TextInput style={s.input} value={form.proveedor}
              onChangeText={v => setForm(f => ({ ...f, proveedor: v }))}
              placeholder="ej: Empaques del Valle" />

            <Text style={s.label}>Notas (opcional)</Text>
            <TextInput style={s.input} value={form.notas}
              onChangeText={v => setForm(f => ({ ...f, notas: v }))}
              placeholder="ej: Ref. 4820-B" />

            <View style={s.modalBtns}>
              <Pressable style={s.cancelBtn} onPress={() => setModal(false)}>
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={guardar}>
                <Text style={s.saveBtnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  addBtn: {
    margin: 12, backgroundColor: "#e91e63", borderRadius: 10,
    paddingVertical: 12, alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  empty: { textAlign: "center", color: "#aaa", fontSize: 13, marginTop: 20 },

  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 10,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  icon:    { fontSize: 24 },
  nombre:  { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  detalle: { fontSize: 12, color: "#777", marginTop: 2 },
  notas:   { fontSize: 11, color: "#aaa", marginTop: 2, fontStyle: "italic" },
  iconBtn: { padding: 6 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalBox: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20,
    maxHeight: "90%",
  },
  modalTitle: { fontSize: 17, fontWeight: "800", marginBottom: 8 },
  label: { fontSize: 12, color: "#666", fontWeight: "600", marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 10, fontSize: 14, backgroundColor: "#fafafa", marginTop: 4,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#f0f0f0" },
  chipActivo: { backgroundColor: "#fce4ec" },
  chipText: { fontSize: 12, color: "#666" },
  chipTextActivo: { color: "#e91e63", fontWeight: "700" },

  modalBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#f5f5f5", alignItems: "center" },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#e91e63", alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
