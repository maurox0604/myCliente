// screens/DashboardScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import RequireRole from "../components/RequireRole";

let DatePicker;
if (Platform.OS === "web") {
  DatePicker = require("react-datepicker").default;
  require("react-datepicker/dist/react-datepicker.css");
}

const API = process.env.EXPO_PUBLIC_API_URL;

const SEDE_COLORS = { Local: "#4CAF50", Rappi: "#FF5722", Evento: "#2196F3" };
const MOTIVO_COLORS = {
  venta: "#e91e63",
  obsequio: "#9c27b0",
  muestra: "#00bcd4",
  derretido: "#ff9800",
};
const MOTIVO_ICONS = {
  venta: "cash",
  obsequio: "gift",
  muestra: "ice-cream",
  derretido: "water",
};

export default function DashboardScreen() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [modo, setModo] = useState("7dias");

  const formatLabel = (d) => d.toISOString().split("T")[0];

  // ── Reutiliza el mismo portal y CSS que VentasScreen ──
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!document.getElementById("datepicker-portal")) {
      const el = document.createElement("div");
      el.id = "datepicker-portal";
      el.style.cssText =
        "position:fixed;z-index:99999;top:0;left:0;pointer-events:none;";
      document.body.appendChild(el);
    }
    if (!document.getElementById("datepicker-style")) {
      const style = document.createElement("style");
      style.id = "datepicker-style";
      style.innerHTML = `
        #datepicker-portal { pointer-events: none; }
        #datepicker-portal > * { pointer-events: all; }
        .react-datepicker-popper { z-index: 99999 !important; }
        .react-datepicker { z-index: 99999 !important; }
        .react-datepicker__navigation { z-index: 1 !important; }
        .react-datepicker__navigation-icon::before { border-color: #e91e63 !important; }
        .react-datepicker__input-container input {
          width: 100%;
          padding: 7px 10px;
          border: 1.5px solid #e91e63;
          border-radius: 8px;
          font-size: 13px;
          color: #e91e63;
          font-weight: 600;
          background: #fff0f5;
          outline: none;
          cursor: pointer;
          box-sizing: border-box;
        }
        .react-datepicker__input-container input:focus {
          border-color: #c2185b;
          background: #fce4ec;
        }
        @media (max-width: 600px) {
          .react-datepicker { font-size: 11px !important; }
          .react-datepicker__day-name, .react-datepicker__day {
            width: 1.4rem !important; line-height: 1.6rem !important; margin: 1px !important;
          }
          .react-datepicker__month-container { width: 100% !important; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const fetchDashboard = async (start, end) => {
    setLoading(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch(
        `${API}/reportes/dashboard?start=${formatLabel(start)}&end=${formatLabel(end)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("❌ Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(startDate, endDate);
  }, []);

  const aplicar = () => {
    setModo("custom");
    fetchDashboard(startDate, endDate);
  };

  const volver7Dias = () => {
    const s = new Date();
    s.setDate(s.getDate() - 7);
    setStartDate(s);
    setEndDate(new Date());
    setModo("7dias");
    fetchDashboard(s, new Date());
  };

  const renderTotales = () => (
    <View style={styles.row}>
      {[
        {
          icon: "cash-multiple",
          value: `$${data.totalIngresos?.toLocaleString("es-CO") ?? 0}`,
          label: "Ingresos",
          style: styles.cardPink,
        },
        {
          icon: "ice-cream",
          value: data.totalUnidades ?? 0,
          label: "Unidades vendidas",
          style: styles.cardCyan,
        },
        {
          icon: "receipt",
          value: data.totalFacturas ?? 0,
          label: "Facturas",
          style: styles.cardPurple,
        },
      ].map((c) => (
        <View key={c.label} style={[styles.card, c.style]}>
          <MaterialCommunityIcons name={c.icon} size={28} color="#fff" />
          <Text style={styles.cardValue}>{c.value}</Text>
          <Text style={styles.cardLabel}>{c.label}</Text>
        </View>
      ))}
    </View>
  );

  const renderTopProductos = () => {
    if (!data?.topProductos?.length) return null;
    const max = data.topProductos[0]?.cantidad ?? 1;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Top productos</Text>
        {data.topProductos.map((p, i) => (
          <View key={p.sabor} style={styles.barRow}>
            <Text style={styles.barRank}>#{i + 1}</Text>
            <View style={styles.barInfo}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barName} numberOfLines={1}>
                  {p.sabor}
                </Text>
                <Text style={styles.barCount}>{p.cantidad} und</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(p.cantidad / max) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSedes = () => {
    if (!data?.porSede?.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏪 Por sede</Text>
        <View style={styles.row}>
          {data.porSede.map((s) => (
            <View
              key={s.sede}
              style={[
                styles.sedeCard,
                { backgroundColor: SEDE_COLORS[s.sede] ?? "#999" },
              ]}
            >
              <Text style={styles.sedeNombre}>{s.sede}</Text>
              <Text style={styles.sedeValor}>
                ${s.ingresos?.toLocaleString("es-CO")}
              </Text>
              <Text style={styles.sedeUnidades}>{s.unidades} und</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderMotivos = () => {
    if (!data?.porMotivo?.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Por motivo</Text>
        <View style={styles.row}>
          {data.porMotivo.map((m) => (
            <View
              key={m.motivo}
              style={[
                styles.motivoCard,
                { borderColor: MOTIVO_COLORS[m.motivo] ?? "#ccc" },
              ]}
            >
              <MaterialCommunityIcons
                name={MOTIVO_ICONS[m.motivo] ?? "help"}
                size={22}
                color={MOTIVO_COLORS[m.motivo] ?? "#999"}
              />
              <Text
                style={[
                  styles.motivoNombre,
                  { color: MOTIVO_COLORS[m.motivo] },
                ]}
              >
                {m.motivo}
              </Text>
              <Text style={styles.motivoCantidad}>{m.cantidad} und</Text>
              {m.motivo === "venta" && (
                <Text style={styles.motivoIngreso}>
                  ${m.ingresos?.toLocaleString("es-CO")}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <RequireRole allowedRoles={["superadmin"]}>
      <View style={styles.container}>
        {/* Controles de fecha */}
        <View style={styles.controls}>
          <View style={styles.filterBar}>
            <Pressable
              onPress={volver7Dias}
              style={[
                styles.filterBtn,
                modo === "7dias" && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  modo === "7dias" && styles.filterBtnTextActive,
                ]}
              >
                7 días
              </Text>
            </Pressable>
            <Pressable onPress={aplicar} style={styles.filterBtn}>
              <MaterialCommunityIcons name="update" size={18} color="#333" />
            </Pressable>
          </View>

          {Platform.OS === "web" && DatePicker && (
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Desde</Text>
                <DatePicker
                  selected={startDate}
                  onChange={(d) => {
                    setStartDate(d);
                    setModo("custom");
                  }}
                  dateFormat="yyyy-MM-dd"
                  maxDate={endDate}
                  portalId="datepicker-portal"
                  popperPlacement="bottom-start"
                />
              </View>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Hasta</Text>
                <DatePicker
                  selected={endDate}
                  onChange={(d) => {
                    setEndDate(d);
                    setModo("custom");
                  }}
                  dateFormat="yyyy-MM-dd"
                  minDate={startDate}
                  maxDate={new Date()}
                  portalId="datepicker-portal"
                  popperPlacement="bottom-start"
                />
              </View>
              <Pressable onPress={aplicar} style={styles.buscarBtn}>
                <MaterialCommunityIcons name="magnify" size={18} color="#fff" />
                <Text style={styles.buscarBtnText}>Buscar</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.rangeText}>
            {formatLabel(startDate)} → {formatLabel(endDate)}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#e91e63" />
            <Text style={styles.loadingText}>Cargando métricas...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {data ? (
              <>
                {renderTotales()}
                {renderTopProductos()}
                {renderSedes()}
                {renderMotivos()}
              </>
            ) : (
              <Text style={styles.emptyText}>Sin datos para este período</Text>
            )}
          </ScrollView>
        )}
      </View>
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  controls: { marginBottom: 8 },

  filterBar: { flexDirection: "row", gap: 8, marginBottom: 8 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  filterBtnActive: { backgroundColor: "#e91e63" },
  filterBtnText: { fontSize: 12, fontWeight: "600", color: "#333" },
  filterBtnTextActive: { color: "#fff" },

  dateRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "flex-end",
  },
  dateItem: { flex: 1 },
  dateLabel: { fontSize: 11, color: "#888", marginBottom: 2 },
  buscarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e91e63",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buscarBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  rangeText: { fontSize: 12, color: "#888", marginBottom: 4 },

  scroll: { flex: 1 },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "#888", fontSize: 14 },
  emptyText: { textAlign: "center", color: "#aaa", marginTop: 40 },

  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  card: {
    flex: 1,
    minWidth: 90,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  cardPink: { backgroundColor: "#e91e63" },
  cardCyan: { backgroundColor: "#00bcd4" },
  cardPurple: { backgroundColor: "#9c27b0" },
  cardValue: { fontSize: 20, fontWeight: "800", color: "#fff" },
  cardLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },

  section: {
    backgroundColor: "#fafafa",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111",
  },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  barRank: { fontSize: 13, fontWeight: "700", color: "#e91e63", width: 24 },
  barInfo: { flex: 1 },
  barLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  barName: { fontSize: 13, fontWeight: "600", color: "#222", flex: 1 },
  barCount: { fontSize: 12, color: "#888" },
  barBg: { height: 8, backgroundColor: "#f0f0f0", borderRadius: 4 },
  barFill: { height: 8, backgroundColor: "#e91e63", borderRadius: 4 },

  sedeCard: {
    flex: 1,
    minWidth: 80,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 2,
  },
  sedeNombre: { color: "#fff", fontSize: 12, fontWeight: "700" },
  sedeValor: { color: "#fff", fontSize: 16, fontWeight: "800" },
  sedeUnidades: { color: "rgba(255,255,255,0.8)", fontSize: 11 },

  motivoCard: {
    flex: 1,
    minWidth: 80,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    alignItems: "center",
    gap: 3,
    backgroundColor: "#fff",
  },
  motivoNombre: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  motivoCantidad: { fontSize: 15, fontWeight: "800", color: "#111" },
  motivoIngreso: { fontSize: 11, color: "#888" },
});
