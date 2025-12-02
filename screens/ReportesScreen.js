import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useReportes } from "../context/ReportesContext";
import { PieChart } from "react-native-chart-kit";

export default function ReportesScreen() {
    const { topSabores, loadTopSabores } = useReportes();

    useEffect(() => {
        loadTopSabores();
    }, []);

    const chartData = topSabores.map(item => ({
        name: item.sabor,
        population: item.total,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        legendFontColor: "#333",
        legendFontSize: 14,
    }));

    return (
        <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🍦 TOP Sabores Más Vendidos</Text>

        {chartData.length > 0 && (
            <PieChart
            data={chartData}
            width={Dimensions.get("window").width - 20}
            height={280}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            />
        )}

        {topSabores.map((item, index) => (
            <Text key={index} style={styles.listItem}>
            {index + 1}. {item.sabor} — {item.total} ventas
            </Text>
        ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  listItem: { fontSize: 18, marginTop: 8 }
});
