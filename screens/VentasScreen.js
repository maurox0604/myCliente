import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useVentas } from "../context/VentasContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VentasItem from "../components/VentasItem";
import FacturaDetailModal from "../components/FacturaDetailModal";
import { formatServerDateForDisplay } from "../utils/formatFechaGlobal";
import { useSede } from "../context/SedeContext";
import RequireRole from "../components/RequireRole";
import { useWindowDimensions } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

let DatePicker;
if (Platform.OS === "web") {
  DatePicker = require("react-datepicker").default;
  require("react-datepicker/dist/react-datepicker.css");
}

function VentasScreen() {
  const { ventas, loadVentasByDateRange, sortVentas } = useVentas();
  const { role } = useContext(AuthContext);
  useSede();

  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [expandedFacturaId, setExpandedFacturaId] = useState(null);

  // ── Modal de edición ──
  const [modalFactura, setModalFactura] = useState(null); // factura seleccionada
  const [modalVisible, setModalVisible] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [modo, setModo] = useState("7dias");

  const sedeStyleMap = {
    Local: styles.sedeLocal,
    Rappi: styles.sedeRappi,
    Evento: styles.sedeEvento,
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      if (!document.getElementById("datepicker-portal")) {
        const portal = document.createElement("div");
        portal.id = "datepicker-portal";
        portal.style.cssText =
          "position:fixed;z-index:99999;top:0;left:0;pointer-events:none;";
        document.body.appendChild(portal);
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
    }
  }, []);

  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    loadVentasByDateRange(sevenDaysAgo, new Date());
  }, []);

  const aplicarFiltro = () => loadVentasByDateRange(startDate, endDate, true);

  const volverA7Dias = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    setStartDate(sevenDaysAgo);
    setEndDate(new Date());
    setModo("7dias");
    loadVentasByDateRange(sevenDaysAgo, new Date(), true);
  };

  const formatDateLabel = (date) => date.toISOString().split("T")[0];

  // ── Abrir modal de edición ──
  const abrirModalFactura = (factura) => {
    setModalFactura(factura);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setModalFactura(null);
  };

  // Recargar el rango actual después de editar
  const recargarVentas = () => {
    loadVentasByDateRange(startDate, endDate, true);
  };

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
            totalVenta: items.reduce(
              (sum, item) =>
                item.motivo === "venta" || !item.motivo
                  ? sum + item.venta_helado
                  : sum,
              0,
            ),
            totalCantidad: items.reduce(
              (sum, item) =>
                item.motivo === "venta" || !item.motivo
                  ? sum + item.cantidad
                  : sum,
              0,
            ),
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

  const renderDatePickers = () => {
    if (!isMobile) {
      return (
        <View style={styles.datePickerRow}>
          <View style={styles.datePickerItem}>
            <Text style={styles.dateLabel}>Desde:</Text>
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                setModo("custom");
              }}
              dateFormat="yyyy-MM-dd"
              maxDate={endDate}
              portalId="datepicker-portal"
            />
          </View>
          <View style={styles.datePickerItem}>
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
              portalId="datepicker-portal"
            />
          </View>
          <Pressable onPress={aplicarFiltro} style={styles.buscarButton}>
            <MaterialCommunityIcons name="magnify" size={20} color="#fff" />
            <Text style={styles.buscarButtonText}>Buscar</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.datePickerRowMobile}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dateLabel}>Desde:</Text>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              setModo("custom");
            }}
            dateFormat="yyyy-MM-dd"
            maxDate={endDate}
            portalId="datepicker-portal"
            customInput={
              <Pressable style={styles.dateButtonMobile}>
                <MaterialCommunityIcons
                  name="calendar-start"
                  size={16}
                  color="#e91e63"
                />
                <Text style={styles.dateButtonText} numberOfLines={1}>
                  {formatDateLabel(startDate)}
                </Text>
              </Pressable>
            }
          />
        </View>
        <View style={{ flex: 1 }}>
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
            portalId="datepicker-portal"
            customInput={
              <Pressable style={styles.dateButtonMobile}>
                <MaterialCommunityIcons
                  name="calendar-end"
                  size={16}
                  color="#e91e63"
                />
                <Text style={styles.dateButtonText} numberOfLines={1}>
                  {formatDateLabel(endDate)}
                </Text>
              </Pressable>
            }
          />
        </View>
        <Pressable onPress={aplicarFiltro} style={styles.buscarButtonMobile}>
          <MaterialCommunityIcons name="magnify" size={18} color="#fff" />
        </Pressable>
      </View>
    );
  };

  return (
    <RequireRole allowedRoles={["superadmin", "vendedor"]}>
      <View style={styles.container}>
        {/* Controles superiores */}
        <View style={styles.controls}>
          <View style={styles.filterBar}>
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

          {renderDatePickers()}

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
        </View>

        {/* Lista de ventas */}
        <FlatList
          style={styles.list}
          data={groupedVentas}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => {
            const { date, facturas } = item;
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
                    {/* Header de factura: título + ícono editar (solo superadmin) */}
                    <View style={styles.facturaBlockHeader}>
                      <Text
                        style={styles.facturaTitle}
                        onPress={() => handlePress(factura.id_factura)}
                      >
                        F_No. {factura.id_factura} · {factura.horaFactura}
                      </Text>
                      <View style={styles.facturaHeaderRight}>
                        {role === "superadmin" && (
                          <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => abrirModalFactura(factura)}
                          >
                            <MaterialCommunityIcons
                              name="pencil-outline"
                              size={16}
                              color="#e91e63"
                            />
                          </TouchableOpacity>
                        )}
                        <Text style={styles.textCantidad}>
                          {factura.totalCantidad}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.facturaBlockHeader}>
                      <Text
                        style={[
                          styles.facturaSedeBadge,
                          sedeStyleMap[factura.nombre_sede] || styles.sedeLocal,
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

      {/* Modal de edición — solo se monta si hay factura seleccionada */}
      <FacturaDetailModal
        visible={modalVisible}
        factura={modalFactura}
        onClose={cerrarModal}
        onRefresh={recargarVentas}
      />
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  controls: { backgroundColor: "#fff", marginBottom: 4 },
  list: { flex: 1 },

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
  filterButtonActive: { backgroundColor: "#e91e63" },
  filterButtonText: { fontSize: 12, fontWeight: "600", color: "#333" },
  filterButtonTextActive: { color: "#fff" },

  datePickerRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    alignItems: "flex-end",
  },
  datePickerItem: { flex: 1 },
  dateLabel: { fontSize: 11, color: "#888", marginBottom: 2 },

  datePickerRowMobile: {
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
    backgroundColor: "#fff0f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e91e63",
  },
  dateButtonText: { fontSize: 12, color: "#e91e63", fontWeight: "600" },

  buscarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e91e63",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buscarButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  buscarButtonMobile: {
    backgroundColor: "#e91e63",
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },

  rangeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  rangeText: { fontSize: 12, color: "#666", fontWeight: "500" },
  resetText: { fontSize: 12, color: "#e91e63", fontWeight: "600" },

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
  facturaTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5, flex: 1 },

  facturaHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  editBtn: {
    padding: 4,
    backgroundColor: "#fff0f5",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e91e63",
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
  facturaSedeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    overflow: "hidden",
    marginBottom: 5,
  },
  sedeLocal: { backgroundColor: "#4CAF50" },
  sedeRappi: { backgroundColor: "#FF5722" },
  sedeEvento: { backgroundColor: "#2196F3" },
});

export default VentasScreen;
