import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useVentas } from "../context/VentasContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VentasItem from "../components/VentasItem";
import { formatServerDateForDisplay } from "../utils/formatFechaGlobal";
import { useSede } from '../context/SedeContext';


function VentasScreen() {
    const { ventas, loadVentasByDateRange, sortVentas } = useVentas();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [expandedFacturaId, setExpandedFacturaId] = useState(null);
    const { sedeActiva } = useSede();

    // Cargar ventas de los últimos 7 días al montar el componente
    useEffect(() => {
        console.log("cargamdo ventas ultimos 7 dias.....")
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        setStartDate(sevenDaysAgo);
        setEndDate(new Date());
        console.log("Fecha de inicio: ", startDate )
        loadVentasByDateRange(sevenDaysAgo, new Date());
    }, []);

    const refresh = () => {
        // Recalcular las fechas cada vez que se presiona refresh
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        setStartDate(sevenDaysAgo);
        setEndDate(new Date());
        loadVentasByDateRange(sevenDaysAgo, new Date());
    }


        
// Agrupar ventas por fecha y factura    
const groupVentasByDateAndFactura = () => {
    console.log("Datos crudos de ventas:", ventas); // Verificar los datos iniciales

    // Agrupar facturas estrictamente por fecha local y evitar duplicados
    const grouped = ventas.reduce((acc, venta) => {
        // ✅ Extraer fecha directamente sin reinterpretar zona horaria
        const date = venta.fecha.split('T')[0]; // "2026-01-07T15:30:00.000Z" → "2026-01-07"

        console.log("Datos fecha procesada para agrupación:", date);
        if (!acc[date]) acc[date] = {};
        if (!acc[date][venta.id_factura]) acc[date][venta.id_factura] = [];
        acc[date][venta.id_factura].push(venta);

        return acc;
    }, {});

    console.log("Datos agrupados por fecha y factura (antes de procesar):", grouped);

    // Procesar las agrupaciones para generar los totales
    const result = Object.entries(grouped)
        .map(([date, facturas]) => ({
        date,
        facturas: Object.entries(facturas)
            .map(([id_factura, items]) => ({
            id_factura,
                items,
            nombre_sede: items[0]?.nombre_sede,
            totalVenta: items.reduce((sum, item) => sum + item.venta_helado, 0),
            totalCantidad: items.reduce((sum, item) => sum + item.cantidad, 0),
               // horaFactura: items.length > 0 ? formatHora(items[0].fecha) : null, // Hora del primer item
                horaFactura: items.length > 0 ? formatServerDateForDisplay(items[0].fecha) : null, // Hora del primer item (formato CO): null,
            }))
            .filter((factura) => factura.items.length > 0), // Filtrar facturas sin items
        }))
        .filter((group) => group.facturas.length > 0); // Filtrar fechas sin facturas

    return result;
};

    const groupedVentas = groupVentasByDateAndFactura();


    const handlePress = (facturaId) => {
        setExpandedFacturaId((prevId) => (prevId === facturaId ? null : facturaId));
        };

    return (
        <View style={styles.container}>
            <View style={styles.filterBar}>
                <Pressable onPress={() => sortVentas("fecha")} style={styles.filterButton}>
                <Text>Ordenar por Fecha</Text>
                </Pressable>
                <Pressable onPress={() => sortVentas("producto")} style={styles.filterButton}>
                <Text>Más Vendido</Text>
                </Pressable>
                <Pressable onPress={() => refresh()} style={styles.filterButton}>
                <MaterialCommunityIcons name="update" size={24} color="black" />
                </Pressable>
            </View>

            <FlatList
                data={groupedVentas}
                keyExtractor={(item) => item.date}
                renderItem={({ item }) => {
                const { date, facturas } = item;
                const totalDiaVentas = facturas.reduce((sum, factura) => sum + factura.totalVenta, 0);
                const totalDiaCantidad = facturas.reduce((sum, factura) => sum + factura.totalCantidad, 0);

                return (
                    <View style={styles.dateBlock}>
                        <View style={styles.dateLine} >
                            <Text style={styles.dateTitle}>
                                {date} - Total Ventas: ${totalDiaVentas}, Total Helados: {totalDiaCantidad}
                            </Text>
                        </View>
                    
                    {facturas.map((factura) => (
                        <View key={factura.id_factura} style={styles.facturaBlock}>
                            <View style={styles.facturaBlockHeader}>
                                <Text style={styles.facturaTitle}    onPress={() => handlePress(factura.id_factura)}>
                                    F_No. {factura.id_factura} - Hora: {factura.horaFactura}
                                </Text>
                                <Text style={styles.textCantidad}>{factura.totalCantidad}</Text>
                            </View>

                            <View style={styles.facturaBlockHeader}>
                                <Text style={ factura.nombre_sede === "Rappi" ? styles.facturaSede : styles.facturaTitle}    onPress={() => handlePress(factura.id_factura)}>
                                    SEDE: {factura.nombre_sede} 
                                </Text>
                                {/* <Text style={styles.textCantidad}>{factura.totalCantidad}</Text> */}
                            </View>

                        {expandedFacturaId === factura.id_factura && (
                            <View>
                            {factura.items.map((venta) => (
                                <VentasItem
                                key={venta.id}
                                venta={venta}
                                isExpanded={true}
                                    onPress={() => { }}
                                    
                                    // isExpanded={item.id === expandedId}
                                    // onPress={() => handlePress(item.id)}
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
            {/* {sortVentas("fecha")} */}
        </View>
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
        marginBottom: 10,
    },
    filterButton: {
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 5,
    },
    dateBlock: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: "#e91e63",
        borderRadius: 10,
    },
    dateTitle: {
        fontSize: 18,
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
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    facturaSede: {
        fontSize: 18,
        backgroundColor: "#ffffffff",
        fontWeight: "bold",
        padding: 5,
        borderRadius: 8,
        color: "#ff6600ff",
        marginBottom: 5,
    },
    textCantidad:{
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    width:30,
    height:30,
    textAlign: "center",
    backgroundColor:"#f0f",
    borderRadius:20,
    alignContent:"center",
    justifyContent:"center",
},
});

export default VentasScreen;
