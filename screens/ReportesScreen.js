import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    TouchableOpacity,
    Platform,
} from "react-native";
import { useReportes } from "../context/ReportesContext";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
// import * as Print from "expo-print";
// import * as Sharing from "expo-sharing";

// --- Helpers --- //
const abbreviate = (text) => {
    if (!text) return "";
    if (text.length <= 10) return text;
    const parts = text.split(" ");
    if (parts.length > 1) {
        return parts[0] + " " + parts[1][0] + ".";
    }
    return text.slice(0, 9) + "...";
};

const labelFontSize = Platform.OS === "web" ? 12 : 9;

// Colores por sabor (puedes ajustar a tu gusto)
const COLORES_POR_SABOR = {
    "Jumbo": "#4CAF50",
    "Fresas + Crema": "#FF6384",
    "Baileys": "#FF9800",
    "Genovesa": "#3F51B5",
    "Oreo": "#9C27B0",
    "Coco": "#00BCD4",
    "Queso bocadillo": "#8BC34A",
    "Queso bocadillo ": "#8BC34A", // por si viene con espacio
    "Maracuyá": "#FFC107",
    "Maracuyá ": "#FFC107",
    "Nucita": "#E91E63",
    "Café": "#795548",
    "Café ": "#795548",
};

const getColorForSabor = (sabor) => {
    if (!sabor) return "#4CAF50";
    const clean = sabor.trim();
    return COLORES_POR_SABOR[clean] || "#4CAF50";
};

export default function ReportesScreen() {
    const { topSabores, loadTopSabores } = useReportes();
    const [showTop5, setShowTop5] = useState(false);
    

    useEffect(() => {
        loadTopSabores();
        console.log("♥ hoy hoy: ",hoy)
    }, []);

    // Si el backend ya viene ordenado descendente, esto funciona perfecto
    const dataToShow = showTop5 ? topSabores.slice(0, 5) : topSabores;

    const maxCantidad =
        dataToShow.length > 0
        ? Math.max(...dataToShow.map((item) => Number(item.total)))
        : 1;

    const handleToggleTop5 = () => {
        setShowTop5((prev) => !prev);
    };

    const handleExportPDF = async () => {
        try {
        const rowsHtml = dataToShow
            .map(
            (item, index) => `
            <tr>
                <td style="padding:4px 8px;">${index + 1}</td>
                <td style="padding:4px 8px;">${item.sabor}</td>
                <td style="padding:4px 8px; text-align:right;">${item.total}</td>
            </tr>
            `
            )
            .join("");

        const html = `
            <html>
            <head>
                <meta charset="utf-8" />
                <title>TOP Sabores Más Vendidos</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 16px;">
                <h1 style="text-align:center;">Ice Queen</h1>
                <h2 style="text-align:center;">TOP Sabores Más Vendidos</h2>
                <table style="width:100%; border-collapse:collapse; margin-top:16px;">
                <thead>
                    <tr>
                    <th style="border-bottom:1px solid #ccc; padding:4px 8px; text-align:left;">#</th>
                    <th style="border-bottom:1px solid #ccc; padding:4px 8px; text-align:left;">Sabor</th>
                    <th style="border-bottom:1px solid #ccc; padding:4px 8px; text-align:right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
                </table>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });

        // En móvil, intentar compartir directamente
        if (Platform.OS !== "web" && (await Sharing.isAvailableAsync())) {
            await Sharing.shareAsync(uri);
        } else {
            console.log("PDF generado en:", uri);
            alert("PDF generado. Revisa la consola para ver la ruta del archivo.");
        }
        } catch (error) {
        console.log("Error generando PDF:", error);
        alert("Ocurrió un error al generar el PDF");
    }
    };
    

    const hoy = new Date();
    console.log("hoy: ",hoy)
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    const sieteDias = new Date();
    sieteDias.setDate(hoy.getDate() - 7);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>TOP Sabores Más Vendidos</Text>
            
            {/* ----- Filtros ----- */}
        <View style={styles.filtersRow}>
            <Text style={styles.filterBtn} onPress={() => loadTopSabores(hoy, hoy)}>
                Hoy
            </Text>

            <Text style={styles.filterBtn} onPress={() => loadTopSabores(ayer, ayer)}>
                Ayer
            </Text>

            <Text style={styles.filterBtn} onPress={() => loadTopSabores(sieteDias, hoy)}>
                7 días
            </Text>

            <Text style={styles.filterBtn} onPress={() => loadTopSabores(inicioMes, hoy)}>
                Este mes
            </Text>
        </View>

      {/* Botones de acciones */}
        <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.button} onPress={handleToggleTop5}>
            <Text style={styles.buttonText}>
                {showTop5 ? "Ver todos" : "Ver Top 5"}
            </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonSecondary} onPress={handleExportPDF}>
            <Text style={styles.buttonText}>Exportar / Compartir PDF</Text>
            </TouchableOpacity>
        </View>

      {/* Gráfico de barras vertical */}
        {dataToShow.length > 0 && (
            <BarChart
            data={{
                labels: dataToShow.map((s) => abbreviate(s.sabor)),
                datasets: [
                {
                    data: dataToShow.map((s) => Number(s.total)),
                },
                ],
            }}
            width={Dimensions.get("window").width - 20}
            height={260}
            fromZero
            showValuesOnTopOfBars
            chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: () => "#140663",
            labelColor: () => "#000",
            propsForLabels: {
              fontSize: labelFontSize,
              rotation: Platform.OS === "web" ? 0 : 45,
            },
          }}
          style={{
            marginVertical: 10,
          }}
        />
      )}

      {/* Lista con barras horizontales y colores por sabor */}
      <FlatList
        data={dataToShow}
        keyExtractor={(item, index) => `${item.sabor}-${index}`}
        renderItem={({ item }) => {
          const ancho = (Number(item.total) / maxCantidad) * 250;

          return (
            <View style={styles.row}>
              <Text style={styles.label}>{item.sabor}</Text>

              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: ancho,
                      backgroundColor: getColorForSabor(item.sabor),
                    },
                  ]}
                />
              </View>

              <Text style={styles.number}>{item.total}</Text>
            </View>
          );
        }}
      />
    </ScrollView>
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
    marginBottom: 10,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 10,
  },
  button: {
    backgroundColor: "#140663",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  buttonSecondary: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    width: 100,
    fontSize: 14,
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
    borderRadius: 10,
  },
  number: {
    width: 40,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    },
  
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
},
filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#140663",
    color: "#fff",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
},

});
