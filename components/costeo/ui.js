// components/costeo/ui.js
// Piezas compartidas del módulo de costeo: colores, formato, avisos que SÍ se
// ven en web (Alert.alert no muestra nada en React Native Web), modal con X,
// bloques de color, líneas editables y el buscador de nombres parecidos.
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

// ═══════════════════════════════════════════════════════════════
// COLORES (tomados del mockup: rosa de marca + un color por tema)
// ═══════════════════════════════════════════════════════════════
export const C = {
  bg: "#f5f5f7",
  surface: "#ffffff",
  surface2: "#f0f0f2",
  border: "#e2e2e6",
  fg: "#111118",
  fg2: "#555562",
  fg3: "#9090a0",
  accent: "#e91e63",
  accentLight: "#fce4ec",
  accentDark: "#c2185b",
};

// solid = color fuerte · bg = fondo suave · fg = texto sobre el fondo suave
export const TONOS = {
  pink: {
    solid: "#e91e63",
    dark: "#c2185b",
    bg: "#fce4ec",
    fg: "#c2185b",
    bd: "#f8bbd0",
  },
  blue: {
    solid: "#1976d2",
    dark: "#1565c0",
    bg: "#e3f2fd",
    fg: "#1565c0",
    bd: "#bbdefb",
  },
  green: {
    solid: "#2e9e4f",
    dark: "#2e7d32",
    bg: "#e8f5e9",
    fg: "#2e7d32",
    bd: "#c8e6c9",
  },
  amber: {
    solid: "#f57c00",
    dark: "#e65100",
    bg: "#fff8e1",
    fg: "#e65100",
    bd: "#ffe0b2",
  },
  purple: {
    solid: "#7c3aed",
    dark: "#6d28d9",
    bg: "#ede9fe",
    fg: "#6d28d9",
    bd: "#ddd6fe",
  },
  teal: {
    solid: "#00897b",
    dark: "#00796b",
    bg: "#e0f2f1",
    fg: "#00796b",
    bd: "#b2dfdb",
  },
  gray: {
    solid: "#6b7280",
    dark: "#4b5563",
    bg: "#f0f0f2",
    fg: "#555562",
    bd: "#e2e2e6",
  },
  red: {
    solid: "#d32f2f",
    dark: "#b71c1c",
    bg: "#ffebee",
    fg: "#c62828",
    bd: "#ffcdd2",
  },
};
const tono = (t) => TONOS[t] ?? TONOS.gray;

// Categorías de ingrediente (ingredientes.categoria)
export const CATEGORIAS = [
  { key: "base", label: "Base", tone: "blue", icon: "🥛" },
  { key: "fruta", label: "Fruta", tone: "green", icon: "🍓" },
  { key: "topping", label: "Topping", tone: "amber", icon: "✨" },
  { key: "otro", label: "Otro", tone: "gray", icon: "📦" },
];
export const catInfo = (k) =>
  CATEGORIAS.find((c) => c.key === k) ?? CATEGORIAS[CATEGORIAS.length - 1];

// ═══════════════════════════════════════════════════════════════
// FORMATO
// ═══════════════════════════════════════════════════════════════
// dinero sin decimales: 1500 → "1.500"
export const fmtPeso = (n) => {
  const v = Math.round(Number(n ?? 0));
  return isNaN(v) ? "0" : v.toLocaleString("es-CO");
};
// cantidades: 90.0000 → "90" · 1.5 → "1,5"
export const fmtCant = (n) => {
  const v = Number(n ?? 0);
  if (isNaN(v)) return "0";
  return v % 1 === 0
    ? String(v)
    : parseFloat(v.toFixed(4)).toLocaleString("es-CO", {
        maximumFractionDigits: 4,
        useGrouping: false,
      });
};
// Para rellenar un campo de texto editable: 90.0000 → "90" · 1.5 → "1.5" (sin separadores)
export const aTexto = (n) => {
  const v = Number(n ?? 0);
  return isNaN(v) ? "" : String(parseFloat(v.toFixed(4)));
};
// precio por unidad: 37 → "37" · 4.2 → "4,2" · 4.896 → "4,9" · 1250 → "1.250"
export const fmtUnit = (n) => {
  const v = Number(n ?? 0);
  if (isNaN(v)) return "0";
  return v >= 100
    ? fmtPeso(v)
    : v.toLocaleString("es-CO", { maximumFractionDigits: 2 });
};
// acepta "0,5" y "0.5"
export const toNum = (v) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
// "12 gr × $38/gr = $456"
export const formulaLinea = (cantidad, unidad, precio) => {
  const q = toNum(cantidad);
  const sub = q * Number(precio ?? 0);
  if (!(q > 0)) return "";
  return `${fmtCant(q)} ${unidad} × $${fmtUnit(precio)}/${unidad} = $${fmtPeso(sub)}`;
};

// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA TOLERANTE ("clim" encuentra "Klim", "azucar" a "Azúcar")
// ═══════════════════════════════════════════════════════════════
const sinTildes = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// Clave fonética simple para español: ignora mayúsculas, tildes, c/k/q,
// s/z/c suave, v/b, h muda, letras dobles y plural.
export const clave = (s) => {
  const t = sinTildes(s)
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/ph/g, "f")
    .replace(/qu/g, "k")
    .replace(/c(?=[ei])/g, "s")
    .replace(/c/g, "k")
    .replace(/z/g, "s")
    .replace(/v/g, "b")
    .replace(/w/g, "u")
    .replace(/h/g, "")
    .replace(/ll/g, "y")
    .replace(/([a-z])\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return t
    .split(" ")
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w))
    .join(" ");
};

const lev = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
};

// ¿`nombre` coincide con lo que se está escribiendo en un filtro?
export const coincide = (texto, nombre) => {
  const q = clave(texto);
  if (!q) return true;
  const k = clave(nombre);
  if (k.includes(q)) return true;
  const kw = k.split(" ");
  return q.split(" ").every((t) => kw.some((w) => w.startsWith(t)));
};

// Nombres existentes que se parecen a `texto`: [{ item, nivel: 'igual'|'parecido' }]
export const buscarSimilares = (
  texto,
  lista,
  getNombre = (x) => x.nombre,
  excluirId = null,
) => {
  const q = clave(texto);
  if (q.replace(/ /g, "").length < 3) return [];
  const qT = q.split(" ");
  const out = [];
  for (const item of lista ?? []) {
    if (excluirId != null && item.id === excluirId) continue;
    const k = clave(getNombre(item));
    if (!k) continue;
    let nivel = null;
    if (k === q) nivel = "igual";
    else {
      const kT = k.split(" ");
      const contiene =
        Math.min(k.length, q.length) >= 3 && (k.includes(q) || q.includes(k));
      const tokens = qT.every((t) =>
        kT.some(
          (w) => w === t || (t.length >= 4 && w.length >= 4 && lev(t, w) <= 1),
        ),
      );
      const largo = Math.max(q.length, k.length);
      const cerca = largo >= 5 && lev(q, k) <= (largo >= 9 ? 2 : 1);
      if (contiene || tokens || cerca) nivel = "parecido";
    }
    if (nivel) out.push({ item, nivel });
  }
  out.sort(
    (a, b) => (a.nivel === "igual" ? 0 : 1) - (b.nivel === "igual" ? 0 : 1),
  );
  return out.slice(0, 4);
};

// ═══════════════════════════════════════════════════════════════
// AVISOS, CONFIRMACIONES Y TOASTS (reemplazan a Alert.alert)
//   avisar("Falta el nombre", "Escribe el nombre del ingrediente")
//   if (await confirmar("Eliminar", "¿Eliminar X?", { destructive: true })) ...
//   toast("Ingrediente guardado")
// Se dibujan en la capa más alta: dentro del modal abierto, o en la pantalla.
// ═══════════════════════════════════════════════════════════════
const store = { dialog: null, toast: null, layers: [] };
const subs = new Set();
const bump = () => subs.forEach((f) => f());
let nextLayerId = 1;
let toastTimer = null;

const useStore = () => {
  const [, setV] = useState(0);
  useEffect(() => {
    const f = () => setV((v) => v + 1);
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  }, []);
};

const cerrarDialogo = (valor) => {
  const d = store.dialog;
  store.dialog = null;
  bump();
  if (d) d.resolve(valor);
};

export const avisar = (titulo, mensaje = "", t = "red") =>
  new Promise((resolve) => {
    if (store.dialog) store.dialog.resolve(false);
    store.dialog = { tipo: "aviso", titulo, mensaje, tono: t, resolve };
    bump();
  });

export const confirmar = (
  titulo,
  mensaje = "",
  {
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    destructive = false,
  } = {},
) =>
  new Promise((resolve) => {
    if (store.dialog) store.dialog.resolve(false);
    store.dialog = {
      tipo: "confirmar",
      titulo,
      mensaje,
      confirmText,
      cancelText,
      destructive,
      resolve,
    };
    bump();
  });

export const toast = (mensaje, t = "green") => {
  store.toast = { mensaje, tono: t, id: Date.now() };
  bump();
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    store.toast = null;
    bump();
  }, 2400);
};

export function DialogLayer() {
  const idRef = useRef(null);
  if (idRef.current === null) idRef.current = nextLayerId++;
  useStore();
  useEffect(() => {
    store.layers.push(idRef.current);
    bump();
    return () => {
      store.layers = store.layers.filter((x) => x !== idRef.current);
      bump();
    };
  }, []);

  const d = store.dialog;
  const esTop = store.layers[store.layers.length - 1] === idRef.current;

  // Escape cierra el aviso (solo web)
  useEffect(() => {
    if (Platform.OS !== "web" || !esTop || !d) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") cerrarDialogo(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [esTop, d]);

  if (!esTop || (!d && !store.toast)) return null;
  const tt = store.toast;
  const dt = d
    ? tono(d.tipo === "confirmar" ? (d.destructive ? "red" : "pink") : d.tono)
    : null;

  return (
    <View pointerEvents="box-none" style={st.layer}>
      {tt ? (
        <View pointerEvents="none" style={st.toastWrap}>
          <View style={[st.toast, { backgroundColor: tono(tt.tono).dark }]}>
            <Text style={st.toastTxt}>
              {tt.tono === "red" ? "⚠️ " : "✓ "}
              {tt.mensaje}
            </Text>
          </View>
        </View>
      ) : null}
      {d ? (
        <View style={st.dlgOverlay}>
          <View style={st.dlgCard} accessibilityRole="alert">
            <View style={[st.dlgIcon, { backgroundColor: dt.bg }]}>
              <Text style={{ fontSize: 22 }}>
                {d.tipo === "confirmar"
                  ? d.destructive
                    ? "🗑️"
                    : "❓"
                  : d.tono === "green"
                    ? "✅"
                    : "⚠️"}
              </Text>
            </View>
            <Text style={st.dlgTitulo}>{d.titulo}</Text>
            {d.mensaje ? <Text style={st.dlgMsg}>{d.mensaje}</Text> : null}
            <View style={st.dlgBtns}>
              {d.tipo === "confirmar" ? (
                <>
                  <Btn
                    label={d.cancelText}
                    variant="ghost"
                    full
                    onPress={() => cerrarDialogo(false)}
                  />
                  <Btn
                    label={d.confirmText}
                    tone={d.destructive ? "red" : "pink"}
                    full
                    onPress={() => cerrarDialogo(true)}
                  />
                </>
              ) : (
                <Btn
                  label="Entendido"
                  tone="pink"
                  full
                  onPress={() => cerrarDialogo(true)}
                />
              )}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOTONES, ETIQUETAS, CAMPOS
// ═══════════════════════════════════════════════════════════════
export function Btn({
  label,
  onPress,
  tone = "pink",
  variant = "solid",
  icon,
  disabled,
  loading,
  small,
  full,
  style,
}) {
  const t = tono(tone);
  const solid = variant === "solid";
  const soft = variant === "soft";
  const bg = solid ? t.solid : soft ? t.bg : C.surface2;
  const fg = solid ? "#fff" : soft ? t.fg : C.fg2;
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed, hovered }) => [
        st.btn,
        small && st.btnSm,
        full && { flex: 1 },
        {
          backgroundColor: hovered && !disabled && solid ? t.dark : bg,
          borderColor: solid ? t.solid : soft ? t.bd : C.border,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : icon ? (
        <Text style={{ color: fg, fontSize: small ? 13 : 15 }}>{icon}</Text>
      ) : null}
      <Text style={[st.btnTxt, small && st.btnTxtSm, { color: fg }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function IconBtn({ icon, label, onPress, tone, small }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed, hovered }) => [
        st.iconBtn,
        small && st.iconBtnSm,
        (hovered || pressed) && {
          backgroundColor: tone === "red" ? TONOS.red.bg : C.surface2,
        },
      ]}
    >
      <Text
        style={[
          st.iconBtnTxt,
          small && { fontSize: 12 },
          tone === "red" && { color: TONOS.red.fg },
        ]}
      >
        {icon}
      </Text>
    </Pressable>
  );
}

export function Tag({ label, tone = "gray", icon }) {
  const t = tono(tone);
  return (
    <View style={[st.tag, { backgroundColor: t.bg }]}>
      <Text style={[st.tagTxt, { color: t.fg }]}>
        {icon ? `${icon} ` : ""}
        {label}
      </Text>
    </View>
  );
}

export function Field({ label, hint, error, children, style }) {
  return (
    <View style={[{ marginTop: 14 }, style]}>
      {label ? <Text style={st.label}>{label}</Text> : null}
      {children}
      {error ? (
        <Text style={st.fieldError}>{error}</Text>
      ) : hint ? (
        <Text style={st.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function Input({ invalid, style, onFocus, onBlur, ...p }) {
  const [f, setF] = useState(false);
  return (
    <TextInput
      placeholderTextColor={C.fg3}
      {...p}
      onFocus={(e) => {
        setF(true);
        onFocus && onFocus(e);
      }}
      onBlur={(e) => {
        setF(false);
        onBlur && onBlur(e);
      }}
      style={[st.input, f && st.inputFocus, invalid && st.inputInvalid, style]}
    />
  );
}

export function SearchBox({
  value,
  onChangeText,
  placeholder = "Buscar…",
  style,
}) {
  return (
    <View style={[st.search, style]}>
      <Text style={st.searchIcon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.fg3}
        style={st.searchInput}
        accessibilityLabel={placeholder}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityLabel="Borrar búsqueda"
        >
          <Text style={st.searchClear}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Segmented({ options, value, onChange, tone = "pink" }) {
  const t = tono(tone);
  return (
    <View style={st.seg}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={[
              st.segItem,
              on && { backgroundColor: t.bg, borderColor: t.solid },
            ]}
          >
            <Text style={[st.segTxt, on && { color: t.fg, fontWeight: "700" }]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTRUCTURA: encabezado de página, bloques de color, estado vacío
// ═══════════════════════════════════════════════════════════════
export const PAGE = { width: "100%", maxWidth: 960, alignSelf: "center" };

export function PageHeader({ icon, title, subtitle, right, tone = "pink" }) {
  const t = tono(tone);
  return (
    <View style={[PAGE, st.pageHead]}>
      <View style={[st.pageIcon, { backgroundColor: t.bg }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 160 }}>
        <Text style={st.pageTitle}>{title}</Text>
        {subtitle ? <Text style={st.pageSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Block({
  tone = "gray",
  icon,
  title,
  hint,
  right,
  children,
  style,
}) {
  const t = tono(tone);
  return (
    <View style={[st.block, { borderLeftColor: t.solid }, style]}>
      <View style={st.blockHead}>
        {icon ? (
          <View style={[st.blockIcon, { backgroundColor: t.bg }]}>
            <Text style={{ fontSize: 16 }}>{icon}</Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={st.blockTitle}>{title}</Text>
          {hint ? <Text style={st.blockHint}>{hint}</Text> : null}
        </View>
        {right}
      </View>
      {children ? <View style={st.blockBody}>{children}</View> : null}
    </View>
  );
}

export function EmptyState({
  icon = "🍦",
  titulo,
  texto,
  accion,
  onAccion,
  tone = "pink",
}) {
  return (
    <View style={st.empty}>
      <Text style={{ fontSize: 34 }}>{icon}</Text>
      <Text style={st.emptyTitulo}>{titulo}</Text>
      {texto ? <Text style={st.emptyTxt}>{texto}</Text> : null}
      {accion ? (
        <Btn
          label={accion}
          onPress={onAccion}
          tone={tone}
          style={{ marginTop: 12 }}
        />
      ) : null}
    </View>
  );
}

// Aviso de nombres parecidos mientras se escribe (evita duplicados tipo
// "leche klim" / "leche clim"). onEditar(item) permite saltar a editar el existente.
export function DuplicateWarning({
  texto,
  lista,
  getSub,
  onEditar,
  excluirId = null,
  getNombre = (x) => x.nombre,
  etiqueta = "ingrediente",
}) {
  const res = buscarSimilares(texto, lista, getNombre, excluirId);
  if (!res.length) return null;
  const hayIgual = res.some((r) => r.nivel === "igual");
  const t = tono(hayIgual ? "red" : "amber");
  return (
    <View style={[st.dup, { backgroundColor: t.bg, borderColor: t.bd }]}>
      <Text style={[st.dupTitulo, { color: t.fg }]}>
        {hayIgual
          ? `Ya existe un ${etiqueta} con ese nombre`
          : `Ya hay ${res.length === 1 ? "un " + etiqueta + " parecido" : etiqueta + "s parecidos"}`}
      </Text>
      {res.map(({ item, nivel }) => (
        <View key={item.id} style={st.dupRow}>
          <View style={{ flex: 1 }}>
            <Text style={st.dupNombre}>{getNombre(item)}</Text>
            {getSub ? <Text style={st.dupSub}>{getSub(item)}</Text> : null}
          </View>
          {nivel === "igual" ? <Tag label="Mismo nombre" tone="red" /> : null}
          {onEditar ? (
            <Btn
              label="Editar ese"
              small
              variant="soft"
              tone={hayIgual ? "red" : "amber"}
              onPress={() => onEditar(item)}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// LISTAS DE SELECCIÓN
// ═══════════════════════════════════════════════════════════════
// Chips en varias filas, con buscador cuando hay muchos.
export function ChipPicker({
  items,
  onPick,
  getLabel = (x) => x.nombre,
  selectedIds = [],
  tone = "blue",
  vacio = "No hay más opciones",
  buscar,
}) {
  const [q, setQ] = useState("");
  const t = tono(tone);
  const filtrados = (items ?? []).filter((it) => coincide(q, getLabel(it)));
  const verBuscador = buscar ?? (items ?? []).length > 7;
  const MAX = 36;
  return (
    <View>
      {verBuscador ? (
        <SearchBox
          value={q}
          onChangeText={setQ}
          placeholder="Buscar…"
          style={{ marginBottom: 8 }}
        />
      ) : null}
      <View style={st.chips}>
        {filtrados.slice(0, MAX).map((it) => {
          const on = selectedIds.includes(it.id);
          return (
            <Pressable
              key={it.id}
              onPress={() => onPick(it)}
              accessibilityRole="button"
              style={({ hovered }) => [
                st.chip,
                on && { backgroundColor: t.solid, borderColor: t.solid },
                !on &&
                  hovered && { borderColor: t.solid, backgroundColor: t.bg },
              ]}
            >
              <Text
                style={[st.chipTxt, on && { color: "#fff", fontWeight: "700" }]}
              >
                {getLabel(it)}
              </Text>
            </Pressable>
          );
        })}
        {filtrados.length === 0 ? (
          <Text style={st.chipVacio}>
            {q ? "Nada coincide con lo que escribiste" : vacio}
          </Text>
        ) : null}
        {filtrados.length > MAX ? (
          <Text style={st.chipVacio}>
            …y {filtrados.length - MAX} más: escribe para filtrar
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// Panel para añadir una línea (ingrediente / preparación / base) con buscador.
// fuentes: [{ key, label, tone, items: [{ id, nombre, unidad, sub }] }]
// onAdd({ fuente, id, cantidad })  — cantidad ya como número
export function AddLinePanel({ fuentes, onAdd, onClose, tone = "pink" }) {
  const [key, setKey] = useState(fuentes[0]?.key);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [cant, setCant] = useState("");
  const fuente = fuentes.find((f) => f.key === key) ?? fuentes[0];
  const t = tono(fuente?.tone ?? tone);
  const items = (fuente?.items ?? []).filter((it) => coincide(q, it.nombre));
  const elegido = (fuente?.items ?? []).find((it) => it.id === sel);

  const agregar = () => {
    if (!elegido)
      return avisar(
        "Elige qué añadir",
        `Toca un elemento de la lista de ${fuente.label.toLowerCase()}.`,
      );
    if (!(toNum(cant) > 0))
      return avisar(
        "Falta la cantidad",
        `Escribe cuánto lleva (en ${elegido.unidad}).`,
      );
    onAdd({ fuente: fuente.key, id: elegido.id, cantidad: toNum(cant) });
    setSel(null);
    setCant("");
    setQ("");
  };

  return (
    <View style={[st.addPanel, { borderColor: t.bd, backgroundColor: t.bg }]}>
      {fuentes.length > 1 ? (
        <Segmented
          tone={fuente.tone ?? tone}
          value={key}
          onChange={(k) => {
            setKey(k);
            setSel(null);
            setQ("");
          }}
          options={fuentes.map((f) => ({ value: f.key, label: f.label }))}
        />
      ) : (
        <Text style={st.addTitulo}>{fuente.label}</Text>
      )}
      <SearchBox
        value={q}
        onChangeText={setQ}
        placeholder={`Buscar ${fuente.plural ?? "…"}`}
        style={{ marginTop: 10 }}
      />
      <ScrollView
        style={st.addList}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        {items.map((it) => {
          const on = it.id === sel;
          return (
            <Pressable
              key={it.id}
              onPress={() => setSel(it.id)}
              style={({ hovered }) => [
                st.addItem,
                on && { backgroundColor: t.solid },
                !on && hovered && { backgroundColor: C.surface2 },
              ]}
            >
              <Text
                style={[st.addItemNombre, on && { color: "#fff" }]}
                numberOfLines={1}
              >
                {it.nombre}
              </Text>
              {it.sub ? (
                <Text style={[st.addItemSub, on && { color: "#fff" }]}>
                  {it.sub}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
        {items.length === 0 ? (
          <Text style={[st.chipVacio, { paddingHorizontal: 12 }]}>
            {q
              ? "Nada coincide con lo que escribiste"
              : (fuente.vacio ?? "No hay más para añadir")}
          </Text>
        ) : null}
      </ScrollView>
      {fuente.nota ? <Text style={st.addNota}>{fuente.nota}</Text> : null}
      <View style={st.addRow}>
        <View style={{ flex: 1 }}>
          <Text style={st.label}>
            {elegido
              ? `Cantidad de ${elegido.nombre} (${elegido.unidad})`
              : "Cantidad"}
          </Text>
          <Input
            value={cant}
            onChangeText={setCant}
            keyboardType="decimal-pad"
            placeholder={
              elegido ? `en ${elegido.unidad}` : "elige primero qué añadir"
            }
            onSubmitEditing={agregar}
          />
        </View>
      </View>
      <View style={st.addBtns}>
        <Btn label="Listo" variant="ghost" onPress={onClose} />
        <Btn
          label="Añadir"
          tone={fuente.tone ?? tone}
          icon="＋"
          onPress={agregar}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

// Línea de una receta/base/preparación con la cantidad EDITABLE en el sitio.
export function LineaEditable({
  icono,
  nombre,
  detalle,
  cantidad,
  unidad,
  onChange,
  onRemove,
  formula,
  tone = "gray",
}) {
  const t = tono(tone);
  const vacio = String(cantidad ?? "") === "";
  const invalida = !vacio && !(toNum(cantidad) > 0);
  return (
    <View style={[st.linea, { borderLeftColor: t.solid }]}>
      <View style={st.lineaTop}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={st.lineaNombre} numberOfLines={2}>
            {icono ? `${icono} ` : ""}
            {nombre}
          </Text>
          {detalle ? <Text style={st.lineaDetalle}>{detalle}</Text> : null}
        </View>
        <Input
          value={String(cantidad ?? "")}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0"
          invalid={invalida || vacio}
          selectTextOnFocus
          accessibilityLabel={`Cantidad de ${nombre}`}
          style={st.lineaInput}
        />
        <Text style={st.lineaUnidad}>{unidad}</Text>
        <IconBtn
          icon="✕"
          label={`Quitar ${nombre}`}
          tone="red"
          small
          onPress={onRemove}
        />
      </View>
      {formula ? (
        <Text style={[st.lineaFormula, { color: t.fg }]}>{formula}</Text>
      ) : null}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODAL: título + X arriba a la derecha, cuerpo con scroll y pie fijo
// ═══════════════════════════════════════════════════════════════
export function FooterBtns({
  onCancel,
  onSave,
  saving,
  saveLabel = "Guardar",
  cancelLabel = "Cancelar",
  tone = "pink",
}) {
  return (
    <View style={st.footerRow}>
      <Btn label={cancelLabel} variant="ghost" full onPress={onCancel} />
      <Btn
        label={saving ? "Guardando…" : saveLabel}
        tone={tone}
        full
        loading={saving}
        disabled={saving}
        onPress={onSave}
      />
    </View>
  );
}

export function ModalShell({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  tone = "pink",
  size = "md",
  sticky,
  footer,
  children,
}) {
  const { width, height } = useWindowDimensions();
  const compact = width < 640;
  const maxW = size === "lg" ? 780 : size === "sm" ? 420 : 580;
  const t = tono(tone);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          st.overlay,
          compact && { justifyContent: "flex-end", padding: 0 },
        ]}
      >
        <View
          style={[
            st.card,
            {
              maxWidth: maxW,
              maxHeight: Math.round(height * (compact ? 0.95 : 0.9)),
            },
            compact && st.cardCompact,
          ]}
        >
          <View style={[st.mHead, { borderBottomColor: C.border }]}>
            {icon ? (
              <View style={[st.mIcon, { backgroundColor: t.bg }]}>
                <Text style={{ fontSize: 18 }}>{icon}</Text>
              </View>
            ) : null}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={st.mTitle} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={st.mSub} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={({ hovered, pressed }) => [
                st.mClose,
                (hovered || pressed) && { backgroundColor: C.border },
              ]}
            >
              <Text style={st.mCloseTxt}>✕</Text>
            </Pressable>
          </View>
          {sticky}
          <ScrollView
            style={st.mBody}
            contentContainerStyle={st.mBodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {footer ? <View style={st.mFooter}>{footer}</View> : null}
        </View>
        <DialogLayer />
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════
const st = StyleSheet.create({
  // capa de avisos
  layer: { ...StyleSheet.absoluteFillObject, zIndex: 1000, elevation: 1000 },
  toastWrap: {
    position: "absolute",
    top: 14,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    maxWidth: "92%",
  },
  toastTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
  dlgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,17,24,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dlgCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  dlgIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  dlgTitulo: {
    fontSize: 17,
    fontWeight: "800",
    color: C.fg,
    textAlign: "center",
  },
  dlgMsg: {
    fontSize: 14,
    color: C.fg2,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  dlgBtns: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    alignSelf: "stretch",
  },

  // botones
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnSm: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnTxt: { fontSize: 14, fontWeight: "700" },
  btnTxtSm: { fontSize: 12 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnSm: { width: 28, height: 28, borderRadius: 14 },
  iconBtnTxt: { fontSize: 15, color: C.fg3 },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  tagTxt: { fontSize: 11, fontWeight: "700" },

  label: { fontSize: 12, fontWeight: "700", color: C.fg2, marginBottom: 5 },
  hint: { fontSize: 11, color: C.fg3, marginTop: 5 },
  fieldError: {
    fontSize: 11,
    color: TONOS.red.fg,
    marginTop: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: C.fg,
    backgroundColor: C.surface,
    ...Platform.select({ web: { outlineStyle: "none" }, default: {} }),
  },
  inputFocus: { borderColor: C.accent, backgroundColor: "#fffafc" },
  inputInvalid: { borderColor: TONOS.red.solid, backgroundColor: "#fff8f8" },

  search: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: { fontSize: 13, marginRight: 6 },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 14,
    color: C.fg,
    ...Platform.select({ web: { outlineStyle: "none" }, default: {} }),
  },
  searchClear: { fontSize: 13, color: C.fg3, paddingLeft: 8 },

  seg: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  segItem: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: "center",
  },
  segTxt: { fontSize: 13, color: C.fg2, fontWeight: "600" },

  // estructura
  pageHead: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  pageIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: { fontSize: 22, fontWeight: "800", color: C.fg },
  pageSub: { fontSize: 13, color: C.fg3, marginTop: 2 },

  block: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
    marginTop: 14,
    overflow: "hidden",
  },
  blockHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  blockIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  blockTitle: { fontSize: 15, fontWeight: "800", color: C.fg },
  blockHint: { fontSize: 11, color: C.fg3, marginTop: 1 },
  blockBody: { paddingHorizontal: 14, paddingTop: 6, paddingBottom: 14 },

  empty: { alignItems: "center", paddingVertical: 36, paddingHorizontal: 24 },
  emptyTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: C.fg,
    marginTop: 8,
    textAlign: "center",
  },
  emptyTxt: {
    fontSize: 13,
    color: C.fg3,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 360,
  },

  dup: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
  dupTitulo: { fontSize: 13, fontWeight: "800", marginBottom: 6 },
  dupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  dupNombre: { fontSize: 13, fontWeight: "700", color: C.fg },
  dupSub: { fontSize: 11, color: C.fg2, marginTop: 1 },

  // selección
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  chipTxt: { fontSize: 13, color: C.fg2, fontWeight: "600" },
  chipVacio: { fontSize: 12, color: C.fg3, paddingVertical: 6 },

  addPanel: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
  addTitulo: { fontSize: 13, fontWeight: "800", color: C.fg },
  addList: {
    maxHeight: 190,
    marginTop: 8,
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  addItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  addItemNombre: { flex: 1, fontSize: 13, fontWeight: "600", color: C.fg },
  addItemSub: { fontSize: 11, color: C.fg3 },
  addNota: { fontSize: 11, color: C.fg2, marginTop: 8, lineHeight: 16 },
  addRow: { flexDirection: "row", marginTop: 4 },
  addBtns: { flexDirection: "row", gap: 8, marginTop: 12 },

  linea: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  lineaTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  lineaNombre: { fontSize: 14, fontWeight: "700", color: C.fg },
  lineaDetalle: { fontSize: 11, color: C.fg3, marginTop: 1 },
  lineaInput: {
    width: 84,
    textAlign: "right",
    paddingVertical: 7,
    fontVariant: ["tabular-nums"],
  },
  lineaUnidad: { fontSize: 12, color: C.fg3, width: 34 },
  lineaFormula: { fontSize: 12, marginTop: 4, fontVariant: ["tabular-nums"] },

  // modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17,17,24,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    backgroundColor: C.surface,
    borderRadius: 18,
    overflow: "hidden",
  },
  cardCompact: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxWidth: "100%",
  },
  mHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  mIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mTitle: { fontSize: 17, fontWeight: "800", color: C.fg },
  mSub: { fontSize: 12, color: C.fg3, marginTop: 1 },
  mClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  mCloseTxt: { fontSize: 15, color: C.fg2, fontWeight: "700" },
  mBody: { flexShrink: 1, minHeight: 0 },
  mBodyContent: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 18 },
  mFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  footerRow: { flexDirection: "row", gap: 10 },
});
