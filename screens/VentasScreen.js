import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useVentas } from "../context/VentasContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VentasItem from "../components/VentasItem";
import { formatServerDateForDisplay } from "../utils/formatFechaGlobal";
import { useSede } from "../context/SedeContext";
import RequireRole from "../components/RequireRole";

// ✅ Date picker según plataforma
import DateTimePicker from "@react-native-community/datetimepicker";

// Para web usamos react-datepicker
let DatePicker;
if (Platform.OS === "web") {
  DatePicker = require("react-datepicker").default;
  require("react-datepicker/dist/react-datepicker.css");
}

function VentasScreen() {
  const { ventas, loadVentasByDateRange, sortVentas } = useVentas();
  useSede();

  const [expandedFacturaId, setExpandedFacturaId] = useState(null);

  // ✅ Agrega este mapeo (referencia los estilos globales de abajo)
  const sedeStyleMap = {
    Local: styles.sedeLocal,
    Rappi: styles.sedeRappi,
    Evento: styles.sedeEvento,
  };

  // ✅ Fechas — por defecto últimos 7 días
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  // ✅ Control de pickers en móvil
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // ✅ Modo: "7dias" | "custom"
  const [modo, setModo] = useState("7dias");

  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    loadVentasByDateRange(sevenDaysAgo, new Date());
  }, []);

  // ✅ Fijamos el z-index de los pickers en 9999 para que siempre estén por encima, especialmente en web
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `.react-datepicker-popper { z-index: 9999 !important; }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const aplicarFiltro = () => {
    loadVentasByDateRange(startDate, endDate, true);
  };

  const volverA7Dias = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    setStartDate(sevenDaysAgo);
    setEndDate(new Date());
    setModo("7dias");
    loadVentasByDateRange(sevenDaysAgo, new Date(), true);
  };

  const formatDateLabel = (date) => date.toISOString().split("T")[0];

  // ✅ Agrupación igual que antes
  const groupVentasByDateAndFactura = () => {
    const grouped = ventas.reduce((acc, venta) => {
      if (!ventas || ventas.length === 0) return [];
      const date = venta.fecha.split("T")[0];
      if (!acc[date]) acc[date] = {};
      if (!acc[date][venta.id_factura]) acc[date][venta.id_factura] = [];
      acc[date][venta.id_factura].push(venta);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, facturas]) => ({
        date,
        facturas: Object.entries(facturas)
          .map(([id_factura, items]) => ({
            id_factura,
            items,
            nombre_sede: items[0]?.nombre_sede,
            // ✅ Total ingresos — solo ventas reales
            totalVenta: items.reduce(
              (sum, item) =>
                item.motivo === "venta" || !item.motivo
                  ? sum + item.venta_helado
                  : sum,
              0,
            ),
            // ✅ Cantidad total incluye todo (para saber cuántos salieron)
            totalCantidad: items.reduce((sum, item) => sum + item.cantidad, 0),
            // ✅ Cantidad solo de ventas reales
            // ✅ Cantidad vendida — solo ventas reales
            totalCantidad: items.reduce(
              (sum, item) =>
                item.motivo === "venta" || !item.motivo
                  ? sum + item.cantidad
                  : sum,
              0,
            ),

            // ✅ Cantidad obsequios/muestras/derretidos — para mostrar aparte
            totalNoVenta: items.reduce(
              (sum, item) =>
                item.motivo !== "venta" && item.motivo
                  ? sum + item.cantidad
                  : sum,
              0,
            ),
            horaFactura:
              items.length > 0
                ? formatServerDateForDisplay(items[0].fecha)
                : null,
          }))
          .filter((f) => f.items.length > 0),
      }))
      .filter((g) => g.facturas.length > 0);
  };

  const groupedVentas = groupVentasByDateAndFactura();

  const handlePress = (facturaId) => {
    setExpandedFacturaId((prev) => (prev === facturaId ? null : facturaId));
  };

  // ✅ Render del selector de fechas según plataforma
  const renderDatePickers = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.datePickerRow}>
          <View
            style={[
              styles.datePickerItem,
              { zIndex: 9999, position: "relative" },
            ]}
          >
            <Text style={styles.dateLabel}>Desde:</Text>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                setModo("custom");
              }}
              dateFormat="yyyy-MM-dd"
              maxDate={endDate}
            />
          </View>

          <View
            style={[
              styles.datePickerItem,
              { zIndex: 9998, position: "relative" },
            ]}
          >
            <Text style={styles.dateLabel}>Hasta:</Text>
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
                setModo("custom");
              }}
              dateFormat="yyyy-MM-dd"
              minDate={startDate}
              maxDate={new Date()}
            />
          </View>

          <Pressable onPress={aplicarFiltro} style={styles.buscarButton}>
            <MaterialCommunityIcons name="magnify" size={20} color="#fff" />
            <Text style={styles.buscarButtonText}>Buscar</Text>
          </Pressable>
        </View>
      );
    }

    // móvil — igual que antes + botón buscar
    return (
      <View style={styles.datePickerRow}>
        <Pressable
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <MaterialCommunityIcons
            name="calendar-start"
            size={18}
            color="#e91e63"
          />
          <Text style={styles.dateButtonText}>
            {formatDateLabel(startDate)}
          </Text>
        </Pressable>

        <Pressable
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
        >
          <MaterialCommunityIcons
            name="calendar-end"
            size={18}
            color="#e91e63"
          />
          <Text style={styles.dateButtonText}>{formatDateLabel(endDate)}</Text>
        </Pressable>

        {/* ✅ Botón buscar en móvil */}
        <Pressable onPress={aplicarFiltro} style={styles.buscarButton}>
          <MaterialCommunityIcons name="magnify" size={20} color="#fff" />
          <Text style={styles.buscarButtonText}>Buscar</Text>
        </Pressable>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            maximumDate={endDate}
            onChange={(e, date) => {
              setShowStartPicker(false);
              if (date) {
                setStartDate(date);
                setModo("custom");
              }
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            maximumDate={new Date()}
            onChange={(e, date) => {
              setShowEndPicker(false);
              if (date) {
                setEndDate(date);
                setModo("custom");
              }
            }}
          />
        )}
      </View>
    );
  };

  return (
    <RequireRole allowedRoles={["superadmin", "vendedor"]}>
      <View style={styles.container}>
        {/* ✅ BARRA DE FILTROS */}
        <View style={styles.filterBar}>
          {/* Botones de ordenamiento */}
          <Pressable
            onPress={() => sortVentas("fecha")}
            style={styles.filterButton}
          >
            <Text style={styles.filterButtonText}>📅 Fecha</Text>
          </Pressable>
          <Pressable
            onPress={() => sortVentas("producto")}
            style={styles.filterButton}
          >
            <Text style={styles.filterButtonText}>🏆 Top</Text>
          </Pressable>
          <Pressable
            onPress={volverA7Dias}
            style={[
              styles.filterButton,
              modo === "7dias" && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                modo === "7dias" && styles.filterButtonTextActive,
              ]}
            >
              7 días
            </Text>
          </Pressable>
          <Pressable onPress={aplicarFiltro} style={styles.filterButton}>
            <MaterialCommunityIcons name="update" size={20} color="#333" />
          </Pressable>
        </View>

        {/* ✅ SELECTOR DE FECHAS */}
        {renderDatePickers()}

        {/* ✅ RESUMEN DEL RANGO ACTIVO */}
        <View style={styles.rangeInfo}>
          <Text style={styles.rangeText}>
            {formatDateLabel(startDate)} → {formatDateLabel(endDate)}
          </Text>
          {modo === "custom" && (
            <Pressable onPress={volverA7Dias}>
              <Text style={styles.resetText}>× Últimos 7 días</Text>
            </Pressable>
          )}
        </View>

        {/* ✅ LISTA DE VENTAS — igual que antes */}
        <FlatList
          data={groupedVentas}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => {
            const { date, facturas } = item;
            // ✅ Totales del día
            const totalDiaVentas = facturas.reduce(
              (sum, f) => sum + f.totalVenta,
              0,
            );
            const totalDiaCantidad = facturas.reduce(
              (sum, f) => sum + f.totalCantidad,
              0,
            );
            const totalDiaNoVenta = facturas.reduce(
              (sum, f) => sum + f.totalNoVenta,
              0,
            );

            return (
              <View style={styles.dateBlock}>
                <View style={styles.dateLine}>
                  {/* <Text style={styles.dateTitle}>
                    {date} — ${totalDiaVentas.toLocaleString("es-CO")} ·{" "}
                    {totalDiaCantidad} und
                  </Text> */}

                  <Text style={styles.dateTitle}>
                    {date} — ${totalDiaVentas.toLocaleString("es-CO")} ·{" "}
                    {totalDiaCantidad} und
                    {totalDiaNoVenta > 0 && (
                      <Text style={{ fontSize: 13, opacity: 0.8 }}>
                        {" "}
                        · 🎁 {totalDiaNoVenta} obsequios/muestras
                      </Text>
                    )}
                  </Text>
                </View>

                {facturas.map((factura) => (
                  <View key={factura.id_factura} style={styles.facturaBlock}>
                    <View style={styles.facturaBlockHeader}>
                      <Text
                        style={styles.facturaTitle}
                        onPress={() => handlePress(factura.id_factura)}
                      >
                        F_No. {factura.id_factura} · {factura.horaFactura}
                      </Text>
                      <Text style={styles.textCantidad}>
                        {factura.totalCantidad}
                      </Text>
                    </View>

                    <View style={styles.facturaBlockHeader}>
                      <Text
                        style={[
                          styles.facturaSedeBadge, // El estilo base con padding, bordes, etc.
                          sedeStyleMap[factura.nombre_sede] || styles.sedeLocal, // El color dinámico (con fallback)
                        ]}
                      >
                        SEDE: {factura.nombre_sede}
                      </Text>
                    </View>

                    {expandedFacturaId === factura.id_factura && (
                      <View>
                        {factura.items.map((venta) => (
                          <VentasItem
                            key={venta.id}
                            venta={venta}
                            isExpanded={true}
                            onPress={() => {}}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            );
          }}
        />
      </View>
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 6,
  },
  filterButton: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#e91e63",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  filterButtonTextActive: {
    color: "#fff",
  },

  // ✅ Date pickers
  datePickerRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    alignItems: "center",
    zIndex: 9999, // ✅ clave
    position: "relative", // ✅ necesario para que zIndex funcione en web
  },
  datePickerItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    backgroundColor: "#fff0f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e91e63",
  },
  dateButtonText: {
    fontSize: 13,
    color: "#e91e63",
    fontWeight: "600",
  },

  // ✅ Rango activo
  rangeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  rangeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  resetText: {
    fontSize: 12,
    color: "#e91e63",
    fontWeight: "600",
  },

  // ✅ Lista — igual que antes
  dateBlock: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#e91e63",
    borderRadius: 10,
  },
  dateLine: {},
  dateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  facturaBlock: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f1f8e9",
    borderRadius: 10,
  },
  facturaBlockHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  facturaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  facturaSede: {
    fontSize: 16,
    backgroundColor: "#fff",
    fontWeight: "bold",
    padding: 5,
    borderRadius: 8,
    color: "#ff6600",
    marginBottom: 5,
  },
  textCantidad: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    width: 28,
    height: 28,
    textAlign: "center",
    backgroundColor: "#f0f",
    borderRadius: 20,
    alignContent: "center",
    justifyContent: "center",
  },
  buscarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e91e63",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-end", // ✅ se alinea con los inputs
  },
  buscarButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  // 1. Estilos base y específicos por sede
  // Estilo base para la sede (si no quieres usar facturaTitle base)
  facturaSedeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    overflow: "hidden",
  },
  // Colores específicos por sede
  sedeLocal: { backgroundColor: "#4CAF50" }, // Verde
  sedeRappi: { backgroundColor: "#FF5722" }, // Naranja
  sedeEvento: { backgroundColor: "#2196F3" }, // Azul
});

export default VentasScreen;
