import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useReportes } from "../context/ReportesContext";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

export default function ReportesScreen() {
    const { topSabores, loadTopSabores } = useReportes();

    useEffect(() => {
        loadTopSabores();
    }, []);

    const maxCantidad = topSabores.length > 0 
        ? Math.max(...topSabores.map(item => item.total_vendido))
        : 1;

    const chartData = {
  labels: topSabores.map(item => item.sabor),
  datasets: [
    {
      data: topSabores.map(item => item.total)
    }
  ]
};

    return (
        <View style={styles.container}>
            <Text style={styles.title}>TOP Sabores Más Vendidos</Text>


<BarChart
  data={{
    labels: topSabores.map(s => s.sabor),
    datasets: [{ data: topSabores.map(s => Number(s.total)) }]
  }}
  width={Dimensions.get("window").width - 20}
  height={250}
  chartConfig={{
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: () => "#140663",
    labelColor: () => "#000",
  }}
  fromZero
/>

            
            {/* {topSabores && topSabores.map((item, index) => (
  <Text key={index}>{item.sabor} - {item.total}</Text>
))} */}

            <FlatList
                data={topSabores}
                // keyExtractor={(item) => item.id.toString()}
                keyExtractor={(item, index) => `${item.sabor}-${index}`}

                renderItem={({ item }) => {
                    const ancho = (item.total_vendido / maxCantidad) * 250;

                    return (
                        <View style={styles.row}>
                            <Text style={styles.label}>{item.sabor}</Text>

                            <View style={styles.barContainer}>
                                <View style={[styles.bar, { width: ancho }]} />
                            </View>

                            <Text style={styles.number}>{item.total_vendido}</Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    label: {
        width: 100,
        fontSize: 16,
        fontWeight: "600",
    },
    barContainer: {
        flex: 1,
        height: 16,
        backgroundColor: "#eee",
        borderRadius: 10,
        overflow: "hidden",
        marginHorizontal: 10,
    },
    bar: {
        height: 16,
        backgroundColor: "#4CAF50",
        borderRadius: 10,
    },
    number: {
        width: 35,
        fontSize: 16,
        fontWeight: "600",
        textAlign: "right",
    },
});
