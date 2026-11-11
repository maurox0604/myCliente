// components/costeo/IngredientesTab.js
// Ingredientes con categoría (Base / Fruta / Topping / Otro), buscador de
// nombres parecidos al escribir (leche "clim" vs "Klim") y avisos visibles en web.
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useCosteo } from "../../context/CosteoContext";
import {
  C,
  CATEGORIAS,
  PAGE,
  PageHeader,
  Btn,
  IconBtn,
  Tag,
  Field,
  Input,
  SearchBox,
  Segmented,
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
  fmtCant,
  fmtUnit,
  toNum,
  aTexto,
  coincide,
  catInfo,
  buscarSimilares,
} from "./ui";

const UNIDADES = ["gr", "ml", "unidad"];
const EMPTY = {
  nombre: "",
  unidad: "gr",
  categoria: "otro",
  precio_compra: "",
  cantidad_compra: "",
  proveedor: "",
};

export default function IngredientesTab() {
  const { ingredientes, guardarIngrediente, borrarIngrediente } = useCosteo();

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const lista = ingredientes ?? [];
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
            unidad: item.unidad,
            categoria: item.categoria ?? "otro",
            precio_compra: aTexto(item.precio_compra),
            cantidad_compra: aTexto(item.cantidad_compra),
            proveedor: item.proveedor ?? "",
          }
        : EMPTY,
    );
    setModal(true);
  };
  const cerrar = () => setModal(false);

  const guardar = async () => {
    const nombre = form.nombre.trim();
    if (!nombre)
      return avisar("Falta el nombre", "Escribe cómo se llama el ingrediente.");
    if (!(precio > 0))
      return avisar(
        "Falta el precio",
        "Escribe cuánto pagaste en total por la compra.",
      );
    if (!(cantidad > 0))
      return avisar(
        "Falta la cantidad",
        `Escribe cuántos ${form.unidad} compraste con ese precio.`,
      );

    const igual = buscarSimilares(nombre, lista, (x) => x.nombre, editId).find(
      (r) => r.nivel === "igual",
    );
    if (igual)
      return avisar(
        "Ese ingrediente ya existe",
        `Ya tienes "${igual.item.nombre}". Edítalo en vez de crear otro igual.`,
      );

    setSaving(true);
    try {
      await guardarIngrediente(
        {
          nombre,
          unidad: form.unidad,
          categoria: form.categoria,
          precio_compra: precio,
          cantidad_compra: cantidad,
          precio_unidad: precio / cantidad,
          proveedor: form.proveedor.trim(),
        },
        editId,
      );
      cerrar();
      toast(editId ? "Ingrediente actualizado" : "Ingrediente creado");
    } catch (e) {
      avisar("No se pudo guardar", e.message || "Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const borrar = async (item) => {
    const si = await confirmar(
      "Eliminar ingrediente",
      `¿Eliminar "${item.nombre}"?`,
      {
        confirmText: "Eliminar",
        destructive: true,
      },
    );
    if (!si) return;
    try {
      await borrarIngrediente(item.id);
      toast("Ingrediente eliminado");
    } catch (e) {
      // ej.: "No se puede eliminar: lo usan las bases Base principal…"
      avisar("No se puede eliminar", e.message || "Inténtalo de nuevo.");
    }
  };

  // ── filtros ────────────────────────────────────────────────
  const cuenta = (k) =>
    lista.filter((i) => (i.categoria ?? "otro") === k).length;
  const visibles = lista
    .filter((i) => filtro === "todos" || (i.categoria ?? "otro") === filtro)
    .filter((i) => coincide(busqueda, i.nombre))
    .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"));

  const opcionesFiltro = [
    { value: "todos", label: `Todos (${lista.length})` },
    ...CATEGORIAS.map((c) => ({
      value: c.key,
      label: `${c.icon} ${c.label} (${cuenta(c.key)})`,
    })),
  ];

  const cat = catInfo(form.categoria);

  return (
    <View style={s.container}>
      <FlatList
        data={visibles}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={[PAGE, { paddingBottom: 40 }]}
        ListHeaderComponent={
          <View>
            <PageHeader
              icon="🥛"
              tone="green"
              title="Ingredientes"
              subtitle="Materias primas con su costo por gr, ml o unidad"
              right={
                <Btn
                  label="Nuevo"
                  icon="＋"
                  tone="pink"
                  onPress={() => abrir()}
                />
              }
            />
            {lista.length > 0 ? (
              <View style={s.pad}>
                <SearchBox
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder="Buscar ingrediente…"
                  style={{ marginTop: 10 }}
                />
                <View style={{ marginTop: 10 }}>
                  <Segmented
                    tone="green"
                    value={filtro}
                    onChange={setFiltro}
                    options={opcionesFiltro}
                  />
                </View>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          lista.length === 0 ? (
            <EmptyState
              icon="🥛"
              tone="green"
              titulo="Aún no hay ingredientes"
              texto="Empieza por la leche, el azúcar y lo que compras para hacer tus helados."
              accion="Agregar el primero"
              onAccion={() => abrir()}
            />
          ) : (
            <EmptyState
              icon="🔍"
              titulo="Nada coincide"
              texto="Prueba con otra palabra o cambia el filtro."
            />
          )
        }
        renderItem={({ item }) => {
          const c = catInfo(item.categoria);
          return (
            <View style={s.pad}>
              <View style={[s.card, { borderLeftColor: "#2e9e4f" }]}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={s.nombreRow}>
                    <Text style={s.nombre} numberOfLines={2}>
                      {item.nombre}
                    </Text>
                    <Tag tone={c.tone} icon={c.icon} label={c.label} />
                  </View>
                  <Text style={s.precio}>
                    ${fmtUnit(item.precio_unidad)}
                    <Text style={s.precioUnidad}> / {item.unidad}</Text>
                  </Text>
                  {item.precio_compra ? (
                    <Text style={s.detalle}>
                      Compra: ${fmtPeso(item.precio_compra)} por{" "}
                      {fmtCant(item.cantidad_compra)} {item.unidad}
                      {item.proveedor ? `  ·  ${item.proveedor}` : ""}
                    </Text>
                  ) : item.proveedor ? (
                    <Text style={s.detalle}>{item.proveedor}</Text>
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
        tone="green"
        icon="🥛"
        title={editId ? "Editar ingrediente" : "Nuevo ingrediente"}
        subtitle={editId ? form.nombre : "Lo que compras y cuánto te cuesta"}
        footer={
          <FooterBtns onCancel={cerrar} onSave={guardar} saving={saving} />
        }
      >
        <Field label="Nombre">
          <Input
            value={form.nombre}
            onChangeText={set("nombre")}
            placeholder="ej: Leche en polvo"
          />
        </Field>
        <DuplicateWarning
          texto={form.nombre}
          lista={lista}
          excluirId={editId}
          etiqueta="ingrediente"
          getSub={(i) =>
            `${catInfo(i.categoria).label} · $${fmtUnit(i.precio_unidad)}/${i.unidad}`
          }
          onEditar={abrir}
        />

        <Field
          label="Categoría"
          hint="Los toppings son los que se pueden poner encima del helado en Recetas. Base y Fruta van como ingredientes principales."
        >
          <Segmented
            tone={cat.tone}
            value={form.categoria}
            onChange={set("categoria")}
            options={CATEGORIAS.map((c) => ({
              value: c.key,
              label: `${c.icon} ${c.label}`,
            }))}
          />
        </Field>

        <Field label="Unidad de medida">
          <Segmented
            tone="green"
            value={form.unidad}
            onChange={set("unidad")}
            options={UNIDADES.map((u) => ({ value: u, label: u }))}
          />
        </Field>

        <View style={s.dosCols}>
          <View style={{ flex: 1 }}>
            <Field label="Precio total pagado ($)">
              <Input
                value={form.precio_compra}
                onChangeText={set("precio_compra")}
                keyboardType="decimal-pad"
                placeholder="ej: 8500"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label={`Cantidad comprada (${form.unidad})`}>
              <Input
                value={form.cantidad_compra}
                onChangeText={set("cantidad_compra")}
                keyboardType="decimal-pad"
                placeholder="ej: 500"
              />
            </Field>
          </View>
        </View>

        <Block
          tone="pink"
          icon="🧮"
          title={`Costo por ${form.unidad}`}
          hint="Se calcula solo: precio ÷ cantidad"
        >
          <Text style={s.resultado}>
            {precioUnd !== null
              ? `$${fmtUnit(precioUnd)} / ${form.unidad}`
              : "—"}
          </Text>
        </Block>

        <Field label="Proveedor (opcional)">
          <Input
            value={form.proveedor}
            onChangeText={set("proveedor")}
            placeholder="ej: Lácteos del Valle"
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
    padding: 14,
    marginTop: 10,
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
