// components/FacturaDetailModal.js
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVentas } from "../context/VentasContext";

const MOTIVOS = ["venta", "obsequio", "muestra", "derretido"];

const SEDES = [
  { id: 1, nombre: "Local" },
  { id: 2, nombre: "Rappi" },
  { id: 3, nombre: "Evento" },
];

export default function FacturaDetailModal({
  visible,
  factura,
  onClose,
  onRefresh,
}) {
  const { editarFactura, cancelarFactura, editarItem, cancelarItem } =
    useVentas();

  const [loading, setLoading] = useState(false);

  // ── Estado edición de factura ──
  const [editandoFactura, setEditandoFactura] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaSede, setNuevaSede] = useState(null);

  // ── Estado edición de ítem ──
  const [itemEditando, setItemEditando] = useState(null); // id del ítem en edición
  const [itemCantidad, setItemCantidad] = useState("");
  const [itemMotivo, setItemMotivo] = useState("");

  if (!factura) return null;

  const fechaActual = factura.items[0]?.fecha
    ? factura.items[0].fecha.split("T")[0]
    : "";

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const confirmar = (titulo, mensaje, onOk) => {
    if (typeof window !== "undefined") {
      // Web
      if (window.confirm(`${titulo}\n${mensaje}`)) onOk();
    } else {
      Alert.alert(titulo, mensaje, [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", style: "destructive", onPress: onOk },
      ]);
    }
  };

  const withLoading = async (fn) => {
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Acciones factura
  // ─────────────────────────────────────────────
  const handleGuardarFactura = () => {
    if (!nuevaFecha && !nuevaSede) return;
    confirmar(
      "Editar factura",
      `¿Confirmas los cambios en F_No. ${factura.id_factura}?`,
      async () => {
        await withLoading(async () => {
          const body = {};
          if (nuevaFecha) body.fecha = nuevaFecha;
          if (nuevaSede) body.id_sede = nuevaSede;
          await editarFactura(factura.id_factura, body);
          setEditandoFactura(false);
          setNuevaFecha("");
          setNuevaSede(null);
          onRefresh();
        });
      },
    );
  };

  const handleCancelarFactura = () => {
    confirmar(
      "Cancelar factura",
      `¿Cancelar toda la F_No. ${factura.id_factura}? Se devolverá el inventario de todos los ítems.`,
      async () => {
        await withLoading(async () => {
          await cancelarFactura(factura.id_factura);
          onClose();
          onRefresh();
        });
      },
    );
  };

  // ─────────────────────────────────────────────
  // Acciones ítem
  // ─────────────────────────────────────────────
  const abrirEdicionItem = (item) => {
    setItemEditando(item.id);
    setItemCantidad(String(item.cantidad));
    setItemMotivo(item.motivo || "venta");
  };

  const handleGuardarItem = (item) => {
    confirmar(
      "Editar ítem",
      `¿Confirmas los cambios en "${item.sabor}"?`,
      async () => {
        await withLoading(async () => {
          const body = {};
          const nuevaCant = parseInt(itemCantidad, 10);
          if (!isNaN(nuevaCant) && nuevaCant !== item.cantidad)
            body.cantidad = nuevaCant;
          if (itemMotivo !== item.motivo) body.motivo = itemMotivo;
          if (Object.keys(body).length === 0) {
            setItemEditando(null);
            return;
          }
          await editarItem(item.id, body);
          setItemEditando(null);
          onRefresh();
        });
      },
    );
  };

  const handleCancelarItem = (item) => {
    confirmar(
      "Cancelar ítem",
      `¿Cancelar "${item.sabor}" x${item.cantidad}? Se devolverá el stock.`,
      async () => {
        await withLoading(async () => {
          await cancelarItem(item.id);
          setItemEditando(null);
          onRefresh();
        });
      },
    );
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>F_No. {factura.id_factura}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* ── Info + edición de factura ── */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>
                  📅 {fechaActual} · 🏪 {factura.nombre_sede}
                </Text>
                <TouchableOpacity
                  onPress={() => setEditandoFactura(!editandoFactura)}
                >
                  <MaterialCommunityIcons
                    name={editandoFactura ? "pencil-off" : "pencil"}
                    size={18}
                    color="#e91e63"
                  />
                </TouchableOpacity>
              </View>

              {editandoFactura && (
                <View style={styles.editBox}>
                  <Text style={styles.editLabel}>Nueva fecha (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={fechaActual}
                    placeholderTextColor="#aaa"
                    value={nuevaFecha}
                    onChangeText={setNuevaFecha}
                    keyboardType="default"
                  />

                  <Text style={styles.editLabel}>Sede</Text>
                  <View style={styles.chipRow}>
                    {SEDES.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.chip,
                          nuevaSede === s.id && styles.chipActive,
                        ]}
                        onPress={() => setNuevaSede(s.id)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            nuevaSede === s.id && styles.chipTextActive,
                          ]}
                        >
                          {s.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.btnPrimary,
                      !nuevaFecha && !nuevaSede && styles.btnDisabled,
                    ]}
                    onPress={handleGuardarFactura}
                    disabled={!nuevaFecha && !nuevaSede}
                  >
                    <Text style={styles.btnPrimaryText}>Guardar cambios</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── Ítems ── */}
            <Text style={styles.itemsTitle}>
              Ítems ({factura.items.length})
            </Text>

            {factura.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemSabor}>{item.sabor}</Text>
                    <Text style={styles.itemMeta}>
                      x{item.cantidad} · ${item.precio_helado}c/u ·{" "}
                      {item.motivo}
                    </Text>
                    <Text style={styles.itemTotal}>
                      Total: ${item.venta_helado?.toLocaleString("es-CO")}
                    </Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        itemEditando === item.id
                          ? setItemEditando(null)
                          : abrirEdicionItem(item)
                      }
                    >
                      <MaterialCommunityIcons
                        name={
                          itemEditando === item.id
                            ? "pencil-off"
                            : "pencil-outline"
                        }
                        size={18}
                        color="#e91e63"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => handleCancelarItem(item)}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={18}
                        color="#f44336"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Edición inline del ítem */}
                {itemEditando === item.id && (
                  <View style={styles.editBox}>
                    <Text style={styles.editLabel}>Cantidad</Text>
                    <TextInput
                      style={styles.input}
                      value={itemCantidad}
                      onChangeText={setItemCantidad}
                      keyboardType="numeric"
                    />

                    <Text style={styles.editLabel}>Motivo</Text>
                    <View style={styles.chipRow}>
                      {MOTIVOS.map((m) => (
                        <TouchableOpacity
                          key={m}
                          style={[
                            styles.chip,
                            itemMotivo === m && styles.chipActive,
                          ]}
                          onPress={() => setItemMotivo(m)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              itemMotivo === m && styles.chipTextActive,
                            ]}
                          >
                            {m}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.btnPrimary}
                      onPress={() => handleGuardarItem(item)}
                    >
                      <Text style={styles.btnPrimaryText}>Guardar ítem</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {/* ── Cancelar factura completa ── */}
            <TouchableOpacity
              style={styles.btnDanger}
              onPress={handleCancelarFactura}
            >
              <MaterialCommunityIcons name="cancel" size={16} color="#fff" />
              <Text style={styles.btnDangerText}>
                Cancelar factura completa
              </Text>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#e91e63" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  closeBtn: { padding: 4 },

  body: { paddingHorizontal: 20, paddingTop: 12 },

  section: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: { fontSize: 14, color: "#444", fontWeight: "500" },

  editBox: {
    marginTop: 12,
    backgroundColor: "#fff0f5",
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  editLabel: { fontSize: 12, color: "#888", fontWeight: "600", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#e91e63",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    color: "#111",
    backgroundColor: "#fff",
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: "#e91e63", borderColor: "#e91e63" },
  chipText: { fontSize: 12, color: "#555" },
  chipTextActive: { color: "#fff", fontWeight: "700" },

  btnPrimary: {
    backgroundColor: "#e91e63",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { backgroundColor: "#ccc" },
  btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  itemsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  itemRow: { flexDirection: "row", justifyContent: "space-between" },
  itemInfo: { flex: 1 },
  itemSabor: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  itemMeta: { fontSize: 12, color: "#777" },
  itemTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e91e63",
    marginTop: 2,
  },
  itemActions: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  iconBtn: {
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },

  btnDanger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f44336",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
  },
  btnDangerText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
