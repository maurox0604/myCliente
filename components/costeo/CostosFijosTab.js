// components/costeo/CostosFijosTab.js
import {
  View, Text, FlatList, Pressable, StyleSheet,
  TextInput, Alert, Modal, ScrollView,
} from "react-native";
import { useState } from "react";
import { useCosteo } from "../../context/CosteoContext";

const fmt = (n) => Math.round(Number(n ?? 0)).toLocaleString("es-CO");
const EMPTY = { nombre: "", valor_mensual: "" };

export default function CostosFijosTab() {
  const { costosFijos, guardarCostoFijo, borrarCostoFijo, actualizarUnidadesMes } = useCosteo();
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [unidades,  setUnidades]  = useState(String(costosFijos?.unidades_mes ?? 1000));

  const abrir = (item = null) => {
    setEditId(item?.id ?? null);
    setForm(item
      ? { nombre: item.nombre, valor_mensual: String(item.valor_mensual) }
      : EMPTY
    );
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return Alert.alert("Nombre requerido");
    await guardarCostoFijo({ nombre: form.nombre, valor_mensual: Number(form.valor_mensual) || 0 }, editId);
    setModal(false);
  };

  const borrar = (item) =>
    Alert.alert("Eliminar", `¿Eliminar "${item.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => borrarCostoFijo(item.id) },
    ]);

  const guardarUnidades = async () => {
    const n = parseInt(unidades);
    if (isNaN(n) || n <= 0) return Alert.alert("Ingresa un número válido");
    await actualizarUnidadesMes(n);
    Alert.alert("✅ Actualizado");
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 12, gap: 12 }}>

      {/* RESUMEN */}
      {costosFijos && (
        <View style={s.resumen}>
          <Text style={s.resumenTitulo}>Resumen mensual</Text>
          <Text style={s.resumenValor}>Total: ${fmt(costosFijos.total_mensual)}</Text>
          <Text style={s.resumenSub}>
            ${fmt(costosFijos.costo_fijo_por_unidad)} por helado
            (÷ {costosFijos.unidades_mes} unidades)
          </Text>
        </View>
      )}

      {/* PRODUCCIÓN MENSUAL */}
      <View style={s.card}>
        <Text style={s.cardTitulo}>📦 Producción estimada / mes</Text>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={unidades}
            onChangeText={setUnidades}
            keyboardType="numeric"
            placeholder="1000"
          />
          <Text style={s.unidadText}>unidades</Text>
          <Pressable style={s.saveSmall} onPress={guardarUnidades}>
            <Text style={s.saveSmallText}>Guardar</Text>
          </Pressable>
        </View>
      </View>

      {/* LISTA */}
      <Pressable style={s.addBtn} onPress={() => abrir()}>
        <Text style={s.addBtnText}>+ Nuevo costo fijo</Text>
      </Pressable>

      {costosFijos?.items?.map((item) => (
        <View key={item.id} style={s.itemCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.itemNombre}>{item.nombre}</Text>
            <Text style={s.itemValor}>${fmt(item.valor_mensual)} / mes</Text>
          </View>
          <Pressable onPress={() => abrir(item)} style={s.btn}>
            <Text>✏️</Text>
          </Pressable>
          <Pressable onPress={() => borrar(item)} style={s.btn}>
            <Text>🗑️</Text>
          </Pressable>
        </View>
      ))}

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>{editId ? "Editar" : "Nuevo"} costo fijo</Text>

            <Text style={s.label}>Nombre</Text>
            <TextInput style={s.inputFull} value={form.nombre}
              onChangeText={v => setForm(f => ({ ...f, nombre: v }))}
              placeholder="ej: Arriendo" />

            <Text style={s.label}>Valor mensual ($)</Text>
            <TextInput style={s.inputFull} value={form.valor_mensual}
              onChangeText={v => setForm(f => ({ ...f, valor_mensual: v }))}
              keyboardType="numeric" placeholder="800000" />

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
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  resumen: {
    backgroundColor: "#e91e63", borderRadius: 14, padding: 16,
  },
  resumenTitulo: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  resumenValor:  { color: "#fff", fontSize: 22, fontWeight: "900", marginTop: 2 },
  resumenSub:    { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },

  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardTitulo: { fontSize: 13, fontWeight: "700", color: "#555", marginBottom: 10 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 10, fontSize: 15, width: 100, textAlign: "center", backgroundColor: "#fafafa",
  },
  unidadText: { fontSize: 13, color: "#666" },
  saveSmall: { marginLeft: "auto", backgroundColor: "#e91e63", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  saveSmallText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  addBtn: {
    backgroundColor: "#e91e63", borderRadius: 10,
    paddingVertical: 12, alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  itemCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  itemNombre: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  itemValor:  { fontSize: 12, color: "#777", marginTop: 2 },
  btn: { padding: 6 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalBox: { backgroundColor: "#fff", borderRadius: 20, padding: 20, gap: 6 },
  modalTitle: { fontSize: 17, fontWeight: "800", marginBottom: 8 },
  label: { fontSize: 12, color: "#666", fontWeight: "600", marginTop: 8 },
  inputFull: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    padding: 10, fontSize: 14, backgroundColor: "#fafafa",
  },
  modalBtns: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#f5f5f5", alignItems: "center" },
  cancelBtnText: { color: "#666", fontWeight: "600" },
  saveBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#e91e63", alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
