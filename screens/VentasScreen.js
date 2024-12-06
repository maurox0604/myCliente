import { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useVentas } from "../context/VentasContext";
import VentasItem from "../components/VentasItem";
import DatePicker from "react-native-date-picker"; // Asegúrate de instalar un picker de fechas

function VentasScreen() {
    const { ventas, loadVentasByDateRange, sortVentas } = useVentas();
    const [startDate, setStartDate] = useState(new Date()); // Fecha inicial
    const [endDate, setEndDate] = useState(new Date()); // Fecha final
    const [calendarVisible, setCalendarVisible] = useState(false);

    useEffect(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        loadVentasByDateRange(sevenDaysAgo, new Date());
    }, []);

    const handleSort = (criterion) => {
        sortVentas(criterion);
    };

    const handleDateRangeSelection = () => {
        setCalendarVisible(false);
        loadVentasByDateRange(startDate, endDate);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ventas</Text>
            <View style={styles.filterBar}>
                <Button title="Ordenar por fecha" onPress={() => handleSort("fecha")} />
                <Button title="Producto más vendido" onPress={() => handleSort("producto")} />
                <Button title="Seleccionar rango" onPress={() => setCalendarVisible(true)} />
            </View>

            {calendarVisible && (
                <View>
                    <DatePicker date={startDate} onDateChange={setStartDate} />
                    <DatePicker date={endDate} onDateChange={setEndDate} />
                    <Button title="Aplicar rango" onPress={handleDateRangeSelection} />
                </View>
            )}

            <FlatList
                data={ventas}
                keyExtractor={(venta) => venta.id.toString()}
                renderItem={({ item }) => <VentasItem venta={item} />}
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    filterBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
    },
    list: {
        flex: 1,
    },
});

export default VentasScreen;
