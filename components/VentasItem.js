import { View, Text, StyleSheet, TouchableOpacity } from "react-native";




function VentasItem({ venta, isExpanded, onPress }) {

    function formatFechaHora(fechaISO) {
    const fecha = new Date(fechaISO);

    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const mesesAño = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const diaSemana = diasSemana[fecha.getDay()];
    const mes = mesesAño[fecha.getMonth()];
    const dia = fecha.getDate().toString().padStart(2, '0');
    const año = fecha.getFullYear();

    let horas = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const periodo = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12;

    return {
        fecha: `${diaSemana}, ${dia} ${mes} ${año}`,
        hora: `${horas}:${minutos} ${periodo}`,
    };
}

const { fecha, hora } = formatFechaHora(venta.fecha);




    return (
        <TouchableOpacity onPress={onPress} style={styles.itemContainer}>
            <View>
                <Text style={styles.column}>Sabor: {venta.sabor}</Text>
                <Text style={styles.column}>Venta: ${venta.venta_helado}</Text>
            </View>
            {isExpanded && (
                <View style={styles.expandedContent}>
                    <Text style={styles.column}>Unidades: {venta.cantidad}</Text>
                    <Text style={styles.column}>Precio: ${venta.precio_helado}</Text>
                    {/* <Text style={styles.column}>Fecha: {fecha + " - " + hora}</Text> */}
                    <Text style={styles.column}>Vendedor: {venta.email}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    column: {
        fontSize: 16,
        marginBottom: 5,
    },
    expandedContent: {
        backgroundColor: "#ccc",
    }
});

export default VentasItem;

