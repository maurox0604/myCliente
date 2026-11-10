// components/costeo/BasesTab.js
// Una base se arma con: ingredientes (gr/ml/unidad) + preparaciones caseras
// (gr/ml) + otras bases (ml).  Ej.: Base chocolatosa = 1000 ml de Base principal
// + cacao + café.  Cada línea se puede editar en el sitio (tocar la cantidad).
import React, { useEffect, useState } from "react";
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

// Un color por tipo de línea (igual que en tu esquema: ingredientes verde,
// preparaciones morado, bases azul)
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
  base: { icono: "🧊", tone: "blue", etiqueta: "Otra base", orden: 2 },
};
const EMPTY_FORM = { nombre: "", descripcion: "", rendimiento_ml: "1000" };

const keyDe = (l) => `${l.tipo}-${l.id}`;

export default function BasesTab() {
  const {
    bases,
    ingredientes,
    preparaciones,
    guardarBase,
    borrarBase,
    fetchBases,
    fetchPreparaciones,
  } = useCosteo();

  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  // { tipo, id, cantidad (texto), nombre, unidad, precio }  → se guarda una "foto"
  // del nombre/precio al abrir o añadir, así la línea siempre se puede ver y editar.
  const [lineas, setLineas] = useState([]);
  const [panel, setPanel] = useState(false);
  const [saving, setSaving] = useState(false);

  // Los costos de bases y preparaciones los calcula el servidor: se refrescan
  // al entrar para no mostrar precios viejos.
  useEffect(() => {
    (async () => {
      try {
        if (fetchPreparaciones) await fetchPreparaciones();
        if (fetchBases) await fetchBases();
      } catch (_) {}
    })();
  }, []);

  const listaBases = bases ?? [];
  const baseById = (id) => listaBases.find((b) => b.id === Number(id));

  // ¿`desdeId` contiene (directa o indirectamente) a `buscadaId`?
  const contiene = (desdeId, buscadaId, vistos = new Set()) => {
    if (Number(desdeId) === Number(buscadaId)) return true;
    if (vistos.has(desdeId)) return false;
    vistos.add(desdeId);
    return (baseById(desdeId)?.sub_bases ?? []).some((s) =>
      contiene(s.base_origen_id, buscadaId, vistos),
    );
  };

  // ── abrir / cerrar ─────────────────────────────────────────
  const abrir = (base = null) => {
    setEditId(base?.id ?? null);
    setForm(
      base
        ? {
            nombre: base.nombre,
            descripcion: base.descripcion ?? "",
            rendimiento_ml: aTexto(base.rendimiento_ml ?? 1000),
          }
        : EMPTY_FORM,
    );
    setLineas([
      ...(base?.ingredientes ?? []).map((i) => ({
        tipo: "ingrediente",
        id: i.ingrediente_id,
        cantidad: aTexto(i.cantidad),
        nombre: i.ingr_nombre,
        unidad: i.unidad,
        precio: Number(i.precio_unidad),
      })),
      ...(base?.preparaciones ?? []).map((p) => ({
        tipo: "preparacion",
        id: p.prep_id,
        cantidad: aTexto(p.cantidad),
        nombre: p.prep_nombre,
        unidad: p.prep_unidad ?? "gr",
        precio: Number(p.costo_por_gr),
      })),
      ...(base?.sub_bases ?? []).map((s) => ({
        tipo: "base",
        id: s.base_origen_id,
        cantidad: aTexto(s.cantidad_ml),
        nombre: s.origen_nombre,
        unidad: "ml",
        precio: Number(s.costo_por_ml),
      })),
    ]);
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
      const i = (ingredientes ?? []).find((x) => x.id === id);
      if (i)
        nueva = {
          tipo: "ingrediente",
          id,
          nombre: i.nombre,
          unidad: i.unidad,
          precio: Number(i.precio_unidad),
        };
    } else if (fuente === "preparacion") {
      const p = (preparaciones ?? []).find((x) => x.id === id);
      if (p)
        nueva = {
          tipo: "preparacion",
          id,
          nombre: p.nombre,
          unidad: p.unidad ?? "gr",
          precio: Number(p.costo_por_gr ?? 0),
        };
    } else {
      const b = baseById(id);
      if (b)
        nueva = {
          tipo: "base",
          id,
          nombre: b.nombre,
          unidad: "ml",
          precio: Number(b.costo_por_ml ?? 0),
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
  const rendimiento = toNum(form.rendimiento_ml);
  const costoPorMl = rendimiento > 0 ? costoLote / rendimiento : 0;

  // ── qué se puede añadir ────────────────────────────────────
  const usadas = (tipo) =>
    lineas.filter((l) => l.tipo === tipo).map((l) => l.id);

  // Bases que se pueden usar dentro de ésta: no ella misma, no las ya añadidas
  // y ninguna que ya la use (sería circular: A dentro de B y B dentro de A).
  const basesCirculares = editId
    ? listaBases.filter((b) => b.id !== editId && contiene(b.id, editId))
    : [];
  const basesOpciones = listaBases.filter(
    (b) =>
      b.id !== editId &&
      !usadas("base").includes(b.id) &&
      !basesCirculares.some((c) => c.id === b.id),
  );

  const fuentes = [
    {
      key: "ingrediente",
      label: "🥛 Ingrediente",
      plural: "ingredientes",
      tone: "green",
      items: (ingredientes ?? [])
        .filter((i) => !usadas("ingrediente").includes(i.id))
        .map((i) => ({
          id: i.id,
          nombre: i.nombre,
          unidad: i.unidad,
          sub: `${i.categoria ? catInfo(i.categoria).label + " · " : ""}$${fmtUnit(i.precio_unidad)}/${i.unidad}`,
        })),
      vacio: "Ya añadiste todos los ingredientes",
    },
    {
      key: "preparacion",
      label: "🫙 Preparación",
      plural: "preparaciones",
      tone: "purple",
      items: (preparaciones ?? [])
        .filter((p) => !usadas("preparacion").includes(p.id))
        .map((p) => ({
          id: p.id,
          nombre: p.nombre,
          unidad: p.unidad ?? "gr",
          sub: `$${fmtUnit(p.costo_por_gr)}/${p.unidad ?? "gr"}`,
        })),
      vacio: (preparaciones ?? []).length
        ? "Ya añadiste todas las preparaciones"
        : "Aún no hay preparaciones. Créalas en la pestaña Preparaciones.",
    },
    {
      key: "base",
      label: "🧊 Otra base",
      plural: "bases",
      tone: "blue",
      items: basesOpciones.map((b) => ({
        id: b.id,
        nombre: b.nombre,
        unidad: "ml",
        sub: `$${fmtUnit(b.costo_por_ml)}/ml`,
      })),
      vacio: basesCirculares.length
        ? "No hay otras bases para añadir aquí"
        : "No hay otras bases creadas todavía",
      nota: basesCirculares.length
        ? `No se ofrece ${basesCirculares.map((b) => b.nombre).join(", ")} porque ya usa${basesCirculares.length > 1 ? "n" : ""} esta base: ponerla aquí sería circular.`
        : undefined,
    },
  ];

  // ── guardar / borrar ───────────────────────────────────────
  const guardar = async () => {
    if (!form.nombre.trim())
      return avisar("Falta el nombre", "Escribe cómo se llama la base.");
    if (!(rendimiento > 0))
      return avisar(
        "Falta el rendimiento",
        "Indica cuántos ml rinde el lote completo.",
      );
    const sinCantidad = lineas.filter((l) => !(toNum(l.cantidad) > 0));
    if (sinCantidad.length)
      return avisar(
        "Hay líneas sin cantidad",
        `Completa o quita: ${sinCantidad.map((l) => l.nombre).join(", ")}.`,
      );
    setSaving(true);
    try {
      await guardarBase(
        {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion,
          rendimiento_ml: rendimiento,
          ingredientes: lineas
            .filter((l) => l.tipo === "ingrediente")
            .map((l) => ({
              ingrediente_id: l.id,
              cantidad: toNum(l.cantidad),
            })),
          preparaciones: lineas
            .filter((l) => l.tipo === "preparacion")
            .map((l) => ({ prep_id: l.id, cantidad: toNum(l.cantidad) })),
          sub_bases: lineas
            .filter((l) => l.tipo === "base")
            .map((l) => ({
              base_origen_id: l.id,
              cantidad_ml: toNum(l.cantidad),
            })),
        },
        editId,
      );
      cerrar();
      toast(editId ? "Base actualizada" : "Base creada");
    } catch (e) {
      avisar("No se pudo guardar la base", e.message || "Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const borrar = async (base) => {
    const si = await confirmar(
      "Eliminar base",
      `¿Eliminar "${base.nombre}"? Esta acción no se puede deshacer.`,
      {
        confirmText: "Eliminar",
        destructive: true,
      },
    );
    if (!si) return;
    try {
      await borrarBase(base.id);
      toast("Base eliminada");
    } catch (e) {
      avisar("No se pudo eliminar", e.message);
    }
  };

  // ── render ─────────────────────────────────────────────────
  const visibles = listaBases.filter((b) => coincide(busqueda, b.nombre));
  const ordenadas = [...lineas].sort(
    (a, b) => TIPOS[a.tipo].orden - TIPOS[b.tipo].orden,
  );

  const resumen = (
    <View style={s.sticky}>
      <View style={{ flex: 1 }}>
        <Text style={s.stickyLabel}>Costo del lote</Text>
        <Text style={s.stickyValor}>${fmtPeso(costoLote)}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.stickyLabel}>Costo por ml</Text>
        <Text style={s.stickyValor}>${fmtUnit(costoPorMl)}</Text>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <FlatList
        data={visibles}
        keyExtractor={(b) => String(b.id)}
        contentContainerStyle={[PAGE, { paddingBottom: 40 }]}
        ListHeaderComponent={
          <View>
            <PageHeader
              icon="🧊"
              tone="blue"
              title="Bases"
              subtitle="Mezclas que se usan en varios helados: ingredientes, preparaciones y otras bases"
              right={
                <Btn
                  label="Nueva base"
                  icon="＋"
                  tone="pink"
                  onPress={() => abrir()}
                />
              }
            />
            {listaBases.length > 4 ? (
              <View style={s.pad}>
                <SearchBox
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder="Buscar base…"
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          listaBases.length === 0 ? (
            <EmptyState
              icon="🧊"
              titulo="Aún no hay bases"
              texto="Crea la base principal con sus ingredientes. Después puedes armar otras a partir de ella."
              accion="Crear la primera base"
              onAccion={() => abrir()}
            />
          ) : (
            <EmptyState
              icon="🔍"
              titulo="Ninguna base coincide"
              texto="Prueba con otra palabra."
            />
          )
        }
        renderItem={({ item }) => {
          const nIng = (item.ingredientes ?? []).length;
          const nPrep = (item.preparaciones ?? []).length;
          const subs = item.sub_bases ?? [];
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
                      label={`${nIng} ingrediente${nIng === 1 ? "" : "s"}`}
                    />
                    {nPrep > 0 ? (
                      <Tag
                        tone="purple"
                        icon="🫙"
                        label={`${nPrep} preparación${nPrep === 1 ? "" : "es"}`}
                      />
                    ) : null}
                    {subs.map((b) => (
                      <Tag
                        key={b.base_origen_id}
                        tone="blue"
                        icon="🧊"
                        label={`${b.origen_nombre} · ${fmtCant(b.cantidad_ml)} ml`}
                      />
                    ))}
                  </View>
                  <Text style={s.cardCosto}>
                    Lote ${fmtPeso(item.costo_tanda)} · rinde{" "}
                    {fmtCant(item.rendimiento_ml)} ml ·{" "}
                    <Text style={s.cardCostoMl}>
                      ${fmtUnit(item.costo_por_ml)}/ml
                    </Text>
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

      <ModalShell
        visible={modal}
        onClose={cerrar}
        tone="blue"
        icon="🧊"
        title={editId ? "Editar base" : "Nueva base"}
        subtitle={
          editId ? form.nombre : "Ingredientes, preparaciones y otras bases"
        }
        sticky={resumen}
        footer={
          <FooterBtns
            onCancel={cerrar}
            onSave={guardar}
            saving={saving}
            saveLabel="Guardar base"
          />
        }
      >
        <Field label="Nombre de la base">
          <Input
            value={form.nombre}
            onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))}
            placeholder="ej: Base chocolatosa"
          />
        </Field>
        <DuplicateWarning
          texto={form.nombre}
          lista={listaBases}
          excluirId={editId}
          etiqueta="base"
          getSub={(b) =>
            `Rinde ${fmtCant(b.rendimiento_ml)} ml · $${fmtUnit(b.costo_por_ml)}/ml`
          }
          onEditar={editId ? undefined : abrir}
        />

        <Field label="Descripción (opcional)">
          <Input
            value={form.descripcion}
            onChangeText={(v) => setForm((f) => ({ ...f, descripcion: v }))}
            placeholder="Notas sobre esta base"
          />
        </Field>

        <Field
          label="Rendimiento del lote (ml)"
          hint="Cuántos ml salen en total con esta receta. Con esto se calcula el costo por ml que usan los helados."
        >
          <Input
            value={form.rendimiento_ml}
            onChangeText={(v) => setForm((f) => ({ ...f, rendimiento_ml: v }))}
            keyboardType="decimal-pad"
            placeholder="ej: 1000"
            invalid={!(rendimiento > 0)}
          />
        </Field>

        <Block
          tone="blue"
          icon="🧪"
          title="Lo que lleva esta base"
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
              Todavía no tiene nada. Toca «Añadir» para elegir ingredientes,
              preparaciones u otras bases.
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
    borderLeftColor: "#1976d2",
    padding: 14,
    marginTop: 10,
  },
  cardNombre: { fontSize: 16, fontWeight: "800", color: C.fg },
  cardDesc: { fontSize: 12, color: C.fg3, marginTop: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  cardCosto: { fontSize: 12, color: C.fg2, marginTop: 8 },
  cardCostoMl: { color: C.accentDark, fontWeight: "800" },
  vacio: { fontSize: 13, color: C.fg3, paddingVertical: 10, lineHeight: 19 },
  sticky: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#bbdefb",
  },
  stickyLabel: { fontSize: 11, color: "#1565c0", fontWeight: "700" },
  stickyValor: {
    fontSize: 18,
    color: "#1565c0",
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
