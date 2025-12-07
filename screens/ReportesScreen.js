import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useReportes } from "../context/ReportesContext";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const fmt = (d) => {
  // d: Date -> "YYYY-MM-DD"
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function ReportesScreen() {
    const { topSabores, loadTopSabores } = useReportes();

    useEffect(() => {
        // carga inicial: últimos 7 días por defecto
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6); // 7 días (incluye hoy)
        loadTopSabores(fmt(start), fmt(end));
        console.log("♥♣◘fechas: ", start, end)
    }, []);

    const onHoy = () => {
        const d = new Date();
        loadTopSabores(fmt(d), fmt(d));
    };

    const onAyer = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        loadTopSabores(fmt(d), fmt(d));
        console.log("♥♣◘fechas Ayer: ", d)
    };

    const on7Dias = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        loadTopSabores(fmt(start), fmt(end));
    };

    const onMes = () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        loadTopSabores(fmt(start), fmt(end));
        };
        
        const maxCantidad = topSabores.length > 0
    ? Math.max(...topSabores.map(item => Number(item.total_vendido || item.total || 0)))
        : 1;
    
    

    return (
        <View style={styles.container}>
        <Text style={styles.title}>TOP Sabores Más Vendidos</Text>

        <View style={styles.filtersRow}>
            <Pressable style={styles.filterBtn} onPress={onHoy}>
            <Text style={styles.filterText}>Hoy</Text>
            </Pressable>

            <Pressable style={styles.filterBtn} onPress={onAyer}>
            <Text style={styles.filterText}>Ayer</Text>
            </Pressable>

            <Pressable style={styles.filterBtn} onPress={on7Dias}>
            <Text style={styles.filterText}>7 días</Text>
            </Pressable>

            <Pressable style={styles.filterBtn} onPress={onMes}>
            <Text style={styles.filterText}>Este mes</Text>
            </Pressable>
        </View>

        <BarChart
            data={{
            labels: topSabores.map(s => s.sabor),
            datasets: [{ data: topSabores.map(s => Number(s.total || s.total_vendido || 0)) }]
            }}
            width={Dimensions.get("window").width - 30}
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

        <FlatList
            data={topSabores}
            keyExtractor={(item, index) => `${item.sabor ?? "sabor"}-${index}`}
            renderItem={({ item }) => {
    const value = Number(item.total_vendido || item.total || 0);
    const anchoPx = maxCantidad > 0 ? (value / maxCantidad) * 100 : 0; // porcentaje

    return (
        <View style={styles.row}>
        <Text style={styles.label} numberOfLines={2} ellipsizeMode="tail">{item.sabor}</Text>

        <View style={styles.barContainer}>
            <View style={[styles.bar, { width: `${anchoPx}%` }]} />
        </View>

        <Text style={styles.number}>{value}</Text>
        </View>
    );
    }}
        />
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  filtersRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#140663", borderRadius: 6 },
  filterText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
 label: {
  flexBasis: "30%",       // ocupa hasta 30% del ancho (mejor que width fija)
  flexShrink: 1,
  fontSize: 15,
  fontWeight: "600",
  paddingRight: 6,
  flexWrap: "wrap"
},
barContainer: {
  flexBasis: "55%",       // barra ocupa el centro
  height: 18,
  backgroundColor: "#eee",
  borderRadius: 10,
  overflow: "hidden",
  marginHorizontal: 6,
},
number: {
  flexBasis: "12%",       // número al final
  textAlign: "right",
  fontSize: 14,
  fontWeight: "700"
},
  bar: { height: 14, backgroundColor: "#4CAF50", borderRadius: 8 },
});
