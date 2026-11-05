// components/costeo/PreparacionesTab.js
// Sub-recetas caseras: leche condensada, mermeladas, caramelo salado, etc.
// Soporta 2 niveles: "Frutos rojos" puede usar otras preparaciones como ingrediente.
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Alert, Modal, ScrollView,
} from "react-native";
import { useState } from "react";
import { useCosteo } from "../../context/CosteoContext";

const fmt    = (n) => Math.round(Number(n ?? 0)).toLocaleString("es-CO");
const fmtDec = (n) => Number(n ?? 0).toFixed(2);

const UNIDADES = ["gr", "ml", "unidad"];
const EMPTY_PREP = { nombre: "", descripcion: "", rendimiento_gr: "", unidad: "gr" };
const EMPTY_LINE = { tipo: "ingrediente", ingrediente_id: "", prep_ingrediente_id: "", cantidad: "" };

export default function PreparacionesTab() {
  const { ingredientes, preparaciones, guardarPreparacion, borrarPreparacion } = useCosteo();

  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY_PREP);
  const [editId,   setEditId]   = useState(null);
  const [lineas,   setLineas]   = useState([]);

  // Modal para añadir una línea de ingrediente
  const [lineModal, setLineModal] = useState(false);
  const [lineForm,  setLineForm]  = useState(EMPTY_LINE);

  // Para ver el desglose de costo de una preparación
  const [detalleId, setDetalleId] = useState(null);

  // ── helpers ──────────────────────────────────────────────────
  const nombreIng = (id) =>
    ingredientes.find(i => i.id === Number(id))?.nombre ?? `ing#${id}`;
  const unidadIng = (id) =>
    ingredientes.find(i => i.id === Number(id))?.unidad ?? "";
  const nombrePrep = (id) =>
    preparaciones.find(p => p.id === Number(id))?.nombre ?? `prep#${id}`;
  const unidadPrep = (id) =>
    preparaciones.find(p => p.id === Number(id))?.unidad ?? "";

  const prepActual = preparaciones.find(p => p.id === detalleId);

  // ── calcular costo estimado del lote en frontend (aproximado) ─
  const costoLote = lineas.reduce((acc, l) => {
    if (l.tipo === "ingrediente") {
      const ing = ingredientes.find(i => i.id === Number(l.ingrediente_id));
      return acc + (Number(l.cantidad) * Number(ing?.precio_unidad ?? 0));
    } else {
      const prep = preparaciones.find(p => p.id === Number(l.prep_ingrediente_id));
      const precioGr = prep?.costo_por_gr ?? 0;
      return acc + (Number(l.cantidad) * Number(precioGr));
    }
  }, 0);
  const rendimiento = Number(form.rendimiento_gr) || 1;
  const costoPorGr = costoLote / rendimiento;

  // ── abrir modal crear/editar ──────────────────────────────────
  const abrir = (item = null) => {
    setEditId(item?.id ?? null);
    setForm(item
      ? {
          nombre:         item.nombre,
          descripcion:    item.descripcion ?? "",
          rendimiento_gr: String(item.rendimiento_gr),
          unidad:         item.unidad ?? "gr",
        }
      : EMPTY_PREP
    );
    setLineas(
      (item?.ingredientes ?? []).map(l => ({
        tipo:              l.prep_ingrediente_id ? "preparacion" : "ingrediente",
        ingrediente_id:    l.ingrediente_id    ?? "",
        prep_ingrediente_id: l.prep_ingrediente_id ?? "",
        cantidad:          String(l.cantidad),
      }))
    );
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim())          return Alert.alert("Nombre requerido");
    if (!form.rendimiento_gr.trim())  return Alert.alert("Rendimiento requerido (cuántos gr rinde)");
    const payload = {
      ...form,
      rendimiento_gr: Number(form.rendimiento_gr),
      ingredientes: lineas.map(l => ({
        ingrediente_id:      l.tipo === "ingrediente" ? Number(l.ingrediente_id) : null,
        prep_ingrediente_id: l.tipo === "preparacion" ? Number(l.prep_ingrediente_id) : null,
        cantidad:            Number(l.cantidad),
      })),
    };
    await guardarPreparacion(payload, editId);
    setModal(false);
  };

  const confirmarBorrar = (item) =>
    Alert.alert("Eliminar", `¿Eliminar "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => borrarPreparacion(item.id) },
    ]);

  // ── línea de ingrediente ──────────────────────────────────────
  const addLine = () => {
    if (lineForm.tipo === "ingrediente" && !lineForm.ingrediente_id)
      return Alert.alert("Selecciona un ingrediente");
    if (lineForm.tipo === "preparacion" && !lineForm.prep_ingrediente_id)
      return Alert.alert("Selecciona una preparación");
    if (!lineForm.cantidad)
      return Alert.alert("Ingresa la cantidad");
    setLineas(prev => [...prev, { ...lineForm }]);
    setLineForm(EMPTY_LINE);
    setLineModal(false);
  };

  const removeLine = (idx) => setLineas(prev => prev.filter((_, i) => i !== idx));

  // Preparaciones disponibles para usar como sub-ingrediente (no la misma que se está editando)
  const prepsDisponibles = preparaciones.filter(p => p.id !== editId);

  // ─────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <Pressable style={s.addBtn} onPress={() => abrir()}>
        <Text style={s.addBtnText}>+ Nueva preparación</Text>
      </Pressable>

      <FlatList
        data={preparaciones}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <Text style={s.empty}>No hay preparaciones. Agrega la primera.</Text>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <Pressable style={{ flex: 1 }} onPress={() => setDetalleId(item.id)}>
              <Text style={s.cardNombre}>{item.nombre}</Text>
              {item.descripcion ? <Text style={s.cardDesc}>{item.descripcion}</Text> : null}
              <Text style={s.cardDetalle}>
                🫙 Rinde {item.rendimiento_gr} {item.unidad}
                {item.costo_por_gr != null
                  ? `  ·  $${fmtDec(item.costo_por_gr)}/${item.unidad}`
                  : ""}
                {"  ·  "}
                <Text style={s.tapVer}>Ver desglose →</Text>
              </Text>
            </Pressable>
            <Pressable onPress={() => abrir(item)} style={s.iconBtn}><Text>✏️</Text></Pressable>
            <Pressable onPress={() => confirmarBorrar(item)} style={s.iconBtn}><Text>🗑️</Text></Pressable>
          </View>
        )}
      />

      {/* ══ MODAL CREAR / EDITAR ══════════════════════════════════ */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.sheetTitle}>{editId ? "Editar" : "Nueva"} preparación</Text>

              <Text style={s.label}>Nombre</Text>
              <TextInput style={s.input} value={form.nombre}
                onChangeText={v => setForm(f => ({ ...f, nombre: v }))}
                placeholder="ej: Leche condensada casera" />

              <Text style={s.label}>Descripción (opcional)</Text>
              <TextInput style={s.input} value={form.descripcion}
                onChangeText={v => setForm(f => ({ ...f, descripcion: v }))}
                placeholder="Notas de elaboración..." />

              <Text style={s.label}>Rendimiento total</Text>
              <View style={s.row}>
                <TextInput
                  style={[s.input, { flex: 1, marginRight: 8 }]}
                  value={form.rendimiento_gr}
                  onChangeText={v => setForm(f => ({ ...f, rendimiento_gr: v }))}
                  keyboardType="numeric"
                  placeholder="ej: 800"
                />
                <View style={s.chipRowSmall}>
                  {UNIDADES.map(u => (
                    <Pressable key={u}
                      style={[s.chipSmall, form.unidad === u && s.chipSmallActivo]}
                      onPress={() => setForm(f => ({ ...f, unidad: u }))}
                    >
                      <Text style={[s.chipSmallText, form.unidad === u && s.chipSmallTextActivo]}>{u}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Text style={s.hint}>Cuántos gramos (o ml / unidades) produce esta receta completa.</Text>

              {/* ── Ingredientes ── */}
              <View style={s.secHeader}>
                <Text style={s.secTitle}>🧪 Ingredientes / sub-preparaciones</Text>
                <Pressable style={s.addIngBtn} onPress={() => { setLineForm(EMPTY_LINE); setLineModal(true); }}>
                  <Text style={s.addIngBtnText}>+ Añadir</Text>
                </Pressable>
              </View>

              {lineas.length === 0
                ? <Text style={s.empty}>Sin ingredientes aún.</Text>
                : lineas.map((l, i) => (
                    <View key={i} style={s.ingRow}>
                      <View style={{ flex: 1 }}>
                        {l.tipo === "ingrediente"
                          ? <Text style={s.ingNombre}>{nombreIng(l.ingrediente_id)}</Text>
                          : <Text style={[s.ingNombre, { color: "#7c3aed" }]}>
                              🫙 {nombrePrep(l.prep_ingrediente_id)}
                            </Text>
                        }
                        <Text style={s.ingCant}>
                          {l.cantidad} {l.tipo === "ingrediente"
                            ? unidadIng(l.ingrediente_id)
                            : unidadPrep(l.prep_ingrediente_id)}
                        </Text>
                      </View>
                      <Pressable onPress={() => removeLine(i)} style={s.iconBtn}>
                        <Text style={{ color: "#e91e63" }}>✕</Text>
                      </Pressable>
                    </View>
                  ))
              }

              {lineas.length > 0 && (
                <View style={s.costoRow}>
                  <View>
                    <Text style={s.costoLabel}>Costo del lote</Text>
                    <Text style={s.costoValor}>${fmt(costoLote)}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.costoLabel}>Costo por {form.unidad || "gr"}</Text>
                    <Text style={s.costoValor}>${fmtDec(costoPorGr)}</Text>
                  </View>
                </View>
              )}

              <View style={s.modalBtns}>
                <Pressable style={s.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={s.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable style={s.saveBtn} onPress={guardar}>
                  <Text style={s.saveBtnText}>Guardar</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══ MODAL AÑADIR LÍNEA ════════════════════════════════════ */}
      <Modal visible={lineModal} transparent animationType="fade" onRequestClose={() => setLineModal(false)}>
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.sheetTitle}>Añadir ingrediente</Text>

            {/* Selector de tipo */}
            <View style={s.tipoRow}>
              <Pressable
                style={[s.tipoBtn, lineForm.tipo === "ingrediente" && s.tipoBtnActivo]}
                onPress={() => setLineForm(f => ({ ...f, tipo: "ingrediente", prep_ingrediente_id: "" }))}
              >
                <Text style={[s.tipoBtnText, lineForm.tipo === "ingrediente" && s.tipoBtnTextActivo]}>
                  🥛 Ingrediente base
                </Text>
              </Pressable>
              <Pressable
                style={[s.tipoBtn, lineForm.tipo === "preparacion" && s.tipoBtnActivo]}
                onPress={() => setLineForm(f => ({ ...f, tipo: "preparacion", ingrediente_id: "" }))}
              >
                <Text style={[s.tipoBtnText, lineForm.tipo === "preparacion" && s.tipoBtnTextActivo]}>
                  🫙 Preparación
                </Text>
              </Pressable>
            </View>

            {lineForm.tipo === "ingrediente" ? (
              <>
                <Text style={s.label}>Selecciona ingrediente</Text>
                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                  {ingredientes.map(ing => (
                    <Pressable
                      key={ing.id}
                      style={[s.ingOption, lineForm.ingrediente_id === ing.id && s.ingOptionSel]}
                      onPress={() => setLineForm(f => ({ ...f, ingrediente_id: ing.id }))}
                    >
                      <Text style={[s.ingOptionText, lineForm.ingrediente_id === ing.id && s.ingOptionTextSel]}>
                        {ing.nombre} ({ing.unidad})
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={s.label}>Selecciona preparación</Text>
                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                  {prepsDisponibles.map(p => (
                    <Pressable
                      key={p.id}
                      style={[s.ingOption, lineForm.prep_ingrediente_id === p.id && s.ingOptionSel]}
                      onPress={() => setLineForm(f => ({ ...f, prep_ingrediente_id: p.id }))}
                    >
                      <Text style={[s.ingOptionText, lineForm.prep_ingrediente_id === p.id && s.ingOptionTextSel]}>
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
              value={lineForm.cantidad}
              onChangeText={v => setLineForm(f => ({ ...f, cantidad: v }))}
              keyboardType="numeric"
              placeholder="ej: 150"
            />

            <View style={s.modalBtns}>
              <Pressable style={s.cancelBtn} onPress={() => setLineModal(false)}>
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={addLine}>
                <Text style={s.saveBtnText}>Añadir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ MODAL DESGLOSE DE COSTO ═══════════════════════════════ */}
      <Modal
        visible={detalleId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDetalleId(null)}
      >
        <View style={s.overlay}>
          <View style={s.modalBox}>
            {prepActual && (
              <>
                <Text style={s.sheetTitle}>{prepActual.nombre}</Text>
                {prepActual.descripcion
                  ? <Text style={s.cardDesc}>{prepActual.descripcion}</Text>
                  : null}

                <Text style={[s.label, { marginTop: 12 }]}>Ingredientes</Text>
                {(prepActual.ingredientes ?? []).map((l, i) => {
                  const esPrep = !!l.prep_ingrediente_id;
                  return (
                    <View key={i} style={s.detalleRow}>
                      <Text style={s.detalleNombre}>
                        {esPrep
                          ? `🫙 ${l.sub_nombre ?? "prep"}`
                          : (l.ing_nombre ?? "ing")}
                      </Text>
                      <Text style={s.detalleCant}>
                        {l.cantidad} {esPrep ? l.sub_unidad : l.ing_unidad}
                      </Text>
                    </View>
                  );
                })}

                <View style={[s.costoRow, { marginTop: 12 }]}>
                  <View>
                    <Text style={s.costoLabel}>Rinde</Text>
                    <Text style={s.costoValor}>{prepActual.rendimiento_gr} {prepActual.unidad}</Text>
                  </View>
                  {prepActual.costo_por_gr != null && (
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.costoLabel}>Costo por {prepActual.unidad}</Text>
                      <Text style={s.costoValor}>${fmtDec(prepActual.costo_por_gr)}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
            <Pressable style={[s.saveBtn, { marginTop: 16 }]} onPress={() => setDetalleId(null)}>
              <Text style={s.saveBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1 },
  addBtn: {
    margin: 12, backgroundColor: "#7c3aed", borderRadius: 10,
    paddingVertical: 12, alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  empty: { textAlign: "center", color: "#aaa", fontSize: 13, marginTop: 16 },

  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardNombre:  { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  cardDesc:    { fontSize: 12, color: "#888", marginTop: 2 },
  cardDetalle: { fontSize: 12, color: "#666", marginTop: 4 },
  tapVer:      { color: "#7c3aed", fontWeight: "600" },
  iconBtn:     { padding: 6 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: "92%",
  },
  modalBox: {
    margin: 20, backgroundColor: "#fff", borderRadius: 20, padding: 20,
    maxHeight: "88%",
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", marginBottom: 8 },

  label: { fontSize: 12, color: "#666", fontWeight: "600", marginTop: 12 },
  hint:  { fontSize: 11, color: "#aaa", marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 10, fontSize: 14, backgroundColor: "#fafafa", marginTop: 4,
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },

  chipRowSmall: { flexDirection: "row", gap: 4 },
  chipSmall: {
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  chipSmallActivo:    { backgroundColor: "#ede9fe" },
  chipSmallText:      { fontSize: 12, color: "#666" },
  chipSmallTextActivo:{ color: "#7c3aed", fontWeight: "700" },

  secHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 16, marginBottom: 8,
  },
  secTitle:   { fontSize: 13, fontWeight: "700", color: "#333" },
  addIngBtn:  { backgroundColor: "#ede9fe", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addIngBtnText: { color: "#7c3aed", fontWeight: "700", fontSize: 12 },

  ingRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f9f9f9", borderRadius: 10, padding: 10, marginBottom: 6,
  },
  ingNombre: { fontSize: 13, fontWeight: "600", color: "#333" },
  ingCant:   { fontSize: 12, color: "#888", marginTop: 2 },

  costoRow: {
    flexDirection: "row", justifyContent: "space-between",
    backgroundColor: "#ede9fe", borderRadius: 10, padding: 12, marginTop: 8,
  },
  costoLabel: { fontSize: 11, color: "#7c3aed", fontWeight: "600" },
  costoValor: { fontSize: 14, color: "#7c3aed", fontWeight: "800" },

  tipoRow: { flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 4 },
  tipoBtn: {
    flex: 1, padding: 10, borderRadius: 10, backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  tipoBtnActivo:    { backgroundColor: "#ede9fe" },
  tipoBtnText:      { fontSize: 13, color: "#666" },
  tipoBtnTextActivo:{ color: "#7c3aed", fontWeight: "700" },

  ingOption:        { padding: 10, borderRadius: 8, marginBottom: 4, backgroundColor: "#f5f5f5" },
  ingOptionSel:     { backgroundColor: "#ede9fe" },
  ingOptionText:    { fontSize: 13, color: "#444" },
  ingOptionTextSel: { color: "#7c3aed", fontWeight: "700" },

  detalleRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  detalleNombre: { fontSize: 13, color: "#333" },
  detalleCant:   { fontSize: 13, color: "#666", fontWeight: "600" },

  modalBtns:    { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn:    { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#f5f5f5", alignItems: "center" },
  cancelBtnText:{ color: "#666", fontWeight: "600" },
  saveBtn:      { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#7c3aed", alignItems: "center" },
  saveBtnText:  { color: "#fff", fontWeight: "700" },
});
