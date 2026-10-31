// components/costeo/BasesTab.js
// Gestiona las "bases" de helado (mezcla base + ingrediente principal)
// Una base es la receta base de la mezcla (ej: base de leche, base de agua)
// con sus ingredientes y cantidades por lote de N unidades.
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Alert, Modal, ScrollView,
} from "react-native";
import { useState } from "react";
import { useCosteo } from "../../context/CosteoContext";

const fmt = (n) => Math.round(Number(n ?? 0)).toLocaleString("es-CO");
const EMPTY_BASE = { nombre: "", descripcion: "", unidades_por_lote: "100" };
const EMPTY_ING  = { ingrediente_id: "", cantidad: "" };

export default function BasesTab() {
  const { bases, ingredientes, guardarBase, borrarBase } = useCosteo();

  // Modal principal (crear/editar base)
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY_BASE);
  const [editId,   setEditId]   = useState(null);
  const [lineas,   setLineas]   = useState([]); // [{ ingrediente_id, cantidad }]

  // Modal para añadir ingrediente a la base
  const [ingModal, setIngModal] = useState(false);
  const [ingForm,  setIngForm]  = useState(EMPTY_ING);

  // ── helpers ───────────────────────────────────────────────
  const nombreIng = (id) =>
    ingredientes.find((i) => i.id === Number(id))?.nombre ?? `#${id}`;

  const unidadIng = (id) =>
    ingredientes.find((i) => i.id === Number(id))?.unidad ?? "";

  const abrir = (base = null) => {
    setEditId(base?.id ?? null);
    setForm(base
      ? { nombre: base.nombre, descripcion: base.descripcion ?? "",
          unidades_por_lote: String(base.unidades_por_lote ?? 100) }
      : EMPTY_BASE
    );
    setLineas(base?.ingredientes ?? []);
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return Alert.alert("Nombre requerido");
    await guardarBase({
      ...form,
      unidades_por_lote: Number(form.unidades_por_lote) || 100,
      ingredientes: lineas,
    }, editId);
    setModal(false);
  };

  const borrar = (base) =>
    Alert.alert("Eliminar", `¿Eliminar la base "${base.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => borrarBase(base.id) },
    ]);

  const addIngLine = () => {
    if (!ingForm.ingrediente_id) return Alert.alert("Selecciona un ingrediente");
    setLineas(prev => [...prev, { ...ingForm, cantidad: Number(ingForm.cantidad) || 0 }]);
    setIngForm(EMPTY_ING);
    setIngModal(false);
  };

  const removeIng = (idx) =>
    setLineas(prev => prev.filter((_, i) => i !== idx));

  // ── costeo estimado de la base ─────────────────────────────
  const costoBase = lineas.reduce((acc, l) => {
    const ing = ingredientes.find(i => i.id === Number(l.ingrediente_id));
    return acc + (Number(l.cantidad) * Number(ing?.precio_unidad ?? 0));
  }, 0);

  // ── render ─────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <Pressable style={s.addBtn} onPress={() => abrir()}>
        <Text style={s.addBtnText}>+ Nueva base</Text>
      </Pressable>

      <FlatList
        data={bases}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <Text style={s.empty}>No hay bases definidas.</Text>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.cardNombre}>{item.nombre}</Text>
              {item.descripcion ? (
                <Text style={s.cardDesc}>{item.descripcion}</Text>
              ) : null}
              <Text style={s.cardDetalle}>
                {item.unidades_por_lote} unidades/lote
                {item.costo_por_unidad != null
                  ? `  ·  $${fmt(item.costo_por_unidad)} c/u`
                  : ""}
              </Text>
            </View>
            <Pressable onPress={() => abrir(item)} style={s.iconBtn}><Text>✏️</Text></Pressable>
            <Pressable onPress={() => borrar(item)} style={s.iconBtn}><Text>🗑️</Text></Pressable>
          </View>
        )}
      />

      {/* ── MODAL CREAR/EDITAR BASE ─────────────────────── */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.sheetTitle}>{editId ? "Editar" : "Nueva"} base</Text>

              <Text style={s.label}>Nombre de la base</Text>
              <TextInput style={s.input} value={form.nombre}
                onChangeText={v => setForm(f => ({ ...f, nombre: v }))}
                placeholder="ej: Base de leche entera" />

              <Text style={s.label}>Descripción (opcional)</Text>
              <TextInput style={s.input} value={form.descripcion}
                onChangeText={v => setForm(f => ({ ...f, descripcion: v }))}
                placeholder="Notas sobre esta base..." />

              <Text style={s.label}>Unidades por lote</Text>
              <TextInput style={s.input} value={form.unidades_por_lote}
                onChangeText={v => setForm(f => ({ ...f, unidades_por_lote: v }))}
                keyboardType="numeric" placeholder="100" />

              {/* Ingredientes del lote */}
              <View style={s.secHeader}>
                <Text style={s.secTitle}>🧪 Ingredientes del lote</Text>
                <Pressable style={s.addIngBtn} onPress={() => setIngModal(true)}>
                  <Text style={s.addIngBtnText}>+ Añadir</Text>
                </Pressable>
              </View>

              {lineas.length === 0 ? (
                <Text style={s.empty}>Sin ingredientes aún.</Text>
              ) : (
                lineas.map((l, i) => (
                  <View key={i} style={s.ingRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.ingNombre}>{nombreIng(l.ingrediente_id)}</Text>
                      <Text style={s.ingCant}>{l.cantidad} {unidadIng(l.ingrediente_id)}</Text>
                    </View>
                    <Pressable onPress={() => removeIng(i)} style={s.iconBtn}>
                      <Text style={{ color: "#e91e63" }}>✕</Text>
                    </Pressable>
                  </View>
                ))
              )}

              {lineas.length > 0 && (
                <View style={s.costoRow}>
                  <Text style={s.costoLabel}>Costo estimado del lote</Text>
                  <Text style={s.costoValor}>${fmt(costoBase)}</Text>
                </View>
              )}

              <View style={s.modalBtns}>
                <Pressable style={s.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={s.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable style={s.saveBtn} onPress={guardar}>
                  <Text style={s.saveBtnText}>Guardar base</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL AÑADIR INGREDIENTE ────────────────────── */}
      <Modal visible={ingModal} transparent animationType="fade" onRequestClose={() => setIngModal(false)}>
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.sheetTitle}>Añadir ingrediente</Text>

            <Text style={s.label}>Ingrediente</Text>
            <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
              {ingredientes.map(ing => (
                <Pressable
                  key={ing.id}
                  style={[s.ingOption, ingForm.ingrediente_id === ing.id && s.ingOptionSel]}
                  onPress={() => setIngForm(f => ({ ...f, ingrediente_id: ing.id }))}
                >
                  <Text style={[s.ingOptionText,
                    ingForm.ingrediente_id === ing.id && s.ingOptionTextSel]}>
                    {ing.nombre} ({ing.unidad})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={s.label}>Cantidad</Text>
            <TextInput style={s.input} value={ingForm.cantidad}
              onChangeText={v => setIngForm(f => ({ ...f, cantidad: v }))}
              keyboardType="numeric"
              placeholder={`en ${ingForm.ingrediente_id ? unidadIng(ingForm.ingrediente_id) : "unidad"}`}
            />

            <View style={s.modalBtns}>
              <Pressable style={s.cancelBtn} onPress={() => setIngModal(false)}>
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={addIngLine}>
                <Text style={s.saveBtnText}>Añadir</Text>
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
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardNombre: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  cardDesc:   { fontSize: 12, color: "#888", marginTop: 1 },
  cardDetalle: { fontSize: 12, color: "#666", marginTop: 4 },
  iconBtn: { padding: 6 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: "90%",
  },
  modalBox: {
    margin: 20, backgroundColor: "#fff", borderRadius: 20, padding: 20,
    maxHeight: "85%",
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  label: { fontSize: 12, color: "#666", fontWeight: "600", marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 10, fontSize: 14, backgroundColor: "#fafafa", marginTop: 4,
  },

  secHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 16, marginBottom: 8,
  },
  secTitle: { fontSize: 13, fontWeight: "700", color: "#333" },
  addIngBtn: {
    backgroundColor: "#fce4ec", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  addIngBtnText: { color: "#e91e63", fontWeight: "700", fontSize: 12 },

  ingRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f9f9f9", borderRadius: 10, padding: 10, marginBottom: 6,
  },
  ingNombre: { fontSize: 13, fontWeight: "600", color: "#333" },
  ingCant:   { fontSize: 12, color: "#888", marginTop: 2 },

  costoRow: {
    flexDirection: "row", justifyContent: "space-between",
    backgroundColor: "#fce4ec", borderRadius: 10, padding: 12, marginTop: 8,
  },
  costoLabel: { fontSize: 13, color: "#c2185b", fontWeight: "600" },
  costoValor: { fontSize: 13, color: "#c2185b", fontWeight: "800" },

  ingOption: {
    padding: 10, borderRadius: 8, marginBottom: 4, backgroundColor: "#f5f5f5",
  },
  ingOptionSel: { backgroundColor: "#fce4ec" },
  ingOptionText: { fontSize: 13, color: "#444" },
  ingOptionTextSel: { color: "#e91e63", fontWeight: "700" },

  modalBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#f5f5f5", alignItems: "center" },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#e91e63", alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
