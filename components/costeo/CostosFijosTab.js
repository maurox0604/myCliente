// components/costeo/CostosFijosTab.js
// Gastos mensuales (arriendo, servicios…) repartidos entre las unidades que
// produces al mes → costo fijo que carga cada helado.
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useCosteo } from "../../context/CosteoContext";
import {
  C,
  PAGE,
  PageHeader,
  Btn,
  IconBtn,
  Field,
  Input,
  Block,
  EmptyState,
  DuplicateWarning,
  ModalShell,
  FooterBtns,
  DialogLayer,
  avisar,
  confirmar,
  toast,
  fmtPeso,
  fmtUnit,
  toNum,
  aTexto,
  buscarSimilares,
} from "./ui";

const EMPTY = { nombre: "", valor_mensual: "" };

export default function CostosFijosTab() {
  const {
    costosFijos,
    guardarCostoFijo,
    borrarCostoFijo,
    actualizarUnidadesMes,
  } = useCosteo();

  const items = costosFijos?.items ?? [];
  const total = Number(costosFijos?.total_mensual ?? 0);
  const unidadesGuardadas = Number(costosFijos?.unidades_mes ?? 1000);

  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [unidades, setUnidades] = useState(String(unidadesGuardadas));
  const [guardandoUnd, setGuardandoUnd] = useState(false);

  // costosFijos llega del servidor después de montar la pantalla
  useEffect(() => {
    setUnidades(String(unidadesGuardadas));
  }, [unidadesGuardadas]);

  const und = toNum(unidades);
  const cambioUnd = und !== unidadesGuardadas;
  const porHelado = und > 0 ? total / und : 0;

  const abrir = (item = null) => {
    setEditId(item?.id ?? null);
    setForm(
      item
        ? { nombre: item.nombre, valor_mensual: aTexto(item.valor_mensual) }
        : EMPTY,
    );
    setModal(true);
  };
  const cerrar = () => setModal(false);

  const guardar = async () => {
    const nombre = form.nombre.trim();
    if (!nombre)
      return avisar("Falta el nombre", "Escribe qué gasto es (ej: Arriendo).");
    if (form.valor_mensual.trim() === "" || toNum(form.valor_mensual) < 0)
      return avisar(
        "Falta el valor",
        "Escribe cuánto pagas al mes por este gasto.",
      );

    const igual = buscarSimilares(nombre, items, (x) => x.nombre, editId).find(
      (r) => r.nivel === "igual",
    );
    if (igual)
      return avisar(
        "Ya existe",
        `Ya tienes "${igual.item.nombre}". Edítalo en vez de crear otro igual.`,
      );

    setSaving(true);
    try {
      await guardarCostoFijo(
        { nombre, valor_mensual: toNum(form.valor_mensual) },
        editId,
      );
      cerrar();
      toast(editId ? "Costo fijo actualizado" : "Costo fijo creado");
    } catch (e) {
      avisar("No se pudo guardar", e.message || "Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const borrar = async (item) => {
    const si = await confirmar(
      "Eliminar costo fijo",
      `¿Eliminar "${item.nombre}"?`,
      {
        confirmText: "Eliminar",
        destructive: true,
      },
    );
    if (!si) return;
    try {
      await borrarCostoFijo(item.id);
      toast("Costo fijo eliminado");
    } catch (e) {
      avisar("No se pudo eliminar", e.message || "Inténtalo de nuevo.");
    }
  };

  const guardarUnidades = async () => {
    if (!(und > 0) || !Number.isInteger(und))
      return avisar(
        "Número no válido",
        "Escribe un número entero mayor que 0 (ej: 1000).",
      );
    setGuardandoUnd(true);
    try {
      await actualizarUnidadesMes(und);
      toast("Producción mensual actualizada");
    } catch (e) {
      avisar("No se pudo guardar", e.message || "Inténtalo de nuevo.");
    } finally {
      setGuardandoUnd(false);
    }
  };

  return (
    <View style={s.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={[PAGE, { paddingBottom: 40 }]}
        ListHeaderComponent={
          <View>
            <PageHeader
              icon="🏠"
              tone="amber"
              title="Costos fijos"
              subtitle="Gastos del mes repartidos entre los helados que produces"
              right={
                <Btn
                  label="Nuevo"
                  icon="＋"
                  tone="pink"
                  onPress={() => abrir()}
                />
              }
            />

            <View style={s.pad}>
              {/* resumen */}
              <View style={s.resumen}>
                <Text style={s.resumenLabel}>Total mensual</Text>
                <Text style={s.resumenValor}>${fmtPeso(total)}</Text>
                <Text style={s.resumenSub}>
                  ${fmtUnit(costosFijos?.costo_fijo_por_unidad ?? 0)} por helado
                  · ÷ {fmtPeso(unidadesGuardadas)} unidades al mes
                </Text>
              </View>

              {/* producción */}
              <Block
                tone="amber"
                icon="🏭"
                title="Producción estimada al mes"
                hint="Cuántos helados haces en un mes: cuantos más, menos costo fijo carga cada uno"
                style={{ marginTop: 12 }}
              >
                <View style={s.undRow}>
                  <View style={{ flex: 1, maxWidth: 180 }}>
                    <Input
                      value={unidades}
                      onChangeText={setUnidades}
                      keyboardType="numeric"
                      placeholder="1000"
                      invalid={unidades !== "" && !(und > 0)}
                    />
                  </View>
                  <Text style={s.undTxt}>unidades</Text>
                  <View style={{ marginLeft: "auto" }}>
                    <Btn
                      label="Guardar"
                      small
                      tone="pink"
                      onPress={guardarUnidades}
                      loading={guardandoUnd}
                      disabled={!cambioUnd}
                    />
                  </View>
                </View>
                {cambioUnd && und > 0 ? (
                  <Text style={s.preview}>
                    Con {fmtPeso(und)} unidades cada helado cargaría $
                    {fmtUnit(porHelado)}. Falta guardar.
                  </Text>
                ) : null}
              </Block>

              {items.length > 0 ? (
                <Text style={s.listaTit}>Gastos del mes</Text>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="🏠"
            tone="amber"
            titulo="Aún no hay costos fijos"
            texto="Agrega arriendo, servicios, sueldos o lo que pagues cada mes aunque no vendas."
            accion="Agregar el primero"
            onAccion={() => abrir()}
          />
        }
        renderItem={({ item }) => (
          <View style={s.pad}>
            <View style={s.card}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.nombre}>{item.nombre}</Text>
                <Text style={s.valor}>
                  ${fmtPeso(item.valor_mensual)}
                  <Text style={s.valorSub}> / mes</Text>
                </Text>
                {total > 0 ? (
                  <Text style={s.pct}>
                    {Math.round((Number(item.valor_mensual) / total) * 100)}%
                    del total
                  </Text>
                ) : null}
              </View>
              <IconBtn
                icon="✏️"
                label={`Editar ${item.nombre}`}
                onPress={() => abrir(item)}
              />
              <IconBtn
                icon="🗑️"
                label={`Eliminar ${item.nombre}`}
                onPress={() => borrar(item)}
              />
            </View>
          </View>
        )}
      />

      <ModalShell
        visible={modal}
        onClose={cerrar}
        tone="amber"
        icon="🏠"
        title={editId ? "Editar costo fijo" : "Nuevo costo fijo"}
        subtitle={editId ? form.nombre : "Un gasto que pagas cada mes"}
        footer={
          <FooterBtns onCancel={cerrar} onSave={guardar} saving={saving} />
        }
      >
        <Field label="Nombre">
          <Input
            value={form.nombre}
            onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))}
            placeholder="ej: Arriendo"
          />
        </Field>
        <DuplicateWarning
          texto={form.nombre}
          lista={items}
          excluirId={editId}
          etiqueta="costo fijo"
          getSub={(i) => `$${fmtPeso(i.valor_mensual)} / mes`}
          onEditar={abrir}
        />
        <Field label="Valor mensual ($)">
          <Input
            value={form.valor_mensual}
            onChangeText={(v) => setForm((f) => ({ ...f, valor_mensual: v }))}
            keyboardType="numeric"
            placeholder="ej: 800000"
          />
        </Field>
      </ModalShell>

      <DialogLayer />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pad: { paddingHorizontal: 16 },
  resumen: {
    backgroundColor: C.accent,
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
  },
  resumenLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "700",
  },
  resumenValor: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 2,
  },
  resumenSub: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 4 },
  undRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  undTxt: { fontSize: 13, color: C.fg2 },
  preview: { fontSize: 12, color: "#e65100", marginTop: 10, lineHeight: 17 },
  listaTit: {
    fontSize: 13,
    fontWeight: "800",
    color: C.fg2,
    marginTop: 18,
    marginBottom: -2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
    borderLeftColor: "#f57c00",
    padding: 14,
    marginTop: 10,
  },
  nombre: { fontSize: 15, fontWeight: "800", color: C.fg },
  valor: { fontSize: 17, fontWeight: "800", color: C.accentDark, marginTop: 4 },
  valorSub: { fontSize: 12, fontWeight: "600", color: C.fg3 },
  pct: { fontSize: 12, color: C.fg3, marginTop: 2 },
});
