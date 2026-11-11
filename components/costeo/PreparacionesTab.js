// components/costeo/PreparacionesTab.js
// Sub-recetas caseras (leche condensada, mermelada, caramelo…). Llevan
// ingredientes y también otras preparaciones. Cada línea se edita en el sitio.
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
  Segmented,
  Block,
  EmptyState,
  DuplicateWarning,
  AddLinePanel,
  LineaEditable,
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
  formulaLinea,
  coincide,
  catInfo,
} from "./ui";

const UNIDADES = ["gr", "ml", "unidad"];
const EMPTY = { nombre: "", descripcion: "", rendimiento_gr: "", unidad: "gr" };
const TIPOS = {
  ingrediente: {
    icono: "🥛",
    tone: "green",
    etiqueta: "Ingrediente",
    orden: 0,
  },
  preparacion: {
    icono: "🫙",
    tone: "purple",
    etiqueta: "Preparación",
    orden: 1,
  },
};
const keyDe = (l) => `${l.tipo}-${l.id}`;
const esPrepLinea = (l) => !l.ingrediente_id && !!l.prep_ingrediente_id;

export default function PreparacionesTab() {
  const { ingredientes, preparaciones, guardarPreparacion, borrarPreparacion } =
    useCosteo();

  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  // { tipo, id, cantidad (texto), nombre, unidad, precio }
  const [lineas, setLineas] = useState([]);
  const [panel, setPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detalleId, setDetalleId] = useState(null);

  const listaPreps = preparaciones ?? [];
  const lista = ingredientes ?? [];
  const prepById = (id) => listaPreps.find((p) => p.id === Number(id));
  const set = (campo) => (v) => setForm((f) => ({ ...f, [campo]: v }));

  // ¿la preparación `desdeId` usa (directa o indirectamente) a `buscadaId`?
  const contiene = (desdeId, buscadaId, vistos = new Set()) => {
    if (Number(desdeId) === Number(buscadaId)) return true;
    if (vistos.has(desdeId)) return false;
    vistos.add(desdeId);
    return (prepById(desdeId)?.ingredientes ?? []).some(
      (l) =>
        esPrepLinea(l) && contiene(l.prep_ingrediente_id, buscadaId, vistos),
    );
  };

  // ── abrir / cerrar ─────────────────────────────────────────
  const abrir = (item = null) => {
    setEditId(item?.id ?? null);
    setForm(
      item
        ? {
            nombre: item.nombre,
            descripcion: item.descripcion ?? "",
            rendimiento_gr: aTexto(item.rendimiento_gr),
            unidad: item.unidad ?? "gr",
          }
        : EMPTY,
    );
    setLineas(
      (item?.ingredientes ?? []).map((l) =>
        esPrepLinea(l)
          ? {
              tipo: "preparacion",
              id: l.prep_ingrediente_id,
              cantidad: aTexto(l.cantidad),
              nombre: l.prep_nombre,
              unidad: l.prep_unidad ?? "gr",
              precio: Number(l.costo_unitario ?? 0),
            }
          : {
              tipo: "ingrediente",
              id: l.ingrediente_id,
              cantidad: aTexto(l.cantidad),
              nombre: l.ingr_nombre,
              unidad: l.unidad,
              precio: Number(l.precio_unidad ?? 0),
            },
      ),
    );
    setPanel(false);
    setModal(true);
  };
  const cerrar = () => {
    setModal(false);
    setPanel(false);
  };

  // ── líneas ─────────────────────────────────────────────────
  const cambiarCantidad = (key, v) =>
    setLineas((prev) =>
      prev.map((l) => (keyDe(l) === key ? { ...l, cantidad: v } : l)),
    );
  const quitar = (key) =>
    setLineas((prev) => prev.filter((l) => keyDe(l) !== key));

  const anadir = ({ fuente, id, cantidad }) => {
    let nueva = null;
    if (fuente === "ingrediente") {
      const i = lista.find((x) => x.id === id);
      if (i)
        nueva = {
          tipo: "ingrediente",
          id,
          nombre: i.nombre,
          unidad: i.unidad,
          precio: Number(i.precio_unidad),
        };
    } else {
      const p = prepById(id);
      if (p)
        nueva = {
          tipo: "preparacion",
          id,
          nombre: p.nombre,
          unidad: p.unidad ?? "gr",
          precio: Number(p.costo_por_gr ?? 0),
        };
    }
    if (!nueva)
      return avisar(
        "No se pudo añadir",
        "Ese elemento ya no está disponible. Recarga la pantalla.",
      );
    setLineas((prev) => [...prev, { ...nueva, cantidad: aTexto(cantidad) }]);
  };

  // ── costo en vivo ──────────────────────────────────────────
  const costoLote = lineas.reduce(
    (s, l) => s + toNum(l.cantidad) * l.precio,
    0,
  );
  const rendimiento = toNum(form.rendimiento_gr);
  const costoPorUnidad = rendimiento > 0 ? costoLote / rendimiento : 0;

  // ── qué se puede añadir ────────────────────────────────────
  const usadas = (tipo) =>
    lineas.filter((l) => l.tipo === tipo).map((l) => l.id);
  const circulares = editId
    ? listaPreps.filter((p) => p.id !== editId && contiene(p.id, editId))
    : [];
  const prepsOpciones = listaPreps.filter(
    (p) =>
      p.id !== editId &&
      !usadas("preparacion").includes(p.id) &&
      !circulares.some((c) => c.id === p.id),
  );

  const fuentes = [
    {
      key: "ingrediente",
      label: "🥛 Ingrediente",
      plural: "ingredientes",
      tone: "green",
      items: lista
        .filter((i) => !usadas("ingrediente").includes(i.id))
        .map((i) => ({
          id: i.id,
          nombre: i.nombre,
          unidad: i.unidad,
          sub: `${i.categoria ? catInfo(i.categoria).label + " · " : ""}$${fmtUnit(i.precio_unidad)}/${i.unidad}`,
        })),
      vacio: lista.length
        ? "Ya añadiste todos los ingredientes"
        : "Aún no hay ingredientes. Créalos en la pestaña Ingredientes.",
    },
    {
      key: "preparacion",
      label: "🫙 Otra preparación",
      plural: "preparaciones",
      tone: "purple",
      items: prepsOpciones.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        unidad: p.unidad ?? "gr",
        sub: `$${fmtUnit(p.costo_por_gr)}/${p.unidad ?? "gr"}`,
      })),
      vacio: circulares.length
        ? "No hay otras preparaciones para añadir aquí"
        : "No hay otras preparaciones creadas todavía",
      nota: circulares.length
        ? `No se ofrece ${circulares.map((p) => p.nombre).join(", ")} porque ya usa${circulares.length > 1 ? "n" : ""} esta preparación: sería circular.`
        : undefined,
    },
  ];

  // ── guardar / borrar ───────────────────────────────────────
  const guardar = async () => {
    const nombre = form.nombre.trim();
    if (!nombre)
      return avisar("Falta el nombre", "Escribe cómo se llama la preparación.");
    if (!(rendimiento > 0))
      return avisar(
        "Falta el rendimiento",
        `Indica cuántos ${form.unidad} produce la receta completa.`,
      );
    if (lineas.length === 0)
      return avisar(
        "No tiene ingredientes",
        "Añade al menos un ingrediente para poder calcular el costo.",
      );
    const sinCantidad = lineas.filter((l) => !(toNum(l.cantidad) > 0));
    if (sinCantidad.length)
      return avisar(
        "Hay líneas sin cantidad",
        `Completa o quita: ${sinCantidad.map((l) => l.nombre).join(", ")}.`,
      );

    setSaving(true);
    try {
      await guardarPreparacion(
        {
          nombre,
          descripcion: form.descripcion,
          rendimiento_gr: rendimiento,
          unidad: form.unidad,
          ingredientes: lineas.map((l) => ({
            ingrediente_id: l.tipo === "ingrediente" ? l.id : null,
            prep_ingrediente_id: l.tipo === "preparacion" ? l.id : null,
            cantidad: toNum(l.cantidad),
          })),
        },
        editId,
      );
      cerrar();
      toast(editId ? "Preparación actualizada" : "Preparación creada");
    } catch (e) {
      avisar(
        "No se pudo guardar la preparación",
        e.message || "Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const borrar = async (item) => {
    const si = await confirmar(
      "Eliminar preparación",
      `¿Eliminar "${item.nombre}"?`,
      {
        confirmText: "Eliminar",
        destructive: true,
      },
    );
    if (!si) return;
    try {
      await borrarPreparacion(item.id);
      toast("Preparación eliminada");
    } catch (e) {
      avisar("No se puede eliminar", e.message || "Inténtalo de nuevo.");
    }
  };

  // ── render ─────────────────────────────────────────────────
  const visibles = listaPreps.filter((p) => coincide(busqueda, p.nombre));
  const ordenadas = [...lineas].sort(
    (a, b) => TIPOS[a.tipo].orden - TIPOS[b.tipo].orden,
  );
  const detalle = detalleId != null ? prepById(detalleId) : null;

  const resumen = (
    <View style={s.sticky}>
      <View style={{ flex: 1 }}>
        <Text style={s.stickyLabel}>Costo del lote</Text>
        <Text style={s.stickyValor}>${fmtPeso(costoLote)}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.stickyLabel}>Costo por {form.unidad}</Text>
        <Text style={s.stickyValor}>${fmtUnit(costoPorUnidad)}</Text>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <FlatList
        data={visibles}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={[PAGE, { paddingBottom: 40 }]}
        ListHeaderComponent={
          <View>
            <PageHeader
              icon="🫙"
              tone="purple"
              title="Preparaciones"
              subtitle="Recetas caseras que se usan dentro de bases y helados"
              right={
                <Btn
                  label="Nueva"
                  icon="＋"
                  tone="pink"
                  onPress={() => abrir()}
                />
              }
            />
            {listaPreps.length > 4 ? (
              <View style={s.pad}>
                <SearchBox
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder="Buscar preparación…"
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          listaPreps.length === 0 ? (
            <EmptyState
              icon="🫙"
              tone="purple"
              titulo="Aún no hay preparaciones"
              texto="Crea aquí lo que preparas aparte, como la leche condensada o una mermelada, y úsalo en tus bases."
              accion="Crear la primera"
              onAccion={() => abrir()}
            />
          ) : (
            <EmptyState
              icon="🔍"
              titulo="Ninguna coincide"
              texto="Prueba con otra palabra."
            />
          )
        }
        renderItem={({ item }) => {
          const n = (item.ingredientes ?? []).length;
          const subs = (item.ingredientes ?? []).filter(esPrepLinea);
          return (
            <View style={s.pad}>
              <View style={s.card}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.cardNombre}>{item.nombre}</Text>
                  {item.descripcion ? (
                    <Text style={s.cardDesc}>{item.descripcion}</Text>
                  ) : null}
                  <View style={s.tags}>
                    <Tag
                      tone="green"
                      icon="🥛"
                      label={`${n - subs.length} ingrediente${n - subs.length === 1 ? "" : "s"}`}
                    />
                    {subs.map((l) => (
                      <Tag
                        key={l.prep_ingrediente_id}
                        tone="purple"
                        icon="🫙"
                        label={l.prep_nombre}
                      />
                    ))}
                  </View>
                  <Text style={s.cardCosto}>
                    Rinde {fmtCant(item.rendimiento_gr)} {item.unidad} ·{" "}
                    <Text style={s.cardCostoU}>
                      ${fmtUnit(item.costo_por_gr)}/{item.unidad}
                    </Text>
                  </Text>
                  <Text
                    style={s.verDesglose}
                    onPress={() => setDetalleId(item.id)}
                  >
                    Ver desglose →
                  </Text>
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

      {/* ── crear / editar ── */}
      <ModalShell
        visible={modal}
        onClose={cerrar}
        tone="purple"
        icon="🫙"
        title={editId ? "Editar preparación" : "Nueva preparación"}
        subtitle={
          editId
            ? form.nombre
            : "Ingredientes y, si quieres, otras preparaciones"
        }
        sticky={resumen}
        footer={
          <FooterBtns onCancel={cerrar} onSave={guardar} saving={saving} />
        }
      >
        <Field label="Nombre">
          <Input
            value={form.nombre}
            onChangeText={set("nombre")}
            placeholder="ej: Leche condensada casera"
          />
        </Field>
        <DuplicateWarning
          texto={form.nombre}
          lista={listaPreps}
          excluirId={editId}
          etiqueta="preparación"
          getSub={(p) =>
            `Rinde ${fmtCant(p.rendimiento_gr)} ${p.unidad} · $${fmtUnit(p.costo_por_gr)}/${p.unidad}`
          }
          onEditar={editId ? undefined : abrir}
        />

        <Field label="Descripción (opcional)">
          <Input
            value={form.descripcion}
            onChangeText={set("descripcion")}
            placeholder="Notas de elaboración…"
          />
        </Field>

        <Field label="Unidad del resultado">
          <Segmented
            tone="purple"
            value={form.unidad}
            onChange={set("unidad")}
            options={UNIDADES.map((u) => ({ value: u, label: u }))}
          />
        </Field>

        <Field
          label={`Rendimiento total (${form.unidad})`}
          hint="Cuánto produce la receta completa. Con esto se calcula el costo por unidad."
        >
          <Input
            value={form.rendimiento_gr}
            onChangeText={set("rendimiento_gr")}
            keyboardType="decimal-pad"
            placeholder="ej: 800"
            invalid={form.rendimiento_gr !== "" && !(rendimiento > 0)}
          />
        </Field>

        <Block
          tone="purple"
          icon="🧪"
          title="Lo que lleva"
          hint="Toca una cantidad para cambiarla"
          right={
            !panel ? (
              <Btn
                label="Añadir"
                icon="＋"
                small
                variant="soft"
                tone="pink"
                onPress={() => setPanel(true)}
              />
            ) : null
          }
        >
          {ordenadas.length === 0 ? (
            <Text style={s.vacio}>
              Todavía no tiene nada. Toca «Añadir» para elegir ingredientes u
              otras preparaciones.
            </Text>
          ) : (
            ordenadas.map((l) => {
              const t = TIPOS[l.tipo];
              return (
                <LineaEditable
                  key={keyDe(l)}
                  icono={t.icono}
                  tone={t.tone}
                  nombre={l.nombre}
                  detalle={t.etiqueta}
                  cantidad={l.cantidad}
                  unidad={l.unidad}
                  formula={formulaLinea(l.cantidad, l.unidad, l.precio)}
                  onChange={(v) => cambiarCantidad(keyDe(l), v)}
                  onRemove={() => quitar(keyDe(l))}
                />
              );
            })
          )}
          {panel ? (
            <AddLinePanel
              fuentes={fuentes}
              onAdd={anadir}
              onClose={() => setPanel(false)}
            />
          ) : null}
        </Block>
      </ModalShell>

      {/* ── desglose de costo ── */}
      <ModalShell
        visible={!!detalle}
        onClose={() => setDetalleId(null)}
        tone="purple"
        icon="🫙"
        title={detalle?.nombre ?? ""}
        subtitle="Desglose de costo"
        footer={
          <Btn
            label="Cerrar"
            tone="purple"
            full
            onPress={() => setDetalleId(null)}
          />
        }
      >
        {detalle ? (
          <View>
            {detalle.descripcion ? (
              <Text style={s.cardDesc}>{detalle.descripcion}</Text>
            ) : null}
            {(detalle.ingredientes ?? []).map((l, i) => (
              <View key={i} style={s.detRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.detNombre}>
                    {esPrepLinea(l) ? "🫙 " : "🥛 "}
                    {l.nombre}
                  </Text>
                  <Text style={s.detSub}>
                    {fmtCant(l.cantidad)} {l.unidad_item} × $
                    {fmtUnit(l.costo_unitario)}
                  </Text>
                </View>
                <Text style={s.detCosto}>${fmtPeso(l.costo_linea)}</Text>
              </View>
            ))}
            <View style={s.detTotal}>
              <View>
                <Text style={s.stickyLabel}>Costo del lote</Text>
                <Text style={s.stickyValor}>
                  ${fmtPeso(detalle.costo_total)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.stickyLabel}>
                  Rinde {fmtCant(detalle.rendimiento_gr)} {detalle.unidad}
                </Text>
                <Text style={s.stickyValor}>
                  ${fmtUnit(detalle.costo_por_gr)}/{detalle.unidad}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ModalShell>

      <DialogLayer />
    </View>
  );
}

const MORADO = "#6d28d9";
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
    borderLeftColor: "#7c3aed",
    padding: 14,
    marginTop: 10,
  },
  cardNombre: { fontSize: 16, fontWeight: "800", color: C.fg },
  cardDesc: { fontSize: 12, color: C.fg3, marginTop: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  cardCosto: { fontSize: 12, color: C.fg2, marginTop: 8 },
  cardCostoU: { color: C.accentDark, fontWeight: "800" },
  verDesglose: { fontSize: 12, color: MORADO, fontWeight: "700", marginTop: 6 },
  vacio: { fontSize: 13, color: C.fg3, paddingVertical: 10, lineHeight: 19 },
  sticky: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd6fe",
  },
  stickyLabel: { fontSize: 11, color: MORADO, fontWeight: "700" },
  stickyValor: { fontSize: 18, color: MORADO, fontWeight: "800" },
  detRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  detNombre: { fontSize: 14, fontWeight: "700", color: C.fg },
  detSub: { fontSize: 12, color: C.fg3, marginTop: 2 },
  detCosto: { fontSize: 14, fontWeight: "800", color: C.fg },
  detTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
});
