import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useReportes } from "../context/ReportesContext";
import { BarChart } from "react-native-chart-kit";
import { MaterialCommunityIcons } from "@expo/vector-icons";

let DatePicker;
if (Platform.OS === "web") {
  DatePicker = require("react-datepicker").default;
  require("react-datepicker/dist/react-datepicker.css");
}

const fmt = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function ReportesScreen() {
  const { topSabores, loadTopSabores } = useReportes();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [modoActivo, setModoActivo] = useState("7dias");

  // ── Portal datepicker (mismo que VentasScreen y Dashboard) ──
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
        .react-datepicker__navigation-icon::before { border-color: #140663 !important; }
        .react-datepicker__input-container input {
          width: 100%;
          padding: 7px 10px;
          border: 1.5px solid #140663;
          border-radius: 8px;
          font-size: 13px;
          color: #140663;
          font-weight: 600;
          background: #f0f0fa;
          outline: none;
          cursor: pointer;
          box-sizing: border-box;
        }
        .react-datepicker__input-container input:focus {
          border-color: #09aef5;
          background: #e8f4fd;
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

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    loadTopSabores(fmt(start), fmt(end));
  }, []);

  // ── Filtros rápidos ──
  const aplicarRango = (start, end, modo) => {
    setStartDate(start);
    setEndDate(end);
    setModoActivo(modo);
    loadTopSabores(fmt(start), fmt(end));
  };

  const onHoy = () => {
    const d = new Date();
    aplicarRango(d, d, "hoy");
  };
  const onAyer = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    aplicarRango(d, d, "ayer");
  };
  const on7Dias = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    aplicarRango(start, end, "7dias");
  };
  const onMes = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    aplicarRango(start, end, "mes");
  };
  const aplicarCustom = () => {
    setModoActivo("custom");
    loadTopSabores(fmt(startDate), fmt(endDate));
  };

  const maxCantidad =
    topSabores.length > 0
      ? Math.max(
          ...topSabores.map((item) =>
            Number(item.total_vendido || item.total || 0),
          ),
        )
      : 1;

  const FILTROS = [
    { label: "Hoy", onPress: onHoy, modo: "hoy" },
    { label: "Ayer", onPress: onAyer, modo: "ayer" },
    { label: "7 días", onPress: on7Dias, modo: "7dias" },
    { label: "Este mes", onPress: onMes, modo: "mes" },
  ];

  const renderDatePickers = () => {
    if (Platform.OS !== "web" || !DatePicker) return null;

    if (!isMobile) {
      return (
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Desde:</Text>
            <DatePicker
              selected={startDate}
              onChange={(d) => {
                setStartDate(d);
                setModoActivo("custom");
              }}
              dateFormat="yyyy-MM-dd"
              maxDate={endDate}
              portalId="datepicker-portal"
              popperPlacement="bottom-start"
            />
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Hasta:</Text>
            <DatePicker
              selected={endDate}
              onChange={(d) => {
                setEndDate(d);
                setModoActivo("custom");
              }}
              dateFormat="yyyy-MM-dd"
              minDate={startDate}
              maxDate={new Date()}
              portalId="datepicker-portal"
              popperPlacement="bottom-start"
            />
          </View>
          <Pressable onPress={aplicarCustom} style={styles.buscarBtn}>
            <MaterialCommunityIcons name="magnify" size={18} color="#fff" />
            <Text style={styles.buscarBtnText}>Buscar</Text>
          </Pressable>
        </View>
      );
    }

    // Mobile
    return (
      <View style={styles.dateRowMobile}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dateLabel}>Desde:</Text>
          <DatePicker
            selected={startDate}
            onChange={(d) => {
              setStartDate(d);
              setModoActivo("custom");
            }}
            dateFormat="yyyy-MM-dd"
            maxDate={endDate}
            portalId="datepicker-portal"
            popperPlacement="bottom-start"
            customInput={
              <Pressable style={styles.dateButtonMobile}>
                <MaterialCommunityIcons
                  name="calendar-start"
                  size={16}
                  color="#140663"
                />
                <Text style={styles.dateButtonText} numberOfLines={1}>
                  {fmt(startDate)}
                </Text>
              </Pressable>
            }
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dateLabel}>Hasta:</Text>
          <DatePicker
            selected={endDate}
            onChange={(d) => {
              setEndDate(d);
              setModoActivo("custom");
            }}
            dateFormat="yyyy-MM-dd"
            minDate={startDate}
            maxDate={new Date()}
            portalId="datepicker-portal"
            popperPlacement="bottom-start"
            customInput={
              <Pressable style={styles.dateButtonMobile}>
                <MaterialCommunityIcons
                  name="calendar-end"
                  size={16}
                  color="#140663"
                />
                <Text style={styles.dateButtonText} numberOfLines={1}>
                  {fmt(endDate)}
                </Text>
              </Pressable>
            }
          />
        </View>
        <Pressable onPress={aplicarCustom} style={styles.buscarBtnMobile}>
          <MaterialCommunityIcons name="magnify" size={18} color="#fff" />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TOP Sabores Más Vendidos</Text>

      {/* Filtros rápidos */}
      <View style={styles.filtersRow}>
        {FILTROS.map((f) => (
          <Pressable
            key={f.modo}
            style={[
              styles.filterBtn,
              modoActivo === f.modo && styles.filterBtnActive,
            ]}
            onPress={f.onPress}
          >
            <Text
              style={[
                styles.filterText,
                modoActivo === f.modo && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Selector de fechas personalizado */}
      {renderDatePickers()}

      {/* Rango activo */}
      <Text style={styles.rangeText}>
        {fmt(startDate)} → {fmt(endDate)}
      </Text>

      {/* Gráfico */}
      {topSabores.length > 0 && (
        <BarChart
          data={{
            labels: topSabores.map((s) => s.sabor),
            datasets: [
              {
                data: topSabores.map((s) =>
                  Number(s.total || s.total_vendido || 0),
                ),
              },
            ],
          }}
          width={width - 30}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: () => "#140663",
            labelColor: () => "#000",
          }}
          fromZero
        />
      )}

      {/* Lista */}
      <FlatList
        data={topSabores}
        keyExtractor={(item, index) => `${item.sabor ?? "sabor"}-${index}`}
        renderItem={({ item }) => {
          const value = Number(item.total_vendido || item.total || 0);
          const anchoPx = maxCantidad > 0 ? (value / maxCantidad) * 100 : 0;
          return (
            <View style={styles.row}>
              <Text style={styles.label} numberOfLines={2} ellipsizeMode="tail">
                {item.sabor}
              </Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: `${anchoPx}%` }]} />
              </View>
              <Text style={styles.number}>{value}</Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Sin datos para este período</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },

  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 6,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: "#f0f0fa",
    borderRadius: 8,
    alignItems: "center",
  },
  filterBtnActive: { backgroundColor: "#140663" },
  filterText: { color: "#140663", fontWeight: "600", fontSize: 12 },
  filterTextActive: { color: "#fff" },

  dateRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "flex-end",
  },
  dateItem: { flex: 1 },
  dateLabel: { fontSize: 11, color: "#888", marginBottom: 2 },

  dateRowMobile: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    gap: 6,
  },
  dateButtonMobile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 7,
    backgroundColor: "#f0f0fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#140663",
  },
  dateButtonText: { fontSize: 12, color: "#140663", fontWeight: "600" },

  buscarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#140663",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buscarBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  buscarBtnMobile: {
    backgroundColor: "#140663",
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },

  rangeText: { fontSize: 12, color: "#888", marginBottom: 8 },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  label: {
    flexBasis: "30%",
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
    paddingRight: 6,
    flexWrap: "wrap",
  },
  barContainer: {
    flexBasis: "55%",
    height: 18,
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 6,
  },
  bar: { height: 14, backgroundColor: "#4CAF50", borderRadius: 8 },
  number: {
    flexBasis: "12%",
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
  },

  emptyText: { textAlign: "center", color: "#aaa", marginTop: 30 },
});
