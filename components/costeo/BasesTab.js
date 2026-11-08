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
// precios unitarios: 4,2 → "4,2" · 1250 → "1.250"
const fmtUnit = (n) => {
  const v = Number(n ?? 0);
  if (isNaN(v)) return "0";
  return v >= 100
    ? fmt(v)
    : v.toLocaleString("es-CO", { maximumFractionDigits: 2 });
};
const fmtCant = (n) => {
  const v = Number(n ?? 0);
  if (isNaN(v)) return "0";
  return v % 1 === 0 ? String(v) : parseFloat(v.toFixed(4)).toString();
};
const toNum = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const EMPTY_BASE = { nombre: "", descripcion: "", rendimiento_ml: "1000" };
const EMPTY_LINE = {
  tipo: "ingrediente", // "ingrediente" | "base"
  ingrediente_id: "",
  base_origen_id: "",
  cantidad: "",
};

export default function BasesTab() {
  const { bases, ingredientes, guardarBase, borrarBase } = useCosteo();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_BASE);
  const [editId, setEditId] = useState(null);
  // líneas: { tipo: "ingrediente", ingrediente_id, cantidad }
  //      o  { tipo: "base",        base_origen_id, cantidad }  (cantidad en ml)
  const [lineas, setLineas] = useState([]);
  const [saving, setSaving] = useState(false);

  const [lineModal, setLineModal] = useState(false);
  const [lineForm, setLineForm] = useState(EMPTY_LINE);

  // ── helpers ───────────────────────────────────────────────
  const ing = (id) => (ingredientes ?? []).find((i) => i.id === Number(id));
  const baseById = (id) => (bases ?? []).find((b) => b.id === Number(id));

  // ¿`desdeId` contiene (directa o indirectamente) a `buscadaId`?
  // Sirve para no ofrecer bases que crearían un ciclo.
  const contiene = (desdeId, buscadaId, vistos = new Set()) => {
    if (Number(desdeId) === Number(buscadaId)) return true;
    if (vistos.has(desdeId)) return false;
    vistos.add(desdeId);
    const b = baseById(desdeId);
    return (b?.sub_bases ?? []).some((s) =>
      contiene(s.base_origen_id, buscadaId, vistos),
    );
  };

  const abrir = (base = null) => {
    setEditId(base?.id ?? null);
    setForm(
      base
        ? {
            nombre: base.nombre,
            descripcion: base.descripcion ?? "",
            rendimiento_ml: fmtCant(base.rendimiento_ml ?? 1000),
          }
        : EMPTY_BASE,
    );
    setLineas([
      ...(base?.ingredientes ?? []).map((i) => ({
        tipo: "ingrediente",
        ingrediente_id: i.ingrediente_id,
        cantidad: Number(i.cantidad),
      })),
      ...(base?.sub_bases ?? []).map((s) => ({
        tipo: "base",
        base_origen_id: s.base_origen_id,
        cantidad: Number(s.cantidad_ml),
      })),
    ]);
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return Alert.alert("Nombre requerido");
    const rendimiento = toNum(form.rendimiento_ml);
    if (!(rendimiento > 0))
      return Alert.alert("Rendimiento", "Indica cuántos ml rinde el lote");
    setSaving(true);
    try {
      await guardarBase(
        {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion,
          rendimiento_ml: rendimiento,
          ingredientes: lineas
            .filter((l) => l.tipo === "ingrediente")
            .map((l) => ({
              ingrediente_id: l.ingrediente_id,
              cantidad: l.cantidad,
            })),
          sub_bases: lineas
            .filter((l) => l.tipo === "base")
            .map((l) => ({
              base_origen_id: l.base_origen_id,
              cantidad_ml: l.cantidad,
            })),
        },
        editId,
      );
      setModal(false);
    } catch (e) {
      Alert.alert("Error", e.message || "No se pudo guardar la base");
    } finally {
      setSaving(false);
    }
  };

  const borrar = (base) =>
    Alert.alert("Eliminar", `¿Eliminar la base "${base.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await borrarBase(base.id);
          } catch (e) {
            Alert.alert("No se pudo eliminar", e.message);
          }
        },
      },
    ]);

  const addLine = () => {
    if (lineForm.tipo === "ingrediente" && !lineForm.ingrediente_id)
      return Alert.alert("Selecciona un ingrediente");
    if (lineForm.tipo === "base" && !lineForm.base_origen_id)
      return Alert.alert("Selecciona una base");
    const cantidad = toNum(lineForm.cantidad);
    if (!(cantidad > 0)) return Alert.alert("Ingresa la cantidad");
    setLineas((prev) => [
      ...prev,
      lineForm.tipo === "ingrediente"
        ? {
            tipo: "ingrediente",
            ingrediente_id: Number(lineForm.ingrediente_id),
            cantidad,
          }
        : {
            tipo: "base",
            base_origen_id: Number(lineForm.base_origen_id),
            cantidad,
          },
    ]);
    setLineForm(EMPTY_LINE);
    setLineModal(false);
  };

  const removeLine = (idx) =>
    setLineas((prev) => prev.filter((_, i) => i !== idx));

  // ── costeo estimado del lote ───────────────────────────────
  const costoLote = lineas.reduce((acc, l) => {
    if (l.tipo === "base") {
      return (
        acc +
        Number(l.cantidad) *
          Number(baseById(l.base_origen_id)?.costo_por_ml ?? 0)
      );
    }
    return (
      acc +
      Number(l.cantidad) * Number(ing(l.ingrediente_id)?.precio_unidad ?? 0)
    );
  }, 0);
  const rendimientoNum = toNum(form.rendimiento_ml);
  const costoPorMl = rendimientoNum > 0 ? costoLote / rendimientoNum : 0;

  // opciones del selector de bases: no ella misma, no las ya usadas,
  // y ninguna que ya contenga a esta (ciclo)
  const basesDisponibles = (bases ?? []).filter(
    (b) =>
      b.id !== editId &&
      !lineas.some((l) => l.tipo === "base" && l.base_origen_id === b.id) &&
      !(editId && contiene(b.id, editId)),
  );
  const ingsDisponibles = (ingredientes ?? []).filter(
    (i) =>
      !lineas.some(
        (l) => l.tipo === "ingrediente" && l.ingrediente_id === i.id,
      ),
  );

  const unidadLinea = (l) =>
    l.tipo === "base" ? "ml" : (ing(l.ingrediente_id)?.unidad ?? "");

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
              {(item.sub_bases ?? []).length > 0 && (
                <Text style={s.cardSub}>
                  🧊 Parte de:{" "}
                  {item.sub_bases
                    .map(
                      (b) =>
                        `${b.origen_nombre} (${fmtCant(b.cantidad_ml)} ml)`,
                    )
                    .join(" + ")}
                </Text>
              )}
              <Text style={s.cardDetalle}>
                {`Lote $${fmt(item.costo_tanda)} · rinde ${fmtCant(item.rendimiento_ml)} ml · $${fmtUnit(item.costo_por_ml)}/ml`}
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
                placeholder="ej: Base chocolatosa"
              />

              <Text style={s.label}>Descripción (opcional)</Text>
              <TextInput
                style={s.input}
                value={form.descripcion}
                onChangeText={(v) => setForm((f) => ({ ...f, descripcion: v }))}
                placeholder="Notas sobre esta base..."
              />

              <Text style={s.label}>Rendimiento del lote (ml)</Text>
              <TextInput
                style={s.input}
                value={String(form.rendimiento_ml)}
                onChangeText={(v) =>
                  setForm((f) => ({ ...f, rendimiento_ml: v }))
                }
                keyboardType="decimal-pad"
                placeholder="ej: 1000"
              />
              <Text style={s.hint}>
                Cuántos ml salen en total con esta receta. Con esto se calcula
                el costo por ml que usan los helados.
              </Text>

              {/* Ingredientes y bases del lote */}
              <View style={s.secHeader}>
                <Text style={s.secTitle}>🧪 Ingredientes del lote</Text>
                <Pressable
                  style={s.addIngBtn}
                  onPress={() => {
                    setLineForm(EMPTY_LINE);
                    setLineModal(true);
                  }}
                >
                  <Text style={s.addIngBtnText}>+ Añadir</Text>
                </Pressable>
              </View>

              {lineas.length === 0 ? (
                <Text style={s.empty}>Sin ingredientes aún.</Text>
              ) : (
                lineas.map((l, i) => {
                  const esBase = l.tipo === "base";
                  const origen = esBase ? baseById(l.base_origen_id) : null;
                  const unitario = esBase
                    ? Number(origen?.costo_por_ml ?? 0)
                    : Number(ing(l.ingrediente_id)?.precio_unidad ?? 0);
                  return (
                    <View key={i} style={s.ingRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[s.ingNombre, esBase && { color: "#7c3aed" }]}
                        >
                          {esBase
                            ? `🧊 ${origen?.nombre ?? `base#${l.base_origen_id}`}`
                            : (ing(l.ingrediente_id)?.nombre ??
                              `#${l.ingrediente_id}`)}
                        </Text>
                        <Text style={s.ingCant}>
                          {fmtCant(l.cantidad)} {unidadLinea(l)} × $
                          {fmtUnit(unitario)}/{unidadLinea(l) || "u"} = $
                          {fmt(Number(l.cantidad) * unitario)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => removeLine(i)}
                        style={s.iconBtn}
                      >
                        <Text style={{ color: "#e91e63" }}>✕</Text>
                      </Pressable>
                    </View>
                  );
                })
              )}

              {lineas.length > 0 && (
                <View style={s.costoRow}>
                  <Text style={s.costoLabel}>
                    Costo del lote · ${fmtUnit(costoPorMl)}/ml
                  </Text>
                  <Text style={s.costoValor}>${fmt(costoLote)}</Text>
                </View>
              )}

              <View style={s.modalBtns}>
                <Pressable style={s.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={s.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[s.saveBtn, saving && { opacity: 0.5 }]}
                  onPress={guardar}
                  disabled={saving}
                >
                  <Text style={s.saveBtnText}>
                    {saving ? "Guardando…" : "Guardar base"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL AÑADIR INGREDIENTE / BASE ─────────────── */}
      <Modal
        visible={lineModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLineModal(false)}
      >
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.sheetTitle}>Añadir al lote</Text>

            <View style={s.tipoRow}>
              <Pressable
                style={[
                  s.tipoBtn,
                  lineForm.tipo === "ingrediente" && s.tipoBtnActivo,
                ]}
                onPress={() =>
                  setLineForm((f) => ({
                    ...f,
                    tipo: "ingrediente",
                    base_origen_id: "",
                  }))
                }
              >
                <Text
                  style={[
                    s.tipoBtnText,
                    lineForm.tipo === "ingrediente" && s.tipoBtnTextActivo,
                  ]}
                >
                  🥛 Ingrediente
                </Text>
              </Pressable>
              <Pressable
                style={[s.tipoBtn, lineForm.tipo === "base" && s.tipoBtnActivo]}
                onPress={() =>
                  setLineForm((f) => ({
                    ...f,
                    tipo: "base",
                    ingrediente_id: "",
                  }))
                }
              >
                <Text
                  style={[
                    s.tipoBtnText,
                    lineForm.tipo === "base" && s.tipoBtnTextActivo,
                  ]}
                >
                  🧊 Otra base
                </Text>
              </Pressable>
            </View>

            {lineForm.tipo === "ingrediente" ? (
              <>
                <Text style={s.label}>Ingrediente</Text>
                <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                  {ingsDisponibles.map((i) => (
                    <Pressable
                      key={i.id}
                      style={[
                        s.ingOption,
                        lineForm.ingrediente_id === i.id && s.ingOptionSel,
                      ]}
                      onPress={() =>
                        setLineForm((f) => ({ ...f, ingrediente_id: i.id }))
                      }
                    >
                      <Text
                        style={[
                          s.ingOptionText,
                          lineForm.ingrediente_id === i.id &&
                            s.ingOptionTextSel,
                        ]}
                      >
                        {i.nombre} ({i.unidad})
                      </Text>
                    </Pressable>
                  ))}
                  {ingsDisponibles.length === 0 && (
                    <Text style={s.empty}>No hay más ingredientes.</Text>
                  )}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={s.label}>Base (se mide en ml)</Text>
                <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                  {basesDisponibles.map((b) => (
                    <Pressable
                      key={b.id}
                      style={[
                        s.ingOption,
                        lineForm.base_origen_id === b.id && s.ingOptionSel,
                      ]}
                      onPress={() =>
                        setLineForm((f) => ({ ...f, base_origen_id: b.id }))
                      }
                    >
                      <Text
                        style={[
                          s.ingOptionText,
                          lineForm.base_origen_id === b.id &&
                            s.ingOptionTextSel,
                        ]}
                      >
                        🧊 {b.nombre} · ${fmtUnit(b.costo_por_ml)}/ml
                      </Text>
                    </Pressable>
                  ))}
                  {basesDisponibles.length === 0 && (
                    <Text style={s.empty}>No hay otras bases disponibles.</Text>
                  )}
                </ScrollView>
              </>
            )}

            <Text style={s.label}>Cantidad</Text>
            <TextInput
              style={s.input}
              value={lineForm.cantidad}
              onChangeText={(v) => setLineForm((f) => ({ ...f, cantidad: v }))}
              keyboardType="decimal-pad"
              placeholder={
                lineForm.tipo === "base"
                  ? "en ml"
                  : `en ${lineForm.ingrediente_id ? (ing(lineForm.ingrediente_id)?.unidad ?? "unidad") : "unidad"}`
              }
            />

            <View style={s.modalBtns}>
              <Pressable
                style={s.cancelBtn}
                onPress={() => setLineModal(false)}
              >
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={addLine}>
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
  cardSub: { fontSize: 12, color: "#7c3aed", marginTop: 3 },
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
  hint: { fontSize: 11, color: "#999", marginTop: 4 },
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
