// components/costeo/PackagingTab.js
// Vasos, conos, tapas, cucharas… con su costo por unidad (precio ÷ cantidad).
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useCosteo } from "../../context/CosteoContext";
import {
  C,
  PAGE,
  PageHeader,
  Btn,
  IconBtn,
  Tag,
  Field,
  Input,
  SearchBox,
  Block,
  EmptyState,
  ChipPicker,
  DuplicateWarning,
  ModalShell,
  FooterBtns,
  DialogLayer,
  avisar,
  confirmar,
  toast,
  fmtPeso,
  fmtCant,
  fmtUnit,
  toNum,
  aTexto,
  coincide,
  buscarSimilares,
} from "./ui";

// Mismos valores que acepta la base de datos (columna packaging.tipo)
const TIPOS = [
  { key: "vaso", icon: "🥤", label: "Vaso" },
  { key: "cono", icon: "🍦", label: "Cono" },
  { key: "tapa", icon: "⭕", label: "Tapa" },
  { key: "cuchara", icon: "🥄", label: "Cuchara" },
  { key: "palito", icon: "🪵", label: "Palito" },
  { key: "servilleta", icon: "🧻", label: "Servilleta" },
  { key: "bolsa", icon: "🛍️", label: "Bolsa" },
  { key: "bolsa_papel", icon: "📄", label: "Bolsa de papel" },
  { key: "bolsa_plastico", icon: "🧴", label: "Bolsa plástica" },
  { key: "sticker", icon: "🏷️", label: "Sticker" },
  { key: "otro", icon: "📦", label: "Otro" },
];
const tipoInfo = (k) =>
  TIPOS.find((t) => t.key === k) ?? TIPOS[TIPOS.length - 1];
const EMPTY = {
  nombre: "",
  tipo: "vaso",
  precio_compra: "",
  cantidad_compra: "",
};

export default function PackagingTab() {
  const { packaging, guardarPackaging, borrarPackaging } = useCosteo();

  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const lista = packaging ?? [];
  const set = (campo) => (v) => setForm((f) => ({ ...f, [campo]: v }));

  const precio = toNum(form.precio_compra);
  const cantidad = toNum(form.cantidad_compra);
  const precioUnd = precio > 0 && cantidad > 0 ? precio / cantidad : null;

  const abrir = (item = null) => {
    setEditId(item?.id ?? null);
    setForm(
      item
        ? {
            nombre: item.nombre,
            tipo: item.tipo ?? "otro",
            precio_compra: aTexto(item.precio_compra),
            cantidad_compra: aTexto(item.cantidad_compra),
          }
        : EMPTY,
    );
    setModal(true);
  };
  const cerrar = () => setModal(false);

  const guardar = async () => {
    const nombre = form.nombre.trim();
    if (!nombre)
      return avisar(
        "Falta el nombre",
        "Escribe cómo se llama el packaging (ej: Vaso 8oz).",
      );
    if (!(precio > 0))
      return avisar(
        "Falta el precio",
        "Escribe cuánto pagaste en total por la compra.",
      );
    if (!(cantidad > 0))
      return avisar(
        "Falta la cantidad",
        "Escribe cuántas unidades compraste con ese precio.",
      );

    const igual = buscarSimilares(nombre, lista, (x) => x.nombre, editId).find(
      (r) => r.nivel === "igual",
    );
    if (igual)
      return avisar(
        "Ya existe",
        `Ya tienes "${igual.item.nombre}". Edítalo en vez de crear otro igual.`,
      );

    setSaving(true);
    try {
      await guardarPackaging(
        {
          nombre,
          tipo: form.tipo,
          precio_compra: precio,
          cantidad_compra: cantidad,
        },
        editId,
      );
      cerrar();
      toast(editId ? "Packaging actualizado" : "Packaging creado");
    } catch (e) {
      avisar("No se pudo guardar", e.message || "Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const borrar = async (item) => {
    const si = await confirmar(
      "Eliminar packaging",
      `¿Eliminar "${item.nombre}"?`,
      {
        confirmText: "Eliminar",
        destructive: true,
      },
    );
    if (!si) return;
    try {
      await borrarPackaging(item.id);
      toast("Packaging eliminado");
    } catch (e) {
      // ej.: "No se puede eliminar: lo usan los helados Fresa, Vainilla"
      avisar("No se puede eliminar", e.message || "Inténtalo de nuevo.");
    }
  };

  const visibles = lista.filter((p) => coincide(busqueda, p.nombre));
  const t = tipoInfo(form.tipo);

  return (
    <View style={s.container}>
      <FlatList
        data={visibles}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={[PAGE, { paddingBottom: 40 }]}
        ListHeaderComponent={
          <View>
            <PageHeader
              icon="📦"
              tone="teal"
              title="Packaging"
              subtitle="Vasos, conos, tapas y demás empaques con su costo por unidad"
              right={
                <Btn
                  label="Nuevo"
                  icon="＋"
                  tone="pink"
                  onPress={() => abrir()}
                />
              }
            />
            {lista.length > 5 ? (
              <View style={s.pad}>
                <SearchBox
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder="Buscar packaging…"
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          lista.length === 0 ? (
            <EmptyState
              icon="📦"
              tone="teal"
              titulo="Aún no hay packaging"
              texto="Agrega los vasos, conos, tapas y cucharas que usas para entregar cada helado."
              accion="Agregar el primero"
              onAccion={() => abrir()}
            />
          ) : (
            <EmptyState
              icon="🔍"
              titulo="Nada coincide"
              texto="Prueba con otra palabra."
            />
          )
        }
        renderItem={({ item }) => {
          const ti = tipoInfo(item.tipo);
          const pu =
            item.precio_compra && item.cantidad_compra
              ? Number(item.precio_compra) / Number(item.cantidad_compra)
              : Number(item.precio_unidad ?? 0);
          return (
            <View style={s.pad}>
              <View style={s.card}>
                <View style={s.iconBox}>
                  <Text style={{ fontSize: 22 }}>{ti.icon}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={s.nombreRow}>
                    <Text style={s.nombre} numberOfLines={2}>
                      {item.nombre}
                    </Text>
                    <Tag tone="teal" label={ti.label} />
                  </View>
                  <Text style={s.precio}>
                    ${fmtUnit(pu)}
                    <Text style={s.precioUnidad}> / unidad</Text>
                  </Text>
                  {item.precio_compra ? (
                    <Text style={s.detalle}>
                      Compra: ${fmtPeso(item.precio_compra)} por{" "}
                      {fmtCant(item.cantidad_compra)} unidades
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
          );
        }}
      />

      <ModalShell
        visible={modal}
        onClose={cerrar}
        tone="teal"
        icon={t.icon}
        title={editId ? "Editar packaging" : "Nuevo packaging"}
        subtitle={
          editId ? form.nombre : "Lo que compras y cuánto te cuesta cada unidad"
        }
        footer={
          <FooterBtns onCancel={cerrar} onSave={guardar} saving={saving} />
        }
      >
        <Field label="Nombre">
          <Input
            value={form.nombre}
            onChangeText={set("nombre")}
            placeholder="ej: Vaso 8oz"
          />
        </Field>
        <DuplicateWarning
          texto={form.nombre}
          lista={lista}
          excluirId={editId}
          etiqueta="packaging"
          getSub={(p) =>
            `${tipoInfo(p.tipo).label} · $${fmtUnit(p.precio_unidad)}/unidad`
          }
          onEditar={abrir}
        />

        <Field label="Tipo">
          <ChipPicker
            items={TIPOS.map((x) => ({
              id: x.key,
              nombre: `${x.icon} ${x.label}`,
            }))}
            tone="teal"
            buscar={false}
            selectedIds={[form.tipo]}
            onPick={(it) => set("tipo")(it.id)}
          />
        </Field>

        <View style={s.dosCols}>
          <View style={{ flex: 1 }}>
            <Field label="Precio total pagado ($)">
              <Input
                value={form.precio_compra}
                onChangeText={set("precio_compra")}
                keyboardType="decimal-pad"
                placeholder="ej: 5000"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Cantidad comprada (unidades)">
              <Input
                value={form.cantidad_compra}
                onChangeText={set("cantidad_compra")}
                keyboardType="decimal-pad"
                placeholder="ej: 100"
              />
            </Field>
          </View>
        </View>

        <Block
          tone="pink"
          icon="🧮"
          title="Costo por unidad"
          hint="Se calcula solo: precio ÷ cantidad"
        >
          <Text style={s.resultado}>
            {precioUnd !== null ? `$${fmtUnit(precioUnd)} / unidad` : "—"}
          </Text>
        </Block>
      </ModalShell>

      <DialogLayer />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pad: { paddingHorizontal: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
    borderLeftColor: "#00897b",
    padding: 14,
    marginTop: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e0f2f1",
    alignItems: "center",
    justifyContent: "center",
  },
  nombreRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  nombre: { fontSize: 15, fontWeight: "800", color: C.fg },
  precio: {
    fontSize: 17,
    fontWeight: "800",
    color: C.accentDark,
    marginTop: 6,
  },
  precioUnidad: { fontSize: 12, fontWeight: "600", color: C.fg3 },
  detalle: { fontSize: 12, color: C.fg3, marginTop: 4 },
  dosCols: { flexDirection: "row", gap: 10 },
  resultado: { fontSize: 20, fontWeight: "800", color: C.accentDark },
});
