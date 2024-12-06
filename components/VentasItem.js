import { View, Text, StyleSheet } from "react-native";

function VentasItem({ venta }) {
    return (
        <View style={styles.itemContainer}>
            <Text style={styles.column}>Producto: {venta.sabor}</Text>
            <Text style={styles.column}>Precio: ${venta.precio_helado}</Text>
            <Text style={styles.column}>Unidades: {venta.cantidad}</Text>
            <Text style={styles.column}>Total: ${venta.venta_helado}</Text>
            <Text style={styles.column}>Fecha: {venta.fecha}</Text>
            {/* <Text style={styles.column}>Vendedor: {venta.vendedor}</Text> */}
            <Text style={styles.column}>Vendedor: {venta.email}</Text>
        </View>
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
});

export default VentasItem;

