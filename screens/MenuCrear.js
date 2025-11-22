import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function MenuCrear({ navigation }) {
    return (
        <View style={styles.container}>
        <Text style={styles.title}>¿Qué deseas agregar?</Text>

        <TouchableOpacity 
            style={styles.btn} 
            onPress={() => navigation.navigate("CrearCategoria")}
        >
            <Text style={styles.btnText}>🗂 Nueva Categoría</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.btn} 
            onPress={() => navigation.navigate("CrearProducto")}
        >
            <Text style={styles.btnText}>🍨 Nuevo Producto</Text>
        </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, justifyContent: "center", alignItems: "center", padding: 20 
        
    },
        title: {
            fontSize: 22, fontWeight: "bold", marginBottom: 40 
        
    },
        btn: {
            width: "80%", padding: 18, borderRadius: 10, backgroundColor: "#e91e63", marginBottom: 20 
        
    },
        btnText: {
            fontSize: 18, color: "#fff", textAlign: "center", fontWeight: "bold" 
        
    }
});
