// components/costeo/RecetasTab.js
// Pantalla más importante: lista helados y permite editar/ver su costeo
import {
  View, Text, FlatList, Pressable, StyleSheet,
  Modal, ScrollView, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { useState, useContext } from "react";
import { useCosteo } from "../../context/CosteoContext";
import { HeladosContext } from "../../context/HeladosContext";

const fmt = (n) => Math.round(Number(n ?? 0)).toLocaleString("es-CO");

export default function RecetasTab() {
  const { helados } = useContext(HeladosContext);
  const {
    recetas, ingredientes, packaging: pkgList, bases,
    costosFijos, fetchRecetaDetalle, guardarReceta,
  } = useCosteo();

  const [modalVisible, setModalVisible] = useState(false);
  const [heladoSel,    setHeladoSel]    = useState(null);
  const [detalle,      setDetalle]      = useState(null);
  const [loadingDet,   setLoadingDet]   = useState(false);

  // Form state
  const [form, setForm] = useState({
    base_id: null,
    volumen_base_ml: "",
    mano_de_obra: "",
    margen_ganancia: "2.5",
    notas: "",
    ingredientes: [],   // [{ ingrediente_id, cantidad, tipo }]
    packaging: [],      // [{ packaging_id, cantidad }]
  });

  const abrirReceta = async (helado) => {
    setHeladoSel(helado);
    setLoadingDet(true);
    setModalVisible(true);
    const det = await fetchRecetaDetalle(helado.id);
    if (det) {
      setDetalle(det);
      setForm({
        base_id:         det.base_id ?? null,
        volumen_base_ml: String(det.volumen_base_ml ?? ""),
        mano_de_obra:    String(det.mano_de_obra ?? ""),
        margen_ganancia: String(det.margen_ganancia ?? "2.5"),
        notas:           det.notas ?? "",
        ingredientes:    det.ingredientes?.map(i => ({
          ingrediente_id: i.ingrediente_id,
          cantidad: String(i.cantidad),
          tipo: i.tipo,
        })) ?? [],
        packaging: det.packaging?.map(p => ({
          packaging_id: p.packaging_id,
          cantidad: String(p.cantidad),
        })) ?? [],
      });
    } else {
      setDetalle(null);
      setForm({
        base_id: null, volumen_base_ml: "", mano_de_obra: "",
        margen_ganancia: "2.5", notas: "", ingredientes: [], packaging: [],
      });
    }
    setLoadingDet(false);
  };

  const guardar = async () => {
    if (!heladoSel) return;
    try {
      await guardarReceta(heladoSel.id, {
        base_id:         form.base_id,
        volumen_base_ml: Number(form.volumen_base_ml) || 0,
        mano_de_obra:    Number(form.mano_de_obra) || 0,
        margen_ganancia: Number(form.margen_ganancia) || 2.5,
        notas:           form.notas,
        ingredientes:    form.ingredientes.map(i => ({
          ...i, cantidad: Number(i.cantidad),
        })),
        packaging:       form.packaging.map(p => ({
          ...p, cantidad: Number(p.cantidad),
        })),
      });
      // Recargar detalle
      const det = await fetchRecetaDetalle(heladoSel.id);
      setDetalle(det);
      Alert.alert("✅ Guardado", "Receta actualizada correctamente");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  // ── helpers para agregar/quitar ítems del form ──
  const addIngrediente = (ingr_id) => {
    if (form.ingredientes.find(i => i.ingrediente_id === ingr_id)) return;
    setForm(f => ({
      ...f,
      ingredientes: [...f.ingredientes, { ingrediente_id: ingr_id, cantidad: "0", tipo: "principal" }],
    }));
  };

  const removeIngrediente = (ingr_id) => {
    setForm(f => ({ ...f, ingredientes: f.ingredientes.filter(i => i.ingrediente_id !== ingr_id) }));
  };

  const updateIngredienteCant = (ingr_id, cant) => {
    setForm(f => ({
      ...f,
      ingredientes: f.ingredientes.map(i =>
        i.ingrediente_id === ingr_id ? { ...i, cantidad: cant } : i
      ),
    }));
  };

  const addPackaging = (pkg_id) => {
    if (form.packaging.find(p => p.packaging_id === pkg_id)) return;
    setForm(f => ({
      ...f,
      packaging: [...f.packaging, { packaging_id: pkg_id, cantidad: "1" }],
    }));
  };

  const removePackaging = (pkg_id) => {
    setForm(f => ({ ...f, packaging: f.packaging.filter(p => p.packaging_id !== pkg_id) }));
  };

  // ── receta ya existente para un helado ──
  const getReceta = (helado_id) => recetas.find(r => r.helado_id === helado_id);

  return (
    <View style={styles.container}>
      <FlatList
        data={helados}
        keyExtractor={(h) => String(h.id)}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        renderItem={({ item: helado }) => {
          const rec = getReceta(helado.id);
          return (
            <Pressable style={styles.heladoCard} onPress={() => abrirReceta(helado)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heladoNombre}>{helado.nombre}</Text>
                {rec ? (
                  <Text style={styles.heladoCosto}>
                    Precio venta: ${fmt(helado.precio)}
                  </Text>
                ) : (
                  <Text style={styles.sinReceta}>Sin receta — toca para crear</Text>
                )}
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          );
        }}
      />

      {/* ── MODAL RECETA ── */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          {/* Header modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {heladoSel?.nombre}
            </Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>

          {loadingDet ? (
            <View style={styles.center}>
              <ActivityIndicator color="#e91e63" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>

              {/* ── DESGLOSE DE COSTOS (si ya hay receta) ── */}
              {detalle?.desglose && (
                <View style={styles.desglose}>
                  <Text style={styles.secTitulo}>📊 Resumen de costos</Text>
                  <DesgloseRow label="Base"           valor={detalle.desglose.costo_base} />
                  <DesgloseRow label="Ingredientes"   valor={detalle.desglose.costo_ingredientes} />
                  <DesgloseRow label="Packaging"      valor={detalle.desglose.costo_packaging} />
                  <DesgloseRow label="Costos fijos"   valor={detalle.desglose.costo_fijo_unit} />
                  <DesgloseRow label="Mano de obra"   valor={detalle.desglose.costo_mdo} />
                  <View style={styles.desgloseTotal}>
                    <Text style={styles.desgloseTotalLabel}>Costo total</Text>
                    <Text style={styles.desgloseTotalValor}>${fmt(detalle.desglose.costo_total)}</Text>
                  </View>
                  <View style={[styles.desgloseTotal, { marginTop: 4 }]}>
                    <Text style={[styles.desgloseTotalLabel, { color: "#1b5e20" }]}>Precio sugerido</Text>
                    <Text style={[styles.desgloseTotalValor, { color: "#1b5e20" }]}>
                      ${fmt(detalle.desglose.precio_sugerido)}
                    </Text>
                  </View>
                  {detalle.desglose.margen_real_pct != null && (
                    <Text style={styles.margenText}>
                      Margen real: {detalle.desglose.margen_real_pct}%
                      (precio actual: ${fmt(detalle.desglose.precio_venta_actual)})
                    </Text>
                  )}
                </View>
              )}

              {/* ── BASE ── */}
              <View style={styles.seccion}>
                <Text style={styles.secTitulo}>Base de la mezcla</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable
                      style={[styles.baseChip, !form.base_id && styles.baseChipActivo]}
                      onPress={() => setForm(f => ({ ...f, base_id: null, volumen_base_ml: "" }))}
                    >
                      <Text style={[styles.baseChipText, !form.base_id && styles.baseChipTextActivo]}>
                        Sin base
                      </Text>
                    </Pressable>
                    {bases.map(b => (
                      <Pressable
                        key={b.id}
                        style={[styles.baseChip, form.base_id === b.id && styles.baseChipActivo]}
                        onPress={() => setForm(f => ({ ...f, base_id: b.id }))}
                      >
                        <Text style={[styles.baseChipText, form.base_id === b.id && styles.baseChipTextActivo]}>
                          {b.nombre} ({b.tipo})
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
                {form.base_id && (
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>ml de base por unidad</Text>
                    <TextInput
                      style={styles.inputSmall}
                      value={form.volumen_base_ml}
                      onChangeText={v => setForm(f => ({ ...f, volumen_base_ml: v }))}
                      keyboardType="numeric"
                      placeholder="ej: 80"
                    />
                  </View>
                )}
              </View>

              {/* ── INGREDIENTES ── */}
              <View style={styles.seccion}>
                <Text style={styles.secTitulo}>Ingredientes</Text>
                {form.ingredientes.map((fi) => {
                  const ingr = ingredientes.find(i => i.id === fi.ingrediente_id);
                  return (
                    <View key={fi.ingrediente_id} style={styles.itemRow}>
                      <Text style={styles.itemNombre}>{ingr?.nombre}</Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={fi.cantidad}
                        onChangeText={v => updateIngredienteCant(fi.ingrediente_id, v)}
                        keyboardType="numeric"
                        placeholder={ingr?.unidad}
                      />
                      <Text style={styles.itemUnidad}>{ingr?.unidad}</Text>
                      <Pressable onPress={() => removeIngrediente(fi.ingrediente_id)}>
                        <Text style={styles.removeBtn}>✕</Text>
                      </Pressable>
                    </View>
                  );
                })}
                {/* Agregar ingrediente */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
                    {ingredientes
                      .filter(i => !form.ingredientes.find(fi => fi.ingrediente_id === i.id))
                      .map(i => (
                        <Pressable key={i.id} style={styles.addChip} onPress={() => addIngrediente(i.id)}>
                          <Text style={styles.addChipText}>+ {i.nombre}</Text>
                        </Pressable>
                      ))}
                  </View>
                </ScrollView>
              </View>

              {/* ── PACKAGING ── */}
              <View style={styles.seccion}>
                <Text style={styles.secTitulo}>Packaging</Text>
                {form.packaging.map((fp) => {
                  const pkg = pkgList.find(p => p.id === fp.packaging_id);
                  return (
                    <View key={fp.packaging_id} style={styles.itemRow}>
                      <Text style={styles.itemNombre}>{pkg?.nombre}</Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={fp.cantidad}
                        onChangeText={v =>
                          setForm(f => ({
                            ...f,
                            packaging: f.packaging.map(p =>
                              p.packaging_id === fp.packaging_id ? { ...p, cantidad: v } : p
                            ),
                          }))
                        }
                        keyboardType="numeric"
                        placeholder="cant"
                      />
                      <Pressable onPress={() => removePackaging(fp.packaging_id)}>
                        <Text style={styles.removeBtn}>✕</Text>
                      </Pressable>
                    </View>
                  );
                })}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
                    {pkgList
                      .filter(p => !form.packaging.find(fp => fp.packaging_id === p.id))
                      .map(p => (
                        <Pressable key={p.id} style={styles.addChip} onPress={() => addPackaging(p.id)}>
                          <Text style={styles.addChipText}>+ {p.nombre}</Text>
                        </Pressable>
                      ))}
                  </View>
                </ScrollView>
              </View>

              {/* ── CONFIGURACIÓN ── */}
              <View style={styles.seccion}>
                <Text style={styles.secTitulo}>Configuración</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Mano de obra ($ por unidad)</Text>
                  <TextInput
                    style={styles.inputSmall}
                    value={form.mano_de_obra}
                    onChangeText={v => setForm(f => ({ ...f, mano_de_obra: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Margen (multiplicador precio)</Text>
                  <TextInput
                    style={styles.inputSmall}
                    value={form.margen_ganancia}
                    onChangeText={v => setForm(f => ({ ...f, margen_ganancia: v }))}
                    keyboardType="numeric"
                    placeholder="2.5"
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Notas</Text>
                  <TextInput
                    style={[styles.inputSmall, { flex: 1 }]}
                    value={form.notas}
                    onChangeText={v => setForm(f => ({ ...f, notas: v }))}
                    placeholder="Opcional"
                  />
                </View>
              </View>

              {/* ── Costos fijos info ── */}
              {costosFijos && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    💡 Costos fijos mensuales: ${fmt(costosFijos.total_mensual)} ÷{" "}
                    {costosFijos.unidades_mes} unidades = ${fmt(costosFijos.costo_fijo_por_unidad)} / helado
                  </Text>
                </View>
              )}

              <Pressable style={styles.guardarBtn} onPress={guardar}>
                <Text style={styles.guardarBtnText}>💾 Guardar receta</Text>
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
    <View style={styles.desgloseRow}>
      <Text style={styles.desgloseLabel}>{label}</Text>
      <Text style={styles.desgloseValor}>${fmt(valor)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  heladoCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  heladoNombre: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  heladoCosto:  { fontSize: 12, color: "#555", marginTop: 2 },
  sinReceta:    { fontSize: 12, color: "#e91e63", marginTop: 2 },
  arrow:        { fontSize: 24, color: "#ccc" },

  // Modal
  modal: { flex: 1, backgroundColor: "#f8f9fa" },
  modalHeader: {
    backgroundColor: "#e91e63", flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  modalTitle: { color: "#fff", fontSize: 17, fontWeight: "800", flex: 1 },
  closeBtn:   { color: "#fff", fontSize: 22, paddingLeft: 12 },

  // Desglose
  desglose: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  desgloseRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  desgloseLabel: { fontSize: 13, color: "#555" },
  desgloseValor: { fontSize: 13, fontWeight: "600", color: "#333" },
  desgloseTotal: {
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 1, borderColor: "#eee", paddingTop: 8, marginTop: 4,
  },
  desgloseTotalLabel: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  desgloseTotalValor: { fontSize: 15, fontWeight: "800", color: "#e91e63" },
  margenText: { fontSize: 11, color: "#777", marginTop: 8, textAlign: "center" },

  // Secciones
  seccion: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  secTitulo: { fontSize: 13, fontWeight: "700", color: "#555", marginBottom: 10, textTransform: "uppercase" },

  // Chips base
  baseChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: "#f0f0f0", borderWidth: 1.5, borderColor: "transparent",
  },
  baseChipActivo: { backgroundColor: "#fce4ec", borderColor: "#e91e63" },
  baseChipText:   { fontSize: 13, color: "#666" },
  baseChipTextActivo: { color: "#e91e63", fontWeight: "700" },

  // Items
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  itemNombre: { flex: 1, fontSize: 13, color: "#333" },
  itemUnidad: { fontSize: 11, color: "#999", width: 28 },
  removeBtn:  { color: "#d32f2f", fontSize: 18, fontWeight: "700", paddingHorizontal: 4 },
  addChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: "#e8f5e9", borderWidth: 1, borderColor: "#66bb6a",
  },
  addChipText: { fontSize: 12, color: "#2e7d32", fontWeight: "600" },

  // Inputs
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  inputLabel: { flex: 1, fontSize: 13, color: "#444" },
  inputSmall: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 14, width: 80, textAlign: "right", backgroundColor: "#fafafa",
  },

  // Info box
  infoBox: {
    backgroundColor: "#e3f2fd", borderRadius: 10, padding: 12,
    borderLeftWidth: 4, borderLeftColor: "#1e88e5",
  },
  infoText: { fontSize: 12, color: "#1a237e", lineHeight: 18 },

  // Guardar
  guardarBtn: {
    backgroundColor: "#e91e63", borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
  },
  guardarBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
