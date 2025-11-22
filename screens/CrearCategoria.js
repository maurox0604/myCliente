import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";

export default function CrearCategoria({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  const crearCategoria = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre de la categoría es obligatorio");
      return;
    }

    setLoading(true);

    try {
        // 🔥 URL del backend
        console.log("API:", process.env.EXPO_PUBLIC_API_URL);
      //const API = process.env.EXPO_PUBLIC_API_URL;

      const response = await fetch(`https://backend-de-prueba-delta.vercel.app/categorias/create`,{

      // const response = await fetch(`${API}/categorias/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      const data = await response.json();

      if (!data.ok) throw new Error(data.error || "Error al guardar categoría");

      Alert.alert(
        "¡Categoría creada!",
        `Se agregó la categoría "${nombre}".`,
        [
          {
            text: "Continuar creando productos",
            onPress: () => navigation.replace("CrearProducto"), // 🔥 Ruta correcta
          },
          {
            text: "Volver",
            onPress: () => navigation.goBack(),
            style: "cancel",
          }
        ]
      );

      setNombre("");

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "No se pudo crear la categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Categoría</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la categoría"
        autoCapitalize="words"
        value={nombre}
        onChangeText={setNombre}
      />

      <TouchableOpacity style={styles.btn} onPress={crearCategoria} disabled={loading}>
        <Text style={styles.btnText}>
          {loading ? "Guardando..." : "Guardar Categoría"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 35 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    fontSize: 18,
    padding: 15,
    marginBottom: 25,
  },
  btn: {
    backgroundColor: "#e91e63",
    padding: 18,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});
