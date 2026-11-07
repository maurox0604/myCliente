// components/costeo/RecetasTab.js
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useContext, useMemo } from "react";
import { useCosteo } from "../../context/CosteoContext";
import { HeladosContext } from "../../context/HeladosContext";

const fmt = (n) => {
  const v = Number(n ?? 0);
  if (isNaN(v)) return "0";
  return Math.round(v).toLocaleString("es-CO");
};

export default function RecetasTab() {
  const { helados } = useContext(HeladosContext);
  const {
    recetas,
    ingredientes,
    preparaciones,
    packaging: pkgList,
    bases,
    costosFijos,
    fetchRecetaDetalle,
    guardarReceta,
  } = useCosteo();

  const [modalVisible, setModalVisible] = useState(false);
  const [heladoSel, setHeladoSel] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loadingDet, setLoadingDet] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const FORM_VACIO = {
    base_id: null,
    base_gr: "", // gramos de base por unidad (antes volumen_base_ml)
    mano_de_obra: "",
    margen_ganancia: "2.5",
    notas: "",
    ingredientes: [], // [{ ingrediente_id, cantidad }]
    preparaciones: [], // [{ prep_id, cantidad }]
    packaging: [], // [{ packaging_id, cantidad }]
  };
  const [form, setForm] = useState(FORM_VACIO);

  // ── Costo en vivo ────────────────────────────────────────────
  const costoVivo = useMemo(() => {
    let total = 0;

    // Base
    if (form.base_id && form.base_gr) {
      const base = bases.find((b) => b.id === form.base_id);
      if (base && base.costo_tanda > 0) {
        // costo por gr = costo_tanda / (suma gr ingredientes base)
        // Si no tenemos ese dato, usamos costo_tanda como referencia
        total += Number(form.base_gr) * (base.costo_tanda / 1000); // aprox
      }
    }

    // Ingredientes
    for (const fi of form.ingredientes) {
      const ing = ingredientes.find((i) => i.id === fi.ingrediente_id);
      if (ing)
        total += Number(fi.cantidad || 0) * Number(ing.precio_unidad || 0);
    }

    // Preparaciones
    for (const fp of form.preparaciones) {
      const prep = preparaciones.find((p) => p.id === fp.prep_id);
      if (prep && prep.rendimiento_gr > 0) {
        // costo_por_gr lo calcula el backend; usamos el que traiga el detalle
        const cpg = prep.costo_por_gr ?? 0;
        total += Number(fp.cantidad || 0) * Number(cpg);
      }
    }

    // Packaging
    for (const fp of form.packaging) {
      const pkg = pkgList.find((p) => p.id === fp.packaging_id);
      if (pkg)
        total += Number(fp.cantidad || 0) * Number(pkg.precio_unidad || 0);
    }

    // Costos fijos
    if (costosFijos?.costo_fijo_por_unidad) {
      total += Number(costosFijos.costo_fijo_por_unidad);
    }

    // Mano de obra
    total += Number(form.mano_de_obra || 0);

    return total;
  }, [form, bases, ingredientes, preparaciones, pkgList, costosFijos]);

  // ── Abrir modal ──────────────────────────────────────────────
  const abrirReceta = async (helado) => {
    setHeladoSel(helado);
    setLoadingDet(true);
    setModalVisible(true);
    setForm(FORM_VACIO);
    setDetalle(null);

    const det = await fetchRecetaDetalle(helado.id);
    if (det) {
      setDetalle(det);
      setForm({
        base_id: det.base_id ?? null,
        base_gr: String(det.volumen_base_ml ?? ""),
        mano_de_obra: String(det.mano_de_obra ?? ""),
        margen_ganancia: String(det.margen_ganancia ?? "2.5"),
        notas: det.notas ?? "",
        ingredientes: (det.ingredientes ?? []).map((i) => ({
          ingrediente_id: i.ingrediente_id,
          cantidad: String(i.cantidad),
        })),
        preparaciones: (det.preparaciones ?? []).map((p) => ({
          prep_id: p.prep_id ?? p.preparacion_id,
          cantidad: String(p.cantidad),
        })),
        packaging: (det.packaging ?? []).map((p) => ({
          packaging_id: p.packaging_id,
          cantidad: String(p.cantidad),
        })),
      });
    }
    setLoadingDet(false);
  };

  // ── Guardar ──────────────────────────────────────────────────
  const guardar = async () => {
    if (!heladoSel) return;
    setGuardando(true);
    try {
      await guardarReceta(heladoSel.id, {
        base_id: form.base_id,
        volumen_base_ml: Number(form.base_gr) || 0,
        mano_de_obra: Number(form.mano_de_obra) || 0,
        margen_ganancia: Number(form.margen_ganancia) || 2.5,
        notas: form.notas,
        ingredientes: form.ingredientes.map((i) => ({
          ingrediente_id: i.ingrediente_id,
          cantidad: Number(i.cantidad),
        })),
        preparaciones: form.preparaciones.map((p) => ({
          prep_id: p.prep_id,
          cantidad: Number(p.cantidad),
        })),
        packaging: form.packaging.map((p) => ({
          packaging_id: p.packaging_id,
          cantidad: Number(p.cantidad),
        })),
      });
      const det = await fetchRecetaDetalle(heladoSel.id);
      setDetalle(det);
      Alert.alert("✅ Guardado", "Costeo actualizado correctamente");
    } catch (e) {
      Alert.alert("Error al guardar", e.message);
    } finally {
      setGuardando(false);
    }
  };

  // ── Helpers add/remove ────────────────────────────────────────
  const addIngrediente = (id) => {
    if (form.ingredientes.find((i) => i.ingrediente_id === id)) return;
    setForm((f) => ({
      ...f,
      ingredientes: [...f.ingredientes, { ingrediente_id: id, cantidad: "" }],
    }));
  };
  const removeIngrediente = (id) =>
    setForm((f) => ({
      ...f,
      ingredientes: f.ingredientes.filter((i) => i.ingrediente_id !== id),
    }));
  const setCantIngrediente = (id, v) =>
    setForm((f) => ({
      ...f,
      ingredientes: f.ingredientes.map((i) =>
        i.ingrediente_id === id ? { ...i, cantidad: v } : i,
      ),
    }));

  const addPreparacion = (id) => {
    if (form.preparaciones.find((p) => p.prep_id === id)) return;
    setForm((f) => ({
      ...f,
      preparaciones: [...f.preparaciones, { prep_id: id, cantidad: "" }],
    }));
  };
  const removePreparacion = (id) =>
    setForm((f) => ({
      ...f,
      preparaciones: f.preparaciones.filter((p) => p.prep_id !== id),
    }));
  const setCantPreparacion = (id, v) =>
    setForm((f) => ({
      ...f,
      preparaciones: f.preparaciones.map((p) =>
        p.prep_id === id ? { ...p, cantidad: v } : p,
      ),
    }));

  const addPackaging = (id) => {
    if (form.packaging.find((p) => p.packaging_id === id)) return;
    setForm((f) => ({
      ...f,
      packaging: [...f.packaging, { packaging_id: id, cantidad: "1" }],
    }));
  };
  const removePackaging = (id) =>
    setForm((f) => ({
      ...f,
      packaging: f.packaging.filter((p) => p.packaging_id !== id),
    }));

  const getReceta = (helado_id) =>
    recetas.find((r) => r.helado_id === helado_id);

  return (
    <View style={s.container}>
      <FlatList
        data={helados?.filter((h) => h.activo !== 0) ?? []}
        keyExtractor={(h) => String(h.id)}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <Text style={s.empty}>No hay helados registrados.</Text>
        }
        renderItem={({ item: helado }) => {
          const rec = getReceta(helado.id);
          return (
            <Pressable style={s.heladoCard} onPress={() => abrirReceta(helado)}>
              <View style={s.heladoIcono}>
                <Text style={{ fontSize: 22 }}>🍦</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.heladoNombre}>{helado.sabor}</Text>
                <Text style={rec ? s.conReceta : s.sinReceta}>
                  {rec
                    ? `Precio venta: $${fmt(helado.precio)}`
                    : "Sin costeo — toca para crear"}
                </Text>
              </View>
              <Text style={s.arrow}>›</Text>
            </Pressable>
          );
        }}
      />

      {/* ── MODAL COSTEO ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={s.modal}>
          {/* Header */}
          <View style={s.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)} style={s.backBtn}>
              <Text style={s.backBtnText}>‹ Volver</Text>
            </Pressable>
            <Text style={s.modalTitle} numberOfLines={1}>
              {heladoSel?.sabor}
            </Text>
          </View>

          {loadingDet ? (
            <View style={s.center}>
              <ActivityIndicator color="#e91e63" size="large" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{
                padding: 16,
                gap: 14,
                paddingBottom: 50,
              }}
            >
              {/* ── COSTO EN VIVO ── */}
              <View style={s.costoVivoBox}>
                <Text style={s.costoVivoLabel}>Costo estimado por unidad</Text>
                <Text style={s.costoVivoValor}>${fmt(costoVivo)}</Text>
                {heladoSel?.precio > 0 && (
                  <Text style={s.costoVivoMargen}>
                    Precio actual: ${fmt(heladoSel.precio)}
                    {costoVivo > 0
                      ? `  ·  Margen: ${(((heladoSel.precio - costoVivo) / heladoSel.precio) * 100).toFixed(0)}%`
                      : ""}
                  </Text>
                )}
              </View>

              {/* ── DESGLOSE GUARDADO (si existe) ── */}
              {detalle?.desglose && (
                <View style={s.seccion}>
                  <Text style={s.secTitulo}>📊 Último costeo guardado</Text>
                  <DesgloseRow
                    label="Base"
                    valor={detalle.desglose.costo_base}
                  />
                  <DesgloseRow
                    label="Ingredientes"
                    valor={detalle.desglose.costo_ingredientes}
                  />
                  <DesgloseRow
                    label="Preparaciones"
                    valor={detalle.desglose.costo_preparaciones}
                  />
                  <DesgloseRow
                    label="Packaging"
                    valor={detalle.desglose.costo_packaging}
                  />
                  <DesgloseRow
                    label="Costos fijos"
                    valor={detalle.desglose.costo_fijo_unit}
                  />
                  <DesgloseRow
                    label="Mano de obra"
                    valor={detalle.desglose.costo_mdo}
                  />
                  <View style={s.desgloseTotalRow}>
                    <Text style={s.desgloseTotalLabel}>Costo total</Text>
                    <Text style={s.desgloseTotalValor}>
                      ${fmt(detalle.desglose.costo_total)}
                    </Text>
                  </View>
                  <View style={[s.desgloseTotalRow, { marginTop: 4 }]}>
                    <Text style={[s.desgloseTotalLabel, { color: "#2e7d32" }]}>
                      Precio sugerido
                    </Text>
                    <Text style={[s.desgloseTotalValor, { color: "#2e7d32" }]}>
                      ${fmt(detalle.desglose.precio_sugerido)}
                    </Text>
                  </View>
                  {detalle.desglose.margen_real_pct != null && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#777",
                        textAlign: "center",
                        marginTop: 6,
                      }}
                    >
                      Margen real: {detalle.desglose.margen_real_pct}% · Precio
                      actual: ${fmt(detalle.desglose.precio_venta_actual)}
                    </Text>
                  )}
                </View>
              )}

              {/* ── BASE ── */}
              <View style={s.seccion}>
                <Text style={s.secTitulo}>🧊 Base de mezcla</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View
                    style={{ flexDirection: "row", gap: 8, paddingVertical: 4 }}
                  >
                    <Pressable
                      style={[s.chip, !form.base_id && s.chipActivo]}
                      onPress={() =>
                        setForm((f) => ({ ...f, base_id: null, base_gr: "" }))
                      }
                    >
                      <Text
                        style={[s.chipTxt, !form.base_id && s.chipTxtActivo]}
                      >
                        Sin base
                      </Text>
                    </Pressable>
                    {bases.map((b) => (
                      <Pressable
                        key={b.id}
                        style={[s.chip, form.base_id === b.id && s.chipActivo]}
                        onPress={() =>
                          setForm((f) => ({ ...f, base_id: b.id }))
                        }
                      >
                        <Text
                          style={[
                            s.chipTxt,
                            form.base_id === b.id && s.chipTxtActivo,
                          ]}
                        >
                          {b.nombre}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
                {form.base_id && (
                  <View style={s.inputRow}>
                    <Text style={s.inputLabel}>Gramos de base por unidad</Text>
                    <TextInput
                      style={s.inputNum}
                      value={form.base_gr}
                      onChangeText={(v) =>
                        setForm((f) => ({ ...f, base_gr: v }))
                      }
                      keyboardType="numeric"
                      placeholder="ej: 80"
                    />
                    <Text style={s.inputSufijo}>gr</Text>
                  </View>
                )}
              </View>

              {/* ── INGREDIENTES ── */}
              <View style={s.seccion}>
                <Text style={s.secTitulo}>🥛 Ingredientes</Text>
                {form.ingredientes.map((fi) => {
                  const ing = ingredientes.find(
                    (i) => i.id === fi.ingrediente_id,
                  );
                  return (
                    <View key={fi.ingrediente_id} style={s.itemRow}>
                      <Text style={s.itemNombre}>{ing?.nombre}</Text>
                      <TextInput
                        style={s.inputNum}
                        value={fi.cantidad}
                        onChangeText={(v) =>
                          setCantIngrediente(fi.ingrediente_id, v)
                        }
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <Text style={s.inputSufijo}>{ing?.unidad}</Text>
                      <Pressable
                        onPress={() => removeIngrediente(fi.ingrediente_id)}
                        style={s.removeBtn}
                      >
                        <Text style={s.removeBtnTxt}>✕</Text>
                      </Pressable>
                    </View>
                  );
                })}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                >
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {ingredientes
                      .filter(
                        (i) =>
                          !form.ingredientes.find(
                            (fi) => fi.ingrediente_id === i.id,
                          ),
                      )
                      .map((i) => (
                        <Pressable
                          key={i.id}
                          style={s.addChip}
                          onPress={() => addIngrediente(i.id)}
                        >
                          <Text style={s.addChipTxt}>+ {i.nombre}</Text>
                        </Pressable>
                      ))}
                  </View>
                </ScrollView>
              </View>

              {/* ── PREPARACIONES ── */}
              <View style={s.seccion}>
                <Text style={s.secTitulo}>🫙 Preparaciones caseras</Text>
                {form.preparaciones.map((fp) => {
                  const prep = preparaciones.find((p) => p.id === fp.prep_id);
                  return (
                    <View key={fp.prep_id} style={s.itemRow}>
                      <Text style={s.itemNombre}>{prep?.nombre}</Text>
                      <TextInput
                        style={s.inputNum}
                        value={fp.cantidad}
                        onChangeText={(v) => setCantPreparacion(fp.prep_id, v)}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <Text style={s.inputSufijo}>{prep?.unidad ?? "gr"}</Text>
                      <Pressable
                        onPress={() => removePreparacion(fp.prep_id)}
                        style={s.removeBtn}
                      >
                        <Text style={s.removeBtnTxt}>✕</Text>
                      </Pressable>
                    </View>
                  );
                })}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                >
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {preparaciones
                      .filter(
                        (p) =>
                          !form.preparaciones.find((fp) => fp.prep_id === p.id),
                      )
                      .map((p) => (
                        <Pressable
                          key={p.id}
                          style={[
                            s.addChip,
                            {
                              backgroundColor: "#ede7f6",
                              borderColor: "#7c3aed",
                            },
                          ]}
                          onPress={() => addPreparacion(p.id)}
                        >
                          <Text style={[s.addChipTxt, { color: "#5b21b6" }]}>
                            + {p.nombre}
                          </Text>
                        </Pressable>
                      ))}
                  </View>
                </ScrollView>
              </View>

              {/* ── PACKAGING ── */}
              <View style={s.seccion}>
                <Text style={s.secTitulo}>📦 Packaging</Text>
                {form.packaging.map((fp) => {
                  const pkg = pkgList.find((p) => p.id === fp.packaging_id);
                  return (
                    <View key={fp.packaging_id} style={s.itemRow}>
                      <Text style={s.itemNombre}>{pkg?.nombre}</Text>
                      <TextInput
                        style={s.inputNum}
                        value={fp.cantidad}
                        onChangeText={(v) =>
                          setForm((f) => ({
                            ...f,
                            packaging: f.packaging.map((p) =>
                              p.packaging_id === fp.packaging_id
                                ? { ...p, cantidad: v }
                                : p,
                            ),
                          }))
                        }
                        keyboardType="numeric"
                        placeholder="1"
                      />
                      <Text style={s.inputSufijo}>und</Text>
                      <Pressable
                        onPress={() => removePackaging(fp.packaging_id)}
                        style={s.removeBtn}
                      >
                        <Text style={s.removeBtnTxt}>✕</Text>
                      </Pressable>
                    </View>
                  );
                })}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                >
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {pkgList
                      .filter(
                        (p) =>
                          !form.packaging.find(
                            (fp) => fp.packaging_id === p.id,
                          ),
                      )
                      .map((p) => (
                        <Pressable
                          key={p.id}
                          style={[
                            s.addChip,
                            {
                              backgroundColor: "#fff3e0",
                              borderColor: "#fb8c00",
                            },
                          ]}
                          onPress={() => addPackaging(p.id)}
                        >
                          <Text style={[s.addChipTxt, { color: "#e65100" }]}>
                            + {p.nombre}
                          </Text>
                        </Pressable>
                      ))}
                  </View>
                </ScrollView>
              </View>

              {/* ── CONFIGURACIÓN ── */}
              <View style={s.seccion}>
                <Text style={s.secTitulo}>⚙️ Configuración</Text>
                <View style={s.inputRow}>
                  <Text style={s.inputLabel}>Mano de obra ($ por unidad)</Text>
                  <TextInput
                    style={s.inputNum}
                    value={form.mano_de_obra}
                    onChangeText={(v) =>
                      setForm((f) => ({ ...f, mano_de_obra: v }))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={s.inputRow}>
                  <Text style={s.inputLabel}>
                    Margen de ganancia (multiplicador)
                  </Text>
                  <TextInput
                    style={s.inputNum}
                    value={form.margen_ganancia}
                    onChangeText={(v) =>
                      setForm((f) => ({ ...f, margen_ganancia: v }))
                    }
                    keyboardType="numeric"
                    placeholder="2.5"
                  />
                </View>
                {costosFijos && (
                  <View style={s.infoBox}>
                    <Text style={s.infoTxt}>
                      💡 Costos fijos: ${fmt(costosFijos.total_mensual)} ÷{" "}
                      {costosFijos.unidades_mes} und = $
                      {fmt(costosFijos.costo_fijo_por_unidad)} / helado
                    </Text>
                  </View>
                )}
              </View>

              <Pressable
                style={[s.guardarBtn, guardando && { opacity: 0.6 }]}
                onPress={guardar}
                disabled={guardando}
              >
                <Text style={s.guardarBtnTxt}>
                  {guardando ? "Guardando…" : "💾 Guardar costeo"}
                </Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

function DesgloseRow({ label, valor }) {
  return (
    <View style={s.desgloseRow}>
      <Text style={s.desgloseLabel}>{label}</Text>
      <Text style={s.desgloseValor}>${fmt(valor)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { textAlign: "center", color: "#aaa", fontSize: 13, marginTop: 30 },

  heladoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  heladoIcono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fce4ec",
    justifyContent: "center",
    alignItems: "center",
  },
  heladoNombre: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  conReceta: { fontSize: 12, color: "#555", marginTop: 2 },
  sinReceta: { fontSize: 12, color: "#e91e63", marginTop: 2 },
  arrow: { fontSize: 24, color: "#ccc" },

  modal: { flex: 1, backgroundColor: "#f4f4f8" },
  modalHeader: {
    backgroundColor: "#e91e63",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: { paddingRight: 8 },
  backBtnText: { color: "#fff", fontSize: 16 },
  modalTitle: { color: "#fff", fontSize: 17, fontWeight: "800", flex: 1 },

  costoVivoBox: {
    backgroundColor: "#e91e63",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  costoVivoLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
  },
  costoVivoValor: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 4,
  },
  costoVivoMargen: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 6,
  },

  seccion: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  secTitulo: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  desgloseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  desgloseLabel: { fontSize: 13, color: "#555" },
  desgloseValor: { fontSize: 13, fontWeight: "600", color: "#333" },
  desgloseTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 8,
    marginTop: 6,
  },
  desgloseTotalLabel: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  desgloseTotalValor: { fontSize: 15, fontWeight: "800", color: "#e91e63" },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActivo: { backgroundColor: "#fce4ec", borderColor: "#e91e63" },
  chipTxt: { fontSize: 13, color: "#666" },
  chipTxtActivo: { color: "#e91e63", fontWeight: "700" },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  itemNombre: { flex: 1, fontSize: 13, color: "#333", fontWeight: "500" },
  inputNum: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    width: 72,
    textAlign: "right",
    backgroundColor: "#fafafa",
  },
  inputSufijo: { fontSize: 11, color: "#999", width: 26 },
  removeBtn: { padding: 4 },
  removeBtnTxt: { color: "#d32f2f", fontSize: 18, fontWeight: "700" },

  addChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#66bb6a",
  },
  addChipTxt: { fontSize: 12, color: "#2e7d32", fontWeight: "600" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  inputLabel: { flex: 1, fontSize: 13, color: "#444" },

  infoBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#1e88e5",
  },
  infoTxt: { fontSize: 12, color: "#1a237e" },

  guardarBtn: {
    backgroundColor: "#e91e63",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  guardarBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
