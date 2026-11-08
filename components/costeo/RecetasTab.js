import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useCosteo } from "../../context/CosteoContext";

const fmtPeso = (n) => Math.round(Number(n ?? 0)).toLocaleString("es-CO");
const fmtCant = (n) => {
  const v = Number(n ?? 0);
  return v % 1 === 0 ? String(v) : parseFloat(v.toFixed(4)).toString();
};

const EMPTY_FORM = {
  base_id: null,
  base_gr: "",
  ingredientes_principal: [],
  ingredientes_topping: [],
  preparaciones: [],
  packaging_ids: [],
  unidades: 1,
  margen: 30,
};

export default function RecetasTab() {
  const {
    recetas, // lista de helados con receta incluida (si existe)
    bases,
    ingredientes,
    preparaciones,
    packaging,
    loading,
    fetchRecetaDetalle,
    guardarReceta,
    fetchRecetas,
  } = useCosteo();

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // ── abrir detalle ──────────────────────────────────────────────────────────
  const openHelado = async (item) => {
    setSelected(item);
    setModalVisible(true);
    if (item.receta_id) {
      setLoadingDetalle(true);
      try {
        const detalle = await fetchRecetaDetalle(item.id);
        if (detalle) {
          setForm({
            base_id: detalle.base_id ?? null,
            base_gr: detalle.base_gr != null ? fmtCant(detalle.base_gr) : "",
            ingredientes_principal: (detalle.ingredientes ?? [])
              .filter((i) => i.tipo === "principal" || i.tipo == null)
              .map((i) => ({ ...i, cantidad: fmtCant(i.cantidad) })),
            ingredientes_topping: (detalle.ingredientes ?? [])
              .filter((i) => i.tipo === "topping")
              .map((i) => ({ ...i, cantidad: fmtCant(i.cantidad) })),
            preparaciones: (detalle.preparaciones ?? []).map((p) => ({
              ...p,
              cantidad: fmtCant(p.cantidad),
            })),
            packaging_ids: (detalle.packaging ?? []).map((p) => p.id),
            unidades: detalle.unidades ?? 1,
            margen: detalle.margen ?? 30,
          });
        } else {
          setForm(EMPTY_FORM);
        }
      } finally {
        setLoadingDetalle(false);
      }
    } else {
      setForm(EMPTY_FORM);
    }
  };

  // ── costo en tiempo real ───────────────────────────────────────────────────
  const calcCosto = () => {
    const base = (bases ?? []).find((b) => b.id === form.base_id);
    const costoBase = base
      ? Number(base.costo_por_ml ?? 0) * Number(form.base_gr || 0)
      : 0;
    const allIngs = [
      ...form.ingredientes_principal,
      ...form.ingredientes_topping,
    ];
    const costoIngs = allIngs.reduce(
      (acc, i) => acc + Number(i.precio_unidad ?? 0) * Number(i.cantidad || 0),
      0,
    );
    const costoPreps = form.preparaciones.reduce(
      (acc, p) => acc + Number(p.costo_por_gr ?? 0) * Number(p.cantidad || 0),
      0,
    );
    const pkgSel = (packaging ?? []).filter((p) =>
      form.packaging_ids.includes(p.id),
    );
    const costoPkg = pkgSel.reduce(
      (acc, p) => acc + Number(p.precio_unidad ?? 0),
      0,
    );
    const total = costoBase + costoIngs + costoPreps + costoPkg;
    const conMargen = total * (1 + Number(form.margen || 0) / 100);
    return { costoBase, costoIngs, costoPreps, costoPkg, total, conMargen };
  };

  // ── ingredientes ───────────────────────────────────────────────────────────
  const addIngrediente = (ing, tipo) => {
    const key =
      tipo === "topping" ? "ingredientes_topping" : "ingredientes_principal";
    if (form[key].find((i) => i.id === ing.id)) return;
    setForm((f) => ({ ...f, [key]: [...f[key], { ...ing, cantidad: "" }] }));
  };
  const removeIngrediente = (id, tipo) => {
    const key =
      tipo === "topping" ? "ingredientes_topping" : "ingredientes_principal";
    setForm((f) => ({ ...f, [key]: f[key].filter((i) => i.id !== id) }));
  };
  const updateCantIng = (id, val, tipo) => {
    const key =
      tipo === "topping" ? "ingredientes_topping" : "ingredientes_principal";
    setForm((f) => ({
      ...f,
      [key]: f[key].map((i) => (i.id === id ? { ...i, cantidad: val } : i)),
    }));
  };

  // ── preparaciones ──────────────────────────────────────────────────────────
  const addPrep = (prep) => {
    if (form.preparaciones.find((p) => p.id === prep.id)) return;
    setForm((f) => ({
      ...f,
      preparaciones: [...f.preparaciones, { ...prep, cantidad: "" }],
    }));
  };
  const removePrep = (id) =>
    setForm((f) => ({
      ...f,
      preparaciones: f.preparaciones.filter((p) => p.id !== id),
    }));
  const updateCantPrep = (id, val) =>
    setForm((f) => ({
      ...f,
      preparaciones: f.preparaciones.map((p) =>
        p.id === id ? { ...p, cantidad: val } : p,
      ),
    }));

  // ── packaging ──────────────────────────────────────────────────────────────
  const togglePkg = (id) =>
    setForm((f) => ({
      ...f,
      packaging_ids: f.packaging_ids.includes(id)
        ? f.packaging_ids.filter((x) => x !== id)
        : [...f.packaging_ids, id],
    }));

  // ── guardar ────────────────────────────────────────────────────────────────
  const guardar = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await guardarReceta(selected.id, {
        base_id: form.base_id,
        base_gr: Number(form.base_gr) || 0,
        ingredientes: [
          ...form.ingredientes_principal.map((i) => ({
            id: i.id,
            cantidad: Number(i.cantidad) || 0,
            tipo: "principal",
          })),
          ...form.ingredientes_topping.map((i) => ({
            id: i.id,
            cantidad: Number(i.cantidad) || 0,
            tipo: "topping",
          })),
        ],
        preparaciones: form.preparaciones.map((p) => ({
          id: p.id,
          cantidad: Number(p.cantidad) || 0,
        })),
        packaging_ids: form.packaging_ids,
        unidades: Number(form.unidades) || 1,
        margen: Number(form.margen) || 30,
      });
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la receta");
    } finally {
      setSaving(false);
    }
  };

  // ── chips disponibles ──────────────────────────────────────────────────────
  const ingUsados = new Set([
    ...form.ingredientes_principal.map((i) => i.id),
    ...form.ingredientes_topping.map((i) => i.id),
  ]);
  const ingDisponibles = (ingredientes ?? []).filter(
    (i) => !ingUsados.has(i.id),
  );
  const prepUsados = new Set(form.preparaciones.map((p) => p.id));
  const prepDisponibles = (preparaciones ?? []).filter(
    (p) => !prepUsados.has(p.id),
  );

  // ── filas ──────────────────────────────────────────────────────────────────
  const renderIngRow = (ing, tipo) => {
    const sub = Number(ing.precio_unidad ?? 0) * Number(ing.cantidad || 0);
    return (
      <View key={ing.id} style={s.ingRow}>
        <TouchableOpacity
          onPress={() => removeIngrediente(ing.id, tipo)}
          style={s.removeBtn}
        >
          <Text style={s.removeTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={s.ingNombre} numberOfLines={1}>
          {ing.nombre}
        </Text>
        <TextInput
          style={s.cantInput}
          keyboardType="decimal-pad"
          placeholder="gr"
          value={String(ing.cantidad)}
          onChangeText={(v) => updateCantIng(ing.id, v, tipo)}
        />
        <Text style={s.ingUnidad}>{ing.unidad ?? "gr"}</Text>
        {sub > 0 && <Text style={s.ingSub}>= ${fmtPeso(sub)}</Text>}
      </View>
    );
  };

  const renderPrepRow = (prep) => {
    const sub = Number(prep.costo_por_gr ?? 0) * Number(prep.cantidad || 0);
    return (
      <View key={prep.id} style={s.ingRow}>
        <TouchableOpacity
          onPress={() => removePrep(prep.id)}
          style={s.removeBtn}
        >
          <Text style={s.removeTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={s.ingNombre} numberOfLines={1}>
          {prep.nombre}
        </Text>
        <TextInput
          style={s.cantInput}
          keyboardType="decimal-pad"
          placeholder="gr"
          value={String(prep.cantidad)}
          onChangeText={(v) => updateCantPrep(prep.id, v)}
        />
        <Text style={s.ingUnidad}>gr</Text>
        {sub > 0 && <Text style={s.ingSub}>= ${fmtPeso(sub)}</Text>}
      </View>
    );
  };

  // ── modal ──────────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!selected) return null;
    const { costoBase, costoIngs, costoPreps, costoPkg, total, conMargen } =
      calcCosto();

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={s.backTxt}>← Volver</Text>
            </TouchableOpacity>
            <Text style={s.modalTitle} numberOfLines={1}>
              {selected.helado_nombre ?? selected.sabor}
            </Text>
            <TouchableOpacity onPress={guardar} disabled={saving}>
              <Text style={[s.saveTxt, saving && { opacity: 0.4 }]}>
                {saving ? "Guardando…" : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>

          {loadingDetalle ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <ScrollView contentContainerStyle={s.modalBody}>
              {/* costo */}
              <View style={s.costoBox}>
                <Text style={s.costoTitle}>💰 Costo estimado</Text>
                {costoBase > 0 && (
                  <Text style={s.costoLine}>Base: ${fmtPeso(costoBase)}</Text>
                )}
                {costoIngs > 0 && (
                  <Text style={s.costoLine}>
                    Ingredientes: ${fmtPeso(costoIngs)}
                  </Text>
                )}
                {costoPreps > 0 && (
                  <Text style={s.costoLine}>
                    Preparaciones: ${fmtPeso(costoPreps)}
                  </Text>
                )}
                {costoPkg > 0 && (
                  <Text style={s.costoLine}>
                    Packaging: ${fmtPeso(costoPkg)}
                  </Text>
                )}
                <View style={s.costoDivider} />
                <Text style={s.costoTotal}>Total: ${fmtPeso(total)}</Text>
                <Text style={s.costoPrecio}>
                  Precio sugerido (+{form.margen}%): ${fmtPeso(conMargen)}
                </Text>
              </View>

              {/* base */}
              <Text style={s.sectionTitle}>🧊 Base</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.chipScroll}
              >
                {(bases ?? []).map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[s.chip, form.base_id === b.id && s.chipSel]}
                    onPress={() => setForm((f) => ({ ...f, base_id: b.id }))}
                  >
                    <Text
                      style={[s.chipTxt, form.base_id === b.id && s.chipTxtSel]}
                    >
                      {b.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {form.base_id && (
                <View style={s.ingRow}>
                  <Text style={s.ingNombre}>
                    {(bases ?? []).find((b) => b.id === form.base_id)?.nombre}
                  </Text>
                  <TextInput
                    style={s.cantInput}
                    keyboardType="decimal-pad"
                    placeholder="gr"
                    value={String(form.base_gr)}
                    onChangeText={(v) => setForm((f) => ({ ...f, base_gr: v }))}
                  />
                  <Text style={s.ingUnidad}>gr</Text>
                </View>
              )}

              {/* ingrediente principal */}
              <Text style={s.sectionTitle}>
                🍓 Ingrediente(s) principal(es)
              </Text>
              {form.ingredientes_principal.map((i) =>
                renderIngRow(i, "principal"),
              )}
              <Text style={s.addLabel}>+ Agregar principal:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.chipScroll}
              >
                {ingDisponibles.map((ing) => (
                  <TouchableOpacity
                    key={ing.id}
                    style={s.chip}
                    onPress={() => addIngrediente(ing, "principal")}
                  >
                    <Text style={s.chipTxt}>{ing.nombre}</Text>
                  </TouchableOpacity>
                ))}
                {ingDisponibles.length === 0 && (
                  <Text style={s.emptyChip}>No hay más ingredientes</Text>
                )}
              </ScrollView>

              {/* toppings */}
              <Text style={s.sectionTitle}>✨ Toppings (opcional)</Text>
              {form.ingredientes_topping.map((i) => renderIngRow(i, "topping"))}
              <Text style={s.addLabel}>+ Agregar topping:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.chipScroll}
              >
                {ingDisponibles.map((ing) => (
                  <TouchableOpacity
                    key={ing.id}
                    style={s.chip}
                    onPress={() => addIngrediente(ing, "topping")}
                  >
                    <Text style={s.chipTxt}>{ing.nombre}</Text>
                  </TouchableOpacity>
                ))}
                {ingDisponibles.length === 0 && (
                  <Text style={s.emptyChip}>No hay más ingredientes</Text>
                )}
              </ScrollView>

              {/* preparaciones */}
              <Text style={s.sectionTitle}>🫙 Preparaciones caseras</Text>
              {form.preparaciones.map((p) => renderPrepRow(p))}
              {prepDisponibles.length > 0 && (
                <>
                  <Text style={s.addLabel}>+ Agregar preparación:</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={s.chipScroll}
                  >
                    {prepDisponibles.map((prep) => (
                      <TouchableOpacity
                        key={prep.id}
                        style={s.chip}
                        onPress={() => addPrep(prep)}
                      >
                        <Text style={s.chipTxt}>{prep.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* packaging */}
              <Text style={s.sectionTitle}>📦 Packaging</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.chipScroll}
              >
                {(packaging ?? []).map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      s.chip,
                      form.packaging_ids.includes(p.id) && s.chipSel,
                    ]}
                    onPress={() => togglePkg(p.id)}
                  >
                    <Text
                      style={[
                        s.chipTxt,
                        form.packaging_ids.includes(p.id) && s.chipTxtSel,
                      ]}
                    >
                      {p.nombre} ${fmtPeso(p.precio_unidad)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* configuración */}
              <Text style={s.sectionTitle}>⚙️ Configuración</Text>
              <View style={s.configRow}>
                <Text style={s.configLabel}>Unidades por receta</Text>
                <TextInput
                  style={s.configInput}
                  keyboardType="number-pad"
                  value={String(form.unidades)}
                  onChangeText={(v) => setForm((f) => ({ ...f, unidades: v }))}
                />
              </View>
              <View style={s.configRow}>
                <Text style={s.configLabel}>Margen de ganancia (%)</Text>
                <TextInput
                  style={s.configInput}
                  keyboardType="number-pad"
                  value={String(form.margen)}
                  onChangeText={(v) => setForm((f) => ({ ...f, margen: v }))}
                />
              </View>

              <View style={{ height: 60 }} />
            </ScrollView>
          )}
        </View>
      </Modal>
    );
  };

  // ── lista ──────────────────────────────────────────────────────────────────
  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={s.container}>
      <Text style={s.hint}>
        Toca un helado para definir su receta y ver el costo
      </Text>
      <FlatList
        data={recetas ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const tieneCosto = Number(item.costo_total) > 0;
          return (
            <TouchableOpacity
              style={s.heladoRow}
              onPress={() => openHelado(item)}
            >
              <View style={s.heladoInfo}>
                <Text style={s.heladoNombre}>
                  {item.helado_nombre ?? item.sabor}
                </Text>
                {tieneCosto ? (
                  <Text style={s.heladoCosto}>
                    Costo: ${fmtPeso(item.costo_total)}
                  </Text>
                ) : (
                  <Text style={s.heladoSinReceta}>Sin receta →</Text>
                )}
              </View>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={s.separator} />}
      />
      {renderModal()}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  hint: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    paddingVertical: 10,
  },
  heladoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  heladoInfo: { flex: 1 },
  heladoNombre: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  heladoCosto: { fontSize: 13, color: "#00796b", marginTop: 2 },
  heladoSinReceta: { fontSize: 13, color: "#aaa", marginTop: 2 },
  arrow: { fontSize: 20, color: "#ccc" },
  separator: { height: 1, backgroundColor: "#f0f0f0", marginLeft: 16 },

  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backTxt: { fontSize: 15, color: "#1976d2" },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    textAlign: "center",
  },
  saveTxt: { fontSize: 15, color: "#00796b", fontWeight: "600" },
  modalBody: { padding: 16 },

  costoBox: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  costoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 6,
  },
  costoLine: { fontSize: 13, color: "#388e3c", fontFamily: "monospace" },
  costoDivider: { height: 1, backgroundColor: "#a5d6a7", marginVertical: 6 },
  costoTotal: { fontSize: 15, fontWeight: "700", color: "#1b5e20" },
  costoPrecio: { fontSize: 14, color: "#388e3c", marginTop: 2 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  chipScroll: { flexGrow: 0, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    backgroundColor: "#fafafa",
  },
  chipSel: { backgroundColor: "#1976d2", borderColor: "#1976d2" },
  chipTxt: { fontSize: 13, color: "#444" },
  chipTxtSel: { color: "#fff" },
  emptyChip: {
    fontSize: 12,
    color: "#aaa",
    alignSelf: "center",
    paddingVertical: 7,
  },
  addLabel: { fontSize: 12, color: "#888", marginBottom: 4 },

  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffebee",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  removeTxt: { fontSize: 11, color: "#c62828" },
  ingNombre: { flex: 1, fontSize: 14, color: "#333" },
  cantInput: {
    width: 60,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    textAlign: "right",
    marginHorizontal: 6,
  },
  ingUnidad: { fontSize: 12, color: "#888", width: 24 },
  ingSub: { fontSize: 12, color: "#00796b", marginLeft: 4 },

  configRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  configLabel: { fontSize: 14, color: "#555" },
  configInput: {
    width: 70,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    textAlign: "right",
  },
});
