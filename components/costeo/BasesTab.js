// components/costeo/BasesTab.js
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useCosteo } from "../../context/CosteoContext";

const fmt = (n) => Math.round(Number(n ?? 0)).toLocaleString("es-CO");
const EMPTY_BASE = { nombre: "", descripcion: "" };
const EMPTY_ING = {
  tipo: "ingrediente",
  ingrediente_id: "",
  prep_ingrediente_id: "",
  cantidad: "",
};

export default function BasesTab() {
  const { bases, ingredientes, preparaciones, guardarBase, borrarBase } =
    useCosteo();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_BASE);
  const [editId, setEditId] = useState(null);
  const [lineas, setLineas] = useState([]);

  const [ingModal, setIngModal] = useState(false);
  const [ingForm, setIngForm] = useState(EMPTY_ING);

  // ── helpers ───────────────────────────────────────────────
  const nombreIng = (id) =>
    ingredientes.find((i) => i.id === Number(id))?.nombre ?? `#${id}`;
  const unidadIng = (id) =>
    ingredientes.find((i) => i.id === Number(id))?.unidad ?? "";
  const nombrePrep = (id) =>
    preparaciones.find((p) => p.id === Number(id))?.nombre ?? `prep#${id}`;
  const unidadPrep = (id) =>
    preparaciones.find((p) => p.id === Number(id))?.unidad ?? "";

  const abrir = (base = null) => {
    setEditId(base?.id ?? null);
    setForm(
      base
        ? { nombre: base.nombre, descripcion: base.descripcion ?? "" }
        : EMPTY_BASE,
    );
    setLineas(base?.ingredientes ?? []);
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return Alert.alert("Nombre requerido");
    await guardarBase({ ...form, ingredientes: lineas }, editId);
    setModal(false);
  };

  const borrar = (base) =>
    Alert.alert("Eliminar", `¿Eliminar la base "${base.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => borrarBase(base.id),
      },
    ]);

  const addIngLine = () => {
    if (ingForm.tipo === "ingrediente" && !ingForm.ingrediente_id)
      return Alert.alert("Selecciona un ingrediente");
    if (ingForm.tipo === "preparacion" && !ingForm.prep_ingrediente_id)
      return Alert.alert("Selecciona una preparación");
    if (!ingForm.cantidad) return Alert.alert("Ingresa la cantidad");
    setLineas((prev) => [
      ...prev,
      {
        tipo: ingForm.tipo,
        ingrediente_id:
          ingForm.tipo === "ingrediente"
            ? Number(ingForm.ingrediente_id)
            : null,
        prep_ingrediente_id:
          ingForm.tipo === "preparacion"
            ? Number(ingForm.prep_ingrediente_id)
            : null,
        cantidad: Number(ingForm.cantidad) || 0,
      },
    ]);
    setIngForm(EMPTY_ING);
    setIngModal(false);
  };

  const removeIng = (idx) =>
    setLineas((prev) => prev.filter((_, i) => i !== idx));

  // ── costeo estimado ────────────────────────────────────────
  const costoBase = lineas.reduce((acc, l) => {
    if (l.tipo === "ingrediente" || l.ingrediente_id) {
      const ing = ingredientes.find((i) => i.id === Number(l.ingrediente_id));
      return acc + Number(l.cantidad) * Number(ing?.precio_unidad ?? 0);
    } else {
      const prep = preparaciones.find(
        (p) => p.id === Number(l.prep_ingrediente_id),
      );
      return acc + Number(l.cantidad) * Number(prep?.costo_por_gr ?? 0);
    }
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
                {item.costo_lote != null
                  ? `Costo del lote: $${fmt(item.costo_lote)}`
                  : ""}
              </Text>
            </View>
            <Pressable onPress={() => abrir(item)} style={s.iconBtn}>
              <Text>✏️</Text>
            </Pressable>
            <Pressable onPress={() => borrar(item)} style={s.iconBtn}>
              <Text>🗑️</Text>
            </Pressable>
          </View>
        )}
      />

      {/* ── MODAL CREAR/EDITAR BASE ─────────────────────── */}
      <Modal
        visible={modal}
        transparent
        animationType="slide"
        onRequestClose={() => setModal(false)}
      >
        <View style={s.overlay}>
          <View style={s.sheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.sheetTitle}>
                {editId ? "Editar" : "Nueva"} base
              </Text>

              <Text style={s.label}>Nombre de la base</Text>
              <TextInput
                style={s.input}
                value={form.nombre}
                onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))}
                placeholder="ej: Base de leche entera"
              />

              <Text style={s.label}>Descripción (opcional)</Text>
              <TextInput
                style={s.input}
                value={form.descripcion}
                onChangeText={(v) => setForm((f) => ({ ...f, descripcion: v }))}
                placeholder="Notas sobre esta base..."
              />

              {/* Ingredientes del lote */}
              <View style={s.secHeader}>
                <Text style={s.secTitle}>🧪 Ingredientes del lote</Text>
                <Pressable
                  style={s.addIngBtn}
                  onPress={() => {
                    setIngForm(EMPTY_ING);
                    setIngModal(true);
                  }}
                >
                  <Text style={s.addIngBtnText}>+ Añadir</Text>
                </Pressable>
              </View>

              {lineas.length === 0 ? (
                <Text style={s.empty}>Sin ingredientes aún.</Text>
              ) : (
                lineas.map((l, i) => (
                  <View key={i} style={s.ingRow}>
                    <View style={{ flex: 1 }}>
                      {l.tipo === "preparacion" || l.prep_ingrediente_id ? (
                        <Text style={[s.ingNombre, { color: "#7c3aed" }]}>
                          🫙 {nombrePrep(l.prep_ingrediente_id)}
                        </Text>
                      ) : (
                        <Text style={s.ingNombre}>
                          {nombreIng(l.ingrediente_id)}
                        </Text>
                      )}
                      <Text style={s.ingCant}>
                        {l.cantidad}{" "}
                        {l.tipo === "preparacion" || l.prep_ingrediente_id
                          ? unidadPrep(l.prep_ingrediente_id)
                          : unidadIng(l.ingrediente_id)}
                      </Text>
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
      <Modal
        visible={ingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setIngModal(false)}
      >
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.sheetTitle}>Añadir ingrediente</Text>

            {/* Selector tipo: Ingrediente base vs Preparación */}
            <View style={s.tipoRow}>
              <Pressable
                style={[
                  s.tipoBtn,
                  ingForm.tipo === "ingrediente" && s.tipoBtnActivo,
                ]}
                onPress={() =>
                  setIngForm((f) => ({
                    ...f,
                    tipo: "ingrediente",
                    prep_ingrediente_id: "",
                  }))
                }
              >
                <Text
                  style={[
                    s.tipoBtnText,
                    ingForm.tipo === "ingrediente" && s.tipoBtnTextActivo,
                  ]}
                >
                  🥛 Ingrediente
                </Text>
              </Pressable>
              <Pressable
                style={[
                  s.tipoBtn,
                  ingForm.tipo === "preparacion" && s.tipoBtnActivo,
                ]}
                onPress={() =>
                  setIngForm((f) => ({
                    ...f,
                    tipo: "preparacion",
                    ingrediente_id: "",
                  }))
                }
              >
                <Text
                  style={[
                    s.tipoBtnText,
                    ingForm.tipo === "preparacion" && s.tipoBtnTextActivo,
                  ]}
                >
                  🫙 Preparación
                </Text>
              </Pressable>
            </View>

            {ingForm.tipo === "ingrediente" ? (
              <>
                <Text style={s.label}>Ingrediente</Text>
                <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                  {ingredientes.map((ing) => (
                    <Pressable
                      key={ing.id}
                      style={[
                        s.ingOption,
                        ingForm.ingrediente_id === ing.id && s.ingOptionSel,
                      ]}
                      onPress={() =>
                        setIngForm((f) => ({ ...f, ingrediente_id: ing.id }))
                      }
                    >
                      <Text
                        style={[
                          s.ingOptionText,
                          ingForm.ingrediente_id === ing.id &&
                            s.ingOptionTextSel,
                        ]}
                      >
                        {ing.nombre} ({ing.unidad})
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={s.label}>Preparación</Text>
                <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                  {preparaciones.map((p) => (
                    <Pressable
                      key={p.id}
                      style={[
                        s.ingOption,
                        ingForm.prep_ingrediente_id === p.id && s.ingOptionSel,
                      ]}
                      onPress={() =>
                        setIngForm((f) => ({ ...f, prep_ingrediente_id: p.id }))
                      }
                    >
                      <Text
                        style={[
                          s.ingOptionText,
                          ingForm.prep_ingrediente_id === p.id &&
                            s.ingOptionTextSel,
                        ]}
                      >
                        🫙 {p.nombre} ({p.unidad})
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={s.label}>Cantidad</Text>
            <TextInput
              style={s.input}
              value={ingForm.cantidad}
              onChangeText={(v) => setIngForm((f) => ({ ...f, cantidad: v }))}
              keyboardType="numeric"
              placeholder={
                ingForm.tipo === "ingrediente"
                  ? `en ${ingForm.ingrediente_id ? unidadIng(ingForm.ingrediente_id) : "unidad"}`
                  : `en ${ingForm.prep_ingrediente_id ? unidadPrep(ingForm.prep_ingrediente_id) : "gr"}`
              }
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
    margin: 12,
    backgroundColor: "#e91e63",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  empty: { textAlign: "center", color: "#aaa", fontSize: 13, marginTop: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardNombre: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  cardDesc: { fontSize: 12, color: "#888", marginTop: 1 },
  cardDetalle: { fontSize: 12, color: "#666", marginTop: 4 },
  iconBtn: { padding: 6 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalBox: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  label: { fontSize: 12, color: "#666", fontWeight: "600", marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
    marginTop: 4,
  },

  secHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  secTitle: { fontSize: 13, fontWeight: "700", color: "#333" },
  addIngBtn: {
    backgroundColor: "#fce4ec",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addIngBtnText: { color: "#e91e63", fontWeight: "700", fontSize: 12 },

  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  ingNombre: { fontSize: 13, fontWeight: "600", color: "#333" },
  ingCant: { fontSize: 12, color: "#888", marginTop: 2 },

  costoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fce4ec",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  costoLabel: { fontSize: 13, color: "#c2185b", fontWeight: "600" },
  costoValor: { fontSize: 13, color: "#c2185b", fontWeight: "800" },

  tipoRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  tipoBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  tipoBtnActivo: { backgroundColor: "#fce4ec" },
  tipoBtnText: { fontSize: 13, color: "#666" },
  tipoBtnTextActivo: { color: "#e91e63", fontWeight: "700" },

  ingOption: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#f5f5f5",
  },
  ingOptionSel: { backgroundColor: "#fce4ec" },
  ingOptionText: { fontSize: 13, color: "#444" },
  ingOptionTextSel: { color: "#e91e63", fontWeight: "700" },

  modalBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#e91e63",
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
