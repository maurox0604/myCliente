// components/costeo/RecetasTab.js
// Receta de cada helado: base (en ml) + ingredientes principales + toppings
// + preparaciones caseras + packaging + costos fijos → costo y precio sugerido.
// Toppings = ingredientes con categoría "Topping" (se define en Ingredientes).
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useCosteo } from "../../context/CosteoContext";
import {
  C,
  PAGE,
  PageHeader,
  Btn,
  Tag,
  Field,
  Input,
  SearchBox,
  Segmented,
  Block,
  EmptyState,
  ChipPicker,
  AddLinePanel,
  LineaEditable,
  ModalShell,
  FooterBtns,
  DialogLayer,
  avisar,
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

const EMPTY_FORM = {
  base_id: null,
  base_ml: "",
  packaging_ids: [],
  margen: "60",
};

// Tipos de línea: principal / topping (ingredientes) y prep (preparaciones)
const KIND = {
  principal: { icono: "🍓", tone: "green", etiqueta: "Ingrediente" },
  topping: { icono: "✨", tone: "amber", etiqueta: "Topping" },
  prep: { icono: "🫙", tone: "purple", etiqueta: "Preparación" },
};
const keyDe = (l) => `${l.kind}-${l.id}`;

export default function RecetasTab() {
  const {
    recetas,
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

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  // { kind, id, cantidad (texto), nombre, unidad, precio }
  const [lineas, setLineas] = useState([]);
  const [panel, setPanel] = useState(null); // null | "principal" | "topping" | "prep"
  const [saving, setSaving] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const listaBases = bases ?? [];
  const listaIngs = ingredientes ?? [];
  const listaPreps = preparaciones ?? [];
  const listaPkg = packaging ?? [];
  const baseSel = listaBases.find((b) => b.id === form.base_id);

  // ── abrir / cerrar ─────────────────────────────────────────
  const cerrar = () => {
    setModal(false);
    setPanel(null);
  };

  const abrir = async (item) => {
    setSelected(item);
    setForm(EMPTY_FORM);
    setLineas([]);
    setPanel(null);
    setModal(true);
    setLoadingDetalle(true);
    try {
      // Bases y preparaciones traen su costo calculado en el servidor: se
      // refrescan por si cambió el precio de algún ingrediente.
      try {
        await fetchPreparaciones();
        await fetchBases();
      } catch (_) {}

      if (!item.receta_id) return; // helado sin receta: formulario vacío

      const d = await fetchRecetaDetalle(item.id);
      if (!d) {
        // No mostrar un formulario vacío: al guardar pisaría la receta real.
        cerrar();
        avisar(
          "No se pudo cargar",
          "No se pudo cargar la receta de este helado. Inténtalo de nuevo.",
        );
        return;
      }
      setForm({
        base_id: d.base_id ?? null,
        base_ml: d.base_id ? aTexto(d.base_ml) : "",
        packaging_ids: (d.packaging ?? []).map((p) => p.packaging_id),
        margen: aTexto(d.margen_pct ?? 60),
      });
      setLineas([
        ...(d.ingredientes ?? []).map((i) => ({
          kind: i.tipo === "topping" ? "topping" : "principal",
          id: i.ingrediente_id,
          cantidad: aTexto(i.cantidad),
          nombre: i.nombre,
          unidad: i.unidad,
          precio: Number(i.precio_unidad ?? 0),
        })),
        ...(d.preparaciones ?? []).map((p) => ({
          kind: "prep",
          id: p.prep_id,
          cantidad: aTexto(p.cantidad),
          nombre: p.nombre,
          unidad: p.unidad ?? "gr",
          precio: Number(p.costo_por_gr ?? 0),
        })),
      ]);
    } catch (e) {
      cerrar();
      avisar("No se pudo cargar", e.message || "Inténtalo de nuevo.");
    } finally {
      setLoadingDetalle(false);
    }
  };

  // ── líneas ─────────────────────────────────────────────────
  const cambiarCantidad = (key, v) =>
    setLineas((prev) =>
      prev.map((l) => (keyDe(l) === key ? { ...l, cantidad: v } : l)),
    );
  const quitar = (key) =>
    setLineas((prev) => prev.filter((l) => keyDe(l) !== key));

  const anadir =
    (kind) =>
    ({ id, cantidad }) => {
      let nueva = null;
      if (kind === "prep") {
        const p = listaPreps.find((x) => x.id === id);
        if (p)
          nueva = {
            kind,
            id,
            nombre: p.nombre,
            unidad: p.unidad ?? "gr",
            precio: Number(p.costo_por_gr ?? 0),
          };
      } else {
        const i = listaIngs.find((x) => x.id === id);
        if (i)
          nueva = {
            kind,
            id,
            nombre: i.nombre,
            unidad: i.unidad,
            precio: Number(i.precio_unidad ?? 0),
          };
      }
      if (!nueva)
        return avisar(
          "No se pudo añadir",
          "Ese elemento ya no está disponible. Recarga la pantalla.",
        );
      setLineas((prev) => [...prev, { ...nueva, cantidad: aTexto(cantidad) }]);
    };

  const togglePkg = (p) =>
    setForm((f) => ({
      ...f,
      packaging_ids: f.packaging_ids.includes(p.id)
        ? f.packaging_ids.filter((x) => x !== p.id)
        : [...f.packaging_ids, p.id],
    }));

  // ── costo en vivo ──────────────────────────────────────────
  const suma = (kinds) =>
    lineas
      .filter((l) => kinds.includes(l.kind))
      .reduce((a, l) => a + toNum(l.cantidad) * l.precio, 0);

  const costoBase = baseSel
    ? Number(baseSel.costo_por_ml ?? 0) * toNum(form.base_ml)
    : 0;
  const costoIngs = suma(["principal", "topping"]);
  const costoPreps = suma(["prep"]);
  const costoPkg = listaPkg
    .filter((p) => form.packaging_ids.includes(p.id))
    .reduce((a, p) => a + Number(p.precio_unidad ?? 0), 0);
  const costoFijo = Number(costosFijos?.costo_fijo_por_unidad ?? 0);
  const total = costoBase + costoIngs + costoPreps + costoPkg + costoFijo;
  const margen = toNum(form.margen);
  const margenOk = margen >= 0 && margen < 100;
  // precio = costo / (1 − margen%)
  const precioSug = margenOk ? total / (1 - margen / 100) : null;
  const precioActual = Number(selected?.precio_venta ?? 0);
  const margenReal =
    precioActual > 0 ? ((precioActual - total) / precioActual) * 100 : null;

  // composición de la base escalada a los ml de ESTE helado
  const baseLineas = (() => {
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
      ...(baseSel.preparaciones ?? []).map((p) => ({
        key: `p${p.prep_id}`,
        nombre: `🫙 ${p.prep_nombre}`,
        unidad: p.prep_unidad ?? "gr",
        cantidad: Number(p.cantidad) * f,
        precio: Number(p.costo_por_gr),
      })),
      ...(baseSel.sub_bases ?? []).map((b) => ({
        key: `b${b.base_origen_id}`,
        nombre: `🧊 ${b.origen_nombre}`,
        unidad: "ml",
        cantidad: Number(b.cantidad_ml) * f,
        precio: Number(b.costo_por_ml),
      })),
    ];
  })();

  // ── qué se puede añadir en cada sección ────────────────────
  const ingUsados = lineas.filter((l) => l.kind !== "prep").map((l) => l.id);
  const prepUsadas = lineas.filter((l) => l.kind === "prep").map((l) => l.id);
  const esTopping = (i) => i.categoria === "topping";
  const itemIng = (i) => ({
    id: i.id,
    nombre: i.nombre,
    unidad: i.unidad,
    sub: `${catInfo(i.categoria).label} · $${fmtUnit(i.precio_unidad)}/${i.unidad}`,
  });

  const fuentePrincipal = [
    {
      key: "principal",
      label: "🍓 Ingrediente",
      plural: "ingredientes",
      tone: "green",
      items: listaIngs
        .filter((i) => !esTopping(i) && !ingUsados.includes(i.id))
        .map(itemIng),
      vacio: "No hay más ingredientes para añadir",
    },
  ];
  const fuenteTopping = [
    {
      key: "topping",
      label: "✨ Topping",
      plural: "toppings",
      tone: "amber",
      items: listaIngs
        .filter((i) => esTopping(i) && !ingUsados.includes(i.id))
        .map(itemIng),
      vacio: listaIngs.some(esTopping)
        ? "Ya añadiste todos los toppings"
        : "Aún no tienes toppings. En la pestaña Ingredientes marca los que lo sean con la categoría Topping.",
    },
  ];
  const fuentePrep = [
    {
      key: "prep",
      label: "🫙 Preparación",
      plural: "preparaciones",
      tone: "purple",
      items: listaPreps
        .filter((p) => !prepUsadas.includes(p.id))
        .map((p) => ({
          id: p.id,
          nombre: p.nombre,
          unidad: p.unidad ?? "gr",
          sub: `$${fmtUnit(p.costo_por_gr)}/${p.unidad ?? "gr"}`,
        })),
      vacio: listaPreps.length
        ? "Ya añadiste todas las preparaciones"
        : "Aún no hay preparaciones. Créalas en la pestaña Preparaciones.",
    },
  ];

  // ── guardar ────────────────────────────────────────────────
  const guardar = async () => {
    if (!selected || loadingDetalle) return;
    if (form.base_id && !(toNum(form.base_ml) > 0))
      return avisar(
        "Falta la cantidad de base",
        "Indica cuántos ml de base lleva este helado.",
      );
    const sinCantidad = lineas.filter((l) => !(toNum(l.cantidad) > 0));
    if (sinCantidad.length)
      return avisar(
        "Hay líneas sin cantidad",
        `Completa o quita: ${sinCantidad.map((l) => l.nombre).join(", ")}.`,
      );
    if (!margenOk)
      return avisar("Margen inválido", "El margen debe estar entre 0 y 99 %.");
    if (!form.base_id && lineas.length === 0)
      return avisar(
        "Receta vacía",
        "Elige una base o añade al menos un ingrediente o preparación.",
      );

    setSaving(true);
    try {
      await guardarReceta(selected.id, {
        base_id: form.base_id,
        base_ml: form.base_id ? toNum(form.base_ml) : 0,
        ingredientes: lineas
          .filter((l) => l.kind !== "prep")
          .map((l) => ({
            ingrediente_id: l.id,
            cantidad: toNum(l.cantidad),
            tipo: l.kind === "topping" ? "topping" : "principal",
          })),
        preparaciones: lineas
          .filter((l) => l.kind === "prep")
          .map((l) => ({ prep_id: l.id, cantidad: toNum(l.cantidad) })),
        packaging_ids: form.packaging_ids,
        margen_pct: margen,
      });
      cerrar();
      toast("Receta guardada");
    } catch (e) {
      avisar(
        "No se pudo guardar la receta",
        e.message || "Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── una sección de líneas (principal / topping / prep) ─────
  const seccion = ({ kind, tone, icon, title, hint, fuentes, vacio }) => {
    const propias = lineas.filter((l) => l.kind === kind);
    const k = KIND[kind];
    return (
      <Block
        tone={tone}
        icon={icon}
        title={title}
        hint={hint}
        right={
          panel !== kind ? (
            <Btn
              label="Añadir"
              icon="＋"
              small
              variant="soft"
              tone="pink"
              onPress={() => setPanel(kind)}
            />
          ) : null
        }
      >
        {propias.length === 0 ? (
          <Text style={s.vacio}>{vacio}</Text>
        ) : (
          propias.map((l) => (
            <LineaEditable
              key={keyDe(l)}
              icono={k.icono}
              tone={k.tone}
              nombre={l.nombre}
              detalle={k.etiqueta}
              cantidad={l.cantidad}
              unidad={l.unidad}
              formula={formulaLinea(l.cantidad, l.unidad, l.precio)}
              onChange={(v) => cambiarCantidad(keyDe(l), v)}
              onRemove={() => quitar(keyDe(l))}
            />
          ))
        )}
        {panel === kind ? (
          <AddLinePanel
            fuentes={fuentes}
            onAdd={anadir(kind)}
            onClose={() => setPanel(null)}
          />
        ) : null}
      </Block>
    );
  };

  // ── render ─────────────────────────────────────────────────
  if (loading)
    return (
      <View style={[s.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={C.accent} />
      </View>
    );

  const todos = recetas ?? [];
  const conReceta = todos.filter((r) => !!r.receta_id).length;
  const visibles = todos
    .filter(
      (r) =>
        filtro === "todos" || (filtro === "con" ? !!r.receta_id : !r.receta_id),
    )
    .filter((r) => coincide(busqueda, r.helado_nombre));

  const resumen = (
    <View style={s.sticky}>
      <View style={{ flex: 1 }}>
        <Text style={s.stickyLabel}>Costo de producción</Text>
        <Text style={s.stickyValor}>${fmtPeso(total)}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.stickyLabel}>Precio sugerido ({fmtCant(margen)}%)</Text>
        <Text style={s.stickyValor}>
          {precioSug == null ? "—" : `$${fmtPeso(precioSug)}`}
        </Text>
      </View>
    </View>
  );

  const filaCosto = (label, valor) =>
    valor > 0 ? (
      <View style={s.costoFila}>
        <Text style={s.costoLabel}>{label}</Text>
        <Text style={s.costoValor}>${fmtPeso(valor)}</Text>
      </View>
    ) : null;

  return (
    <View style={s.container}>
      <FlatList
        data={visibles}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={[PAGE, { paddingBottom: 40 }]}
        ListHeaderComponent={
          <View>
            <PageHeader
              icon="📝"
              tone="pink"
              title="Recetas"
              subtitle="Toca un helado para definir qué lleva y ver su costo y precio"
            />
            {todos.length > 0 ? (
              <View style={s.pad}>
                {todos.length > 5 ? (
                  <SearchBox
                    value={busqueda}
                    onChangeText={setBusqueda}
                    placeholder="Buscar helado…"
                    style={{ marginTop: 10 }}
                  />
                ) : null}
                <View style={{ marginTop: 10 }}>
                  <Segmented
                    tone="pink"
                    value={filtro}
                    onChange={setFiltro}
                    options={[
                      { value: "todos", label: `Todos (${todos.length})` },
                      { value: "con", label: `Con receta (${conReceta})` },
                      {
                        value: "sin",
                        label: `Sin receta (${todos.length - conReceta})`,
                      },
                    ]}
                  />
                </View>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          todos.length === 0 ? (
            <EmptyState
              icon="🍦"
              titulo="Aún no hay helados"
              texto="Crea los sabores en la pestaña Sabores y vuelve aquí para armar su receta."
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
          const tiene = !!item.receta_id;
          const costo = Number(item.costo_total) > 0;
          const vende = Number(item.precio_venta) > 0;
          return (
            <View style={s.pad}>
              <Pressable
                onPress={() => abrir(item)}
                accessibilityRole="button"
                style={({ hovered }) => [
                  s.card,
                  { borderLeftColor: tiene ? "#00897b" : "#c7c7cf" },
                  hovered && { borderColor: C.accent },
                ]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.cardNombre}>{item.helado_nombre}</Text>
                  <View style={s.tags}>
                    {tiene ? (
                      <>
                        {item.base_nombre ? (
                          <Tag tone="blue" icon="🧊" label={item.base_nombre} />
                        ) : null}
                        {costo ? (
                          <Tag
                            tone="teal"
                            label={`Costo $${fmtPeso(item.costo_total)}`}
                          />
                        ) : (
                          <Tag tone="teal" label="Receta guardada" />
                        )}
                        {vende ? (
                          <Tag
                            tone="pink"
                            label={`Vende $${fmtPeso(item.precio_venta)}`}
                          />
                        ) : null}
                      </>
                    ) : (
                      <Tag tone="gray" label="Sin receta" />
                    )}
                  </View>
                </View>
                <Text style={s.arrow}>{tiene ? "Editar ›" : "Crear ›"}</Text>
              </Pressable>
            </View>
          );
        }}
      />

      <ModalShell
        visible={modal}
        onClose={cerrar}
        size="lg"
        tone="pink"
        icon="📝"
        title={selected?.helado_nombre ?? "Receta"}
        subtitle="Receta del helado"
        sticky={loadingDetalle ? null : resumen}
        footer={
          <FooterBtns
            onCancel={cerrar}
            onSave={guardar}
            saving={saving || loadingDetalle}
            saveLabel="Guardar receta"
          />
        }
      >
        {loadingDetalle ? (
          <ActivityIndicator color={C.accent} style={{ marginVertical: 40 }} />
        ) : (
          <View>
            {/* base */}
            <Block
              tone="blue"
              icon="🧊"
              title="Base"
              hint="Elige la base de este helado (puede ser una base derivada, como la chocolatosa)"
            >
              <ChipPicker
                items={listaBases}
                tone="blue"
                selectedIds={form.base_id ? [form.base_id] : []}
                getLabel={(b) => `${b.nombre} · $${fmtUnit(b.costo_por_ml)}/ml`}
                vacio="Aún no hay bases. Créalas en la pestaña Bases."
                onPick={(b) =>
                  setForm((f) => ({
                    ...f,
                    base_id: f.base_id === b.id ? null : b.id,
                  }))
                }
              />
              {baseSel ? (
                <View style={{ marginTop: 12 }}>
                  <Field
                    label="Cantidad de base (ml)"
                    hint="Cuántos ml de base lleva ESTE helado"
                  >
                    <Input
                      value={form.base_ml}
                      onChangeText={(v) =>
                        setForm((f) => ({ ...f, base_ml: v }))
                      }
                      keyboardType="decimal-pad"
                      placeholder="ej: 120"
                      invalid={
                        form.base_ml !== "" && !(toNum(form.base_ml) > 0)
                      }
                    />
                  </Field>
                  {baseLineas.length > 0 ? (
                    <View style={s.composicion}>
                      <Text style={s.composicionTit}>
                        Lo que aporta esta base a este helado
                      </Text>
                      {baseLineas.map((l) => (
                        <View key={l.key} style={s.baseLinea}>
                          <Text style={s.baseNombre} numberOfLines={1}>
                            {l.nombre}
                          </Text>
                          <Text style={s.baseDetalle}>
                            {fmtCant(Math.round(l.cantidad * 100) / 100)}{" "}
                            {l.unidad} × ${fmtUnit(l.precio)} = $
                            {fmtPeso(l.cantidad * l.precio)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </Block>

            {seccion({
              kind: "principal",
              tone: "green",
              icon: "🍓",
              title: "Ingrediente(s) principal(es)",
              hint: "Fruta, chocolate y demás sabores que definen este helado",
              fuentes: fuentePrincipal,
              vacio: "Opcional. Toca «Añadir» para elegir un ingrediente.",
            })}

            {seccion({
              kind: "topping",
              tone: "amber",
              icon: "✨",
              title: "Toppings (opcional)",
              hint: "Solo salen los ingredientes con categoría Topping",
              fuentes: fuenteTopping,
              vacio: "Sin toppings.",
            })}

            {seccion({
              kind: "prep",
              tone: "purple",
              icon: "🫙",
              title: "Preparaciones caseras",
              hint: "Salsas, mermeladas u otras recetas que se añaden a este helado",
              fuentes: fuentePrep,
              vacio: "Sin preparaciones.",
            })}

            {/* packaging */}
            <Block
              tone="teal"
              icon="📦"
              title="Packaging para este helado"
              hint="Toca para marcar o quitar"
            >
              <ChipPicker
                items={listaPkg}
                tone="teal"
                selectedIds={form.packaging_ids}
                getLabel={(p) => `${p.nombre} · $${fmtPeso(p.precio_unidad)}`}
                vacio="Aún no hay packaging. Créalo en la pestaña Packaging."
                onPick={togglePkg}
              />
            </Block>

            {/* costo y precio */}
            <Block tone="pink" icon="💰" title="Costo y precio de venta">
              {filaCosto("Base", costoBase)}
              {filaCosto("Ingredientes y toppings", costoIngs)}
              {filaCosto("Preparaciones", costoPreps)}
              {filaCosto("Packaging", costoPkg)}
              {filaCosto("Costos fijos", costoFijo)}
              <View style={s.costoTotalFila}>
                <Text style={s.costoTotalLabel}>Costo total</Text>
                <Text style={s.costoTotalValor}>${fmtPeso(total)}</Text>
              </View>

              <View style={{ marginTop: 12 }}>
                <Field
                  label="% de margen deseado"
                  hint="Precio de venta = costo ÷ (1 − margen)"
                  error={margenOk ? undefined : "Debe estar entre 0 y 99"}
                >
                  <Input
                    value={form.margen}
                    onChangeText={(v) => setForm((f) => ({ ...f, margen: v }))}
                    keyboardType="decimal-pad"
                    placeholder="ej: 60"
                    invalid={!margenOk}
                  />
                </Field>
              </View>

              <View style={s.precioBox}>
                <Text style={s.precioLabel}>Precio sugerido de venta</Text>
                <Text style={s.precioValor}>
                  {precioSug == null ? "—" : `$${fmtPeso(precioSug)}`}
                </Text>
              </View>
              {precioActual > 0 ? (
                <Text style={s.actual}>
                  Hoy lo vendes a ${fmtPeso(precioActual)}
                  {margenReal != null && total > 0
                    ? ` · margen real ${fmtCant(Math.round(margenReal * 10) / 10)}%`
                    : ""}
                </Text>
              ) : null}
            </Block>
          </View>
        )}
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
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
    padding: 14,
    marginTop: 10,
  },
  cardNombre: { fontSize: 16, fontWeight: "800", color: C.fg },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  arrow: { fontSize: 13, fontWeight: "700", color: C.accentDark },
  vacio: { fontSize: 13, color: C.fg3, paddingVertical: 8, lineHeight: 19 },
  sticky: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.accentLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8bbd0",
  },
  stickyLabel: { fontSize: 11, color: C.accentDark, fontWeight: "700" },
  stickyValor: { fontSize: 20, color: C.accentDark, fontWeight: "800" },
  composicion: {
    backgroundColor: "#f7f9fc",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  composicionTit: {
    fontSize: 11,
    fontWeight: "700",
    color: C.fg3,
    marginBottom: 4,
  },
  baseLinea: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 3,
  },
  baseNombre: { flex: 1, fontSize: 12, color: C.fg2 },
  baseDetalle: { fontSize: 12, color: C.fg3 },
  costoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  costoLabel: { fontSize: 13, color: C.fg2 },
  costoValor: { fontSize: 13, color: C.fg, fontWeight: "700" },
  costoTotalFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 6,
    paddingTop: 8,
  },
  costoTotalLabel: { fontSize: 14, fontWeight: "800", color: C.fg },
  costoTotalValor: { fontSize: 16, fontWeight: "800", color: C.fg },
  precioBox: {
    backgroundColor: C.accentLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    alignItems: "center",
  },
  precioLabel: { fontSize: 12, fontWeight: "700", color: C.accentDark },
  precioValor: {
    fontSize: 28,
    fontWeight: "800",
    color: C.accentDark,
    marginTop: 2,
  },
  actual: { fontSize: 12, color: C.fg3, marginTop: 8, textAlign: "center" },
});
