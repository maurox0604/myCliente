import { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { useVentas } from "../context/VentasContext";
import VentasItem from "../components/VentasItem";
import DatePicker from "react-native-date-picker"; // Asegúrate de instalar un picker de fechas
import { CLIENT_RENEG_LIMIT } from "tls";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DatePickerModal } from 'react-native-paper-dates';

function VentasScreen() {
    const { ventas, loadVentasByDateRange, sortVentas } = useVentas();
    const [startDate, setStartDate] = useState(new Date()); // Fecha inicial
    const [endDate, setEndDate] = useState(new Date()); // Fecha final
    const [calendarVisible, setCalendarVisible] = useState(false);
    // const [date, setDate] = useState(new Date());
    const [date, setDate] = useState(null);

    const onConfirm = ({ date }) => {
    setDate(date);
    return true;
};

    useEffect(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        setStartDate(sevenDaysAgo);
        loadVentasByDateRange(sevenDaysAgo, new Date());
    }, []);

    const handleSort = (criterion) => {
        sortVentas(criterion);
    };

    const handleDateRangeSelection = () => {
        setCalendarVisible(false);
        loadVentasByDateRange(startDate, endDate);
    };

    const handleRefresh = () => {
        loadVentasByDateRange(startDate, endDate); // Recarga los datos con el rango de fechas actual
    };

    const [expandedId, setExpandedId] = useState(null);
    const handlePress = (id) => {
        setExpandedId((prevId) => (prevId === id ? null : id)); // Alternar entre expandir/contraer
    };

//     () => {
//   const [startDate, setStartDate] = useState(new Date());
//   return (
//     <DatePicker
//       showIcon
//       selected={startDate}
//       onChange={(date) => setStartDate(date)}
//     />
//   );
// };

    return (
        <View style={styles.container}>
            
            {/* Botón para actualizar las ventas */}
            {/* <Button title="Actualizar" onPress={handleRefresh} /> */}
            <View style={styles.filterBar}>
                <Button title="Fecha" onPress={() => handleSort("fecha")} />
                <Button title="Más vendido" onPress={() => handleSort("producto")} />
                <Button title="Rango" onPress={() => setCalendarVisible(true)} />
                <Pressable style={styles.botOrder} onPress={handleRefresh}>
                    <MaterialCommunityIcons name="update" size={24} color="black" />
                </Pressable>
            </View>

            {calendarVisible && (
                <View>
                    {/* <DatePicker date={startDate} onDateChange={setStartDate} />
                    <DatePicker date={endDate} onDateChange={setEndDate} /> */}
                    <Button title="Aplicar rango" onPress={handleDateRangeSelection} />
                    {/* <DatePicker selected={startDate} onChange={(startDate) => setStartDate(startDate)} /> */}
                    {/* <DatePicker selected={date} onChange={(date) => setDate(date)} /> */}
                    {/* <DatePicker 
                        selected = { Date } 
                        onSelect = { handleDateSelect }  //cuando se hace clic en el día 
                        onChange = { handleDateChange }  //solo cuando el valor ha cambiado 
                    /> */}
                     {/* <DatePickerModal
      mode="single"
      visible={true}
      onDismiss={() => console.log('dismissed')}
      date={date}
      onConfirm={onConfirm}
    /> */}
                </View>

                
            )}

            <FlatList
                data={ventas}
                keyExtractor={(venta) => venta.id.toString()}
                renderItem={({ item }) => (
                   // console.log("item en flatlist: "+item.fecha),
                    <VentasItem
                        venta={item}
                        isExpanded={item.id === expandedId}
                        onPress={() => handlePress(item.id)}
                        
                    />
                    
                )}
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
