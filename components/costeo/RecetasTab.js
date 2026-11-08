// components/costeo/RecetasTab.js
import React, { useState } from "react";
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

// ── formato (sin dependencias externas) ─────────────────────────────────────
const fmtPeso = (n) => {
  const v = Math.round(Number(n ?? 0));
  return isNaN(v) ? "0" : v.toLocaleString("es-CO");
};
// cantidades: 90.0000 → "90" · 1.5 → "1.5"
const fmtCant = (n) => {
  const v = Number(n ?? 0);
  if (isNaN(v)) return "0";
  return v % 1 === 0 ? String(v) : parseFloat(v.toFixed(4)).toString();
};
// precio por unidad: 38 → "38" · 4.2 → "4,2" (no redondea a 4)
const fmtUnit = (n) => {
  const v = Number(n ?? 0);
  if (isNaN(v)) return "0";
  return v >= 100
    ? fmtPeso(v)
    : v.toLocaleString("es-CO", { maximumFractionDigits: 2 });
};
// acepta "0,5" y "0.5"
const toNum = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const EMPTY_FORM = {
  base_id: null,
  base_ml: "",
  ingredientes_principal: [],
  ingredientes_topping: [],
  preparaciones: [],
  packaging_ids: [],
  margen: "60",
};

export default function RecetasTab() {
  const {
    recetas, // todos los helados; `id` = id del helado, `receta_id` = null si no tiene receta
    bases,
    ingredientes,
    preparaciones,
    packaging,
    costosFijos,
    loading,
    fetchRecetaDetalle,
    fetchBases,
    fetchPreparaciones,
    guardarReceta,
  } = useCosteo();

  const [selected, setSelected] = useState(null); // helado seleccionado
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // ── abrir detalle ──────────────────────────────────────────────────────────
  const openHelado = async (item) => {
    setSelected(item);
    setForm(EMPTY_FORM);
    setModalVisible(true);
    setLoadingDetalle(true);
    try {
      // Bases y preparaciones traen su costo calculado en el servidor: si se
      // cambió el precio de un ingrediente, hay que refrescarlas.
      try {
        await fetchBases();
        await fetchPreparaciones();
      } catch (_) {}

      if (!item.receta_id) return; // helado sin receta: formulario vacío

      const detalle = await fetchRecetaDetalle(item.id);
      if (!detalle) {
        // No mostrar un formulario vacío: al guardar pisaría la receta real.
        setModalVisible(false);
        Alert.alert("Error", "No se pudo cargar la receta de este helado");
        return;
      }
      const ings = detalle.ingredientes ?? [];
      const aFila = (i) => ({
        id: i.ingrediente_id,
        nombre: i.nombre,
        unidad: i.unidad,
        precio_unidad: i.precio_unidad,
        cantidad: fmtCant(i.cantidad),
      });
      setForm({
        base_id: detalle.base_id ?? null,
        base_ml: detalle.base_id ? fmtCant(detalle.base_ml) : "",
        ingredientes_principal: ings
          .filter((i) => i.tipo !== "topping")
          .map(aFila),
        ingredientes_topping: ings
          .filter((i) => i.tipo === "topping")
          .map(aFila),
        preparaciones: (detalle.preparaciones ?? []).map((p) => ({
          id: p.prep_id,
          nombre: p.nombre,
          unidad: p.unidad,
          costo_por_gr: p.costo_por_gr,
          cantidad: fmtCant(p.cantidad),
        })),
        packaging_ids: (detalle.packaging ?? []).map((p) => p.packaging_id),
        margen: fmtCant(detalle.margen_pct ?? 60),
      });
    } finally {
      setLoadingDetalle(false);
    }
  };

  // ── costo en tiempo real ───────────────────────────────────────────────────
  const baseSel = (bases ?? []).find((b) => b.id === form.base_id);

  const calcCosto = () => {
    const costoBase = baseSel
      ? Number(baseSel.costo_por_ml ?? 0) * toNum(form.base_ml)
      : 0;
    const costoIngs = [
      ...form.ingredientes_principal,
      ...form.ingredientes_topping,
    ].reduce(
      (acc, i) => acc + Number(i.precio_unidad ?? 0) * toNum(i.cantidad),
      0,
    );
    const costoPreps = form.preparaciones.reduce(
      (acc, p) => acc + Number(p.costo_por_gr ?? 0) * toNum(p.cantidad),
      0,
    );
    const costoPkg = (packaging ?? [])
      .filter((p) => form.packaging_ids.includes(p.id))
      .reduce((acc, p) => acc + Number(p.precio_unidad ?? 0), 0);
    const costoFijo = Number(costosFijos?.costo_fijo_por_unidad ?? 0);

    const total = costoBase + costoIngs + costoPreps + costoPkg + costoFijo;
    const m = toNum(form.margen);
    // precio = costo / (1 − margen%)
    const precioSug = m >= 0 && m < 100 ? total / (1 - m / 100) : null;
    return {
      costoBase,
      costoIngs,
      costoPreps,
      costoPkg,
      costoFijo,
      total,
      precioSug,
    };
  };

  // composición de la base escalada a los ml de ESTE helado
  const baseLineas = () => {
    const ml = toNum(form.base_ml);
    const rend = Number(baseSel?.rendimiento_ml ?? 0);
    if (!baseSel || !(ml > 0) || !(rend > 0)) return [];
    const f = ml / rend;
    return [
      ...(baseSel.ingredientes ?? []).map((i) => ({
        key: `i${i.ingrediente_id}`,
        nombre: i.ingr_nombre,
        unidad: i.unidad,
        cantidad: Number(i.cantidad) * f,
        precio: Number(i.precio_unidad),
      })),
      ...(baseSel.sub_bases ?? []).map((b) => ({
        key: `b${b.base_origen_id}`,
        nombre: `🧊 ${b.origen_nombre}`,
        unidad: "ml",
        cantidad: Number(b.cantidad_ml) * f,
        precio: Number(b.costo_por_ml),
      })),
    ];
  };

  // ── ingredientes ───────────────────────────────────────────────────────────
  const keyDe = (tipo) =>
    tipo === "topping" ? "ingredientes_topping" : "ingredientes_principal";

  const addIngrediente = (ing, tipo) => {
    const key = keyDe(tipo);
    setForm((f) => ({
      ...f,
      [key]: [
        ...f[key],
        {
          id: ing.id,
          nombre: ing.nombre,
          unidad: ing.unidad,
          precio_unidad: ing.precio_unidad,
          cantidad: "",
        },
      ],
    }));
  };
  const removeIngrediente = (id, tipo) => {
    const key = keyDe(tipo);
    setForm((f) => ({ ...f, [key]: f[key].filter((i) => i.id !== id) }));
  };
  const updateCantIng = (id, val, tipo) => {
    const key = keyDe(tipo);
    setForm((f) => ({
      ...f,
      [key]: f[key].map((i) => (i.id === id ? { ...i, cantidad: val } : i)),
    }));
  };

  // ── preparaciones ──────────────────────────────────────────────────────────
  const addPrep = (prep) =>
    setForm((f) => ({
      ...f,
      preparaciones: [
        ...f.preparaciones,
        {
          id: prep.id,
          nombre: prep.nombre,
          unidad: prep.unidad,
          costo_por_gr: prep.costo_por_gr,
          cantidad: "",
        },
      ],
    }));
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

    if (form.base_id && !(toNum(form.base_ml) > 0))
      return Alert.alert("Base", "Indica cuántos ml de base lleva este helado");
    const todas = [
      ...form.ingredientes_principal,
      ...form.ingredientes_topping,
      ...form.preparaciones,
    ];
    if (todas.some((l) => !(toNum(l.cantidad) > 0)))
      return Alert.alert(
        "Cantidades",
        "Hay ingredientes o preparaciones sin cantidad. Complétalas o quítalas.",
      );
    const m = toNum(form.margen);
    if (!(m >= 0 && m < 100))
      return Alert.alert("Margen", "El margen debe estar entre 0 y 99 %");

    setSaving(true);
    try {
      await guardarReceta(selected.id, {
        base_id: form.base_id,
        base_ml: form.base_id ? toNum(form.base_ml) : 0,
        ingredientes: [
          ...form.ingredientes_principal.map((i) => ({
            ingrediente_id: i.id,
            cantidad: toNum(i.cantidad),
            tipo: "principal",
          })),
          ...form.ingredientes_topping.map((i) => ({
            ingrediente_id: i.id,
            cantidad: toNum(i.cantidad),
            tipo: "topping",
          })),
        ],
        preparaciones: form.preparaciones.map((p) => ({
          prep_id: p.id,
          cantidad: toNum(p.cantidad),
        })),
        packaging_ids: form.packaging_ids,
        margen_pct: m,
      });
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", e.message || "No se pudo guardar la receta");
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
  // 12 gr × $38/gr = $456
  const renderFila = ({
    key,
    nombre,
    unidad,
    cantidad,
    precio,
    onRemove,
    onChange,
  }) => {
    const q = toNum(cantidad);
    const sub = Number(precio ?? 0) * q;
    return (
      <View key={key} style={s.filaWrap}>
        <View style={s.ingRow}>
          <TouchableOpacity onPress={onRemove} style={s.removeBtn}>
            <Text style={s.removeTxt}>✕</Text>
          </TouchableOpacity>
          <Text style={s.ingNombre} numberOfLines={1}>
            {nombre}
          </Text>
          <TextInput
            style={s.cantInput}
            keyboardType="decimal-pad"
            placeholder={unidad ?? "gr"}
            value={String(cantidad)}
            onChangeText={onChange}
          />
          <Text style={s.ingUnidad}>{unidad ?? "gr"}</Text>
        </View>
        {sub > 0 && (
          <Text style={s.ingDetalle}>
            {fmtCant(q)} {unidad ?? "gr"} × ${fmtUnit(precio)}/{unidad ?? "gr"}{" "}
            = ${fmtPeso(sub)}
          </Text>
        )}
      </View>
    );
  };

  const renderIngRow = (ing, tipo) =>
    renderFila({
      key: `${tipo}-${ing.id}`,
      nombre: ing.nombre,
      unidad: ing.unidad,
      cantidad: ing.cantidad,
      precio: ing.precio_unidad,
      onRemove: () => removeIngrediente(ing.id, tipo),
      onChange: (v) => updateCantIng(ing.id, v, tipo),
    });

  const renderPrepRow = (prep) =>
    renderFila({
      key: `prep-${prep.id}`,
      nombre: prep.nombre,
      unidad: prep.unidad ?? "gr",
      cantidad: prep.cantidad,
      precio: prep.costo_por_gr,
      onRemove: () => removePrep(prep.id),
      onChange: (v) => updateCantPrep(prep.id, v),
    });

  const renderChips = (items, onPress, vacio) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.chipScroll}
    >
      {items.map((it) => (
        <TouchableOpacity
          key={it.id}
          style={s.chip}
          onPress={() => onPress(it)}
        >
          <Text style={s.chipTxt}>{it.nombre}</Text>
        </TouchableOpacity>
      ))}
      {items.length === 0 && <Text style={s.emptyChip}>{vacio}</Text>}
    </ScrollView>
  );

  // ── modal ──────────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!selected) return null;
    const c = calcCosto();
    const lineasBase = baseLineas();

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
              {selected.helado_nombre}
            </Text>
            <TouchableOpacity
              onPress={guardar}
              disabled={saving || loadingDetalle}
            >
              <Text
                style={[
                  s.saveTxt,
                  (saving || loadingDetalle) && { opacity: 0.4 },
                ]}
              >
                {saving ? "Guardando…" : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>

          {loadingDetalle ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <ScrollView
              contentContainerStyle={s.modalBody}
              keyboardShouldPersistTaps="handled"
            >
              {/* costo */}
              <View style={s.costoBox}>
                <Text style={s.costoTitle}>💰 Costo de producción</Text>
                {c.costoBase > 0 && (
                  <Text style={s.costoLine}>Base: ${fmtPeso(c.costoBase)}</Text>
                )}
                {c.costoIngs > 0 && (
                  <Text style={s.costoLine}>
                    Ingredientes: ${fmtPeso(c.costoIngs)}
                  </Text>
                )}
                {c.costoPreps > 0 && (
                  <Text style={s.costoLine}>
                    Preparaciones: ${fmtPeso(c.costoPreps)}
                  </Text>
                )}
                {c.costoPkg > 0 && (
                  <Text style={s.costoLine}>
                    Packaging: ${fmtPeso(c.costoPkg)}
                  </Text>
                )}
                {c.costoFijo > 0 && (
                  <Text style={s.costoLine}>
                    Costos fijos: ${fmtPeso(c.costoFijo)}
                  </Text>
                )}
                <View style={s.costoDivider} />
                <Text style={s.costoTotal}>Total: ${fmtPeso(c.total)}</Text>
                <Text style={s.costoPrecio}>
                  {c.precioSug == null
                    ? "Precio sugerido: — (margen inválido)"
                    : `Precio sugerido (margen ${fmtCant(toNum(form.margen))}%): $${fmtPeso(c.precioSug)}`}
                </Text>
                {Number(selected.precio_venta) > 0 && (
                  <Text style={s.costoActual}>
                    Precio de venta actual: ${fmtPeso(selected.precio_venta)}
                  </Text>
                )}
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
                    onPress={() =>
                      setForm((f) => ({
                        ...f,
                        base_id: f.base_id === b.id ? null : b.id,
                      }))
                    }
                  >
                    <Text
                      style={[s.chipTxt, form.base_id === b.id && s.chipTxtSel]}
                    >
                      {b.nombre} · ${fmtUnit(b.costo_por_ml)}/ml
                    </Text>
                  </TouchableOpacity>
                ))}
                {(bases ?? []).length === 0 && (
                  <Text style={s.emptyChip}>Aún no hay bases</Text>
                )}
              </ScrollView>
              {baseSel && (
                <>
                  <View style={s.ingRow}>
                    <Text style={s.ingNombre}>{baseSel.nombre}</Text>
                    <TextInput
                      style={s.cantInput}
                      keyboardType="decimal-pad"
                      placeholder="ml"
                      value={String(form.base_ml)}
                      onChangeText={(v) =>
                        setForm((f) => ({ ...f, base_ml: v }))
                      }
                    />
                    <Text style={s.ingUnidad}>ml</Text>
                  </View>
                  <Text style={s.hint}>
                    Cuántos ml de base lleva ESTE helado
                  </Text>
                  {lineasBase.map((l) => (
                    <View key={l.key} style={s.baseLinea}>
                      <Text style={s.baseLineaNombre} numberOfLines={1}>
                        {l.nombre}
                      </Text>
                      <Text style={s.baseLineaDetalle}>
                        {fmtCant(Math.round(l.cantidad * 100) / 100)} {l.unidad}{" "}
                        × ${fmtUnit(l.precio)} = $
                        {fmtPeso(l.cantidad * l.precio)}
                      </Text>
                    </View>
                  ))}
                </>
              )}

              {/* ingrediente principal */}
              <Text style={s.sectionTitle}>
                🍓 Ingrediente(s) principal(es)
              </Text>
              {form.ingredientes_principal.map((i) =>
                renderIngRow(i, "principal"),
              )}
              <Text style={s.addLabel}>+ Añadir ingrediente:</Text>
              {renderChips(
                ingDisponibles,
                (ing) => addIngrediente(ing, "principal"),
                "No hay más ingredientes",
              )}

              {/* toppings */}
              <Text style={s.sectionTitle}>✨ Toppings (opcional)</Text>
              {form.ingredientes_topping.map((i) => renderIngRow(i, "topping"))}
              <Text style={s.addLabel}>+ Añadir topping:</Text>
              {renderChips(
                ingDisponibles,
                (ing) => addIngrediente(ing, "topping"),
                "No hay más ingredientes",
              )}

              {/* preparaciones */}
              <Text style={s.sectionTitle}>🫙 Preparaciones caseras</Text>
              {form.preparaciones.map((p) => renderPrepRow(p))}
              {prepDisponibles.length > 0 && (
                <>
                  <Text style={s.addLabel}>+ Añadir preparación:</Text>
                  {renderChips(prepDisponibles, addPrep, "")}
                </>
              )}

              {/* packaging */}
              <Text style={s.sectionTitle}>📦 Packaging para este helado</Text>
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
                      {p.nombre} — ${fmtPeso(p.precio_unidad)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* configuración */}
              <Text style={s.sectionTitle}>⚙️ Configuración</Text>
              <View style={s.configRow}>
                <Text style={s.configLabel}>% de margen deseado</Text>
                <TextInput
                  style={s.configInput}
                  keyboardType="decimal-pad"
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
      <Text style={s.hintTop}>
        Toca un helado para definir su receta y ver el costo
      </Text>
      <FlatList
        data={recetas ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const tieneReceta = !!item.receta_id;
          const tieneCosto = Number(item.costo_total) > 0;
          return (
            <TouchableOpacity
              style={s.heladoRow}
              onPress={() => openHelado(item)}
            >
              <View style={s.heladoInfo}>
                <Text style={s.heladoNombre}>{item.helado_nombre}</Text>
                {tieneReceta ? (
                  <Text style={s.heladoCosto}>
                    {tieneCosto
                      ? `Costo: $${fmtPeso(item.costo_total)}`
                      : "Receta guardada"}
                    {item.base_nombre ? ` · ${item.base_nombre}` : ""}
                    {Number(item.precio_venta) > 0
                      ? ` · Vende $${fmtPeso(item.precio_venta)}`
                      : ""}
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
  hintTop: {
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
  costoLine: { fontSize: 13, color: "#388e3c" },
  costoDivider: { height: 1, backgroundColor: "#a5d6a7", marginVertical: 6 },
  costoTotal: { fontSize: 15, fontWeight: "700", color: "#1b5e20" },
  costoPrecio: { fontSize: 14, color: "#388e3c", marginTop: 2 },
  costoActual: { fontSize: 12, color: "#66806a", marginTop: 4 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  hint: { fontSize: 11, color: "#999", marginTop: 4, marginBottom: 4 },
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

  filaWrap: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 4,
  },
  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
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
    width: 70,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    textAlign: "right",
    marginHorizontal: 6,
  },
  ingUnidad: { fontSize: 12, color: "#888", width: 34 },
  ingDetalle: {
    fontSize: 12,
    color: "#00796b",
    marginLeft: 32,
    marginBottom: 2,
  },

  baseLinea: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingLeft: 8,
  },
  baseLineaNombre: { flex: 1, fontSize: 12, color: "#666" },
  baseLineaDetalle: { fontSize: 12, color: "#888" },

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
