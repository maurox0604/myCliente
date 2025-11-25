import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// 🔥 Cargar variables de entorno
const API = process.env.EXPO_PUBLIC_API_URL;

export default function CreaHeladoScreen({ navigation }) {
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [idCategoria, setIdCategoria] = useState(null);
    const [imagenLocal, setImagenLocal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState([]);

    // 🔹 1. Traer categorías para mostrarlas en un selector
    useEffect(() => {
        fetch(API + "/categorias/all")
        .then((res) => res.json())
        .then((data) => setCategorias(data.categorias))
        .catch(() => Alert.alert("Error", "No se pudieron cargar las categorías"));
    }, []);

    // 🔹 2. Seleccionar imagen desde galería
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.6,
        base64: true,
        });

        if (!result.canceled) {
        setImagenLocal(result.assets[0].base64);
        }
    };

    // 🔹 3. Guardar producto (sube imagen → luego crea producto)
    const guardarProducto = async () => {
        if (!nombre || !precio || !cantidad || !idCategoria || !imagenLocal) {
        Alert.alert("Error", "Todos los campos son obligatorios");
        return;
        }

        setLoading(true);

        try {
        // 🟢 SUBIR IMAGEN A freeimage.host
        const imgForm = new FormData();
        imgForm.append("source", imagenLocal);
        imgForm.append("type", "base64");
        imgForm.append("action", "upload");
        imgForm.append("key", process.env.EXPO_PUBLIC_IMAGE_API_KEY); // 🔑 tu API key de freeimage.host

        const uploadResp = await fetch("https://freeimage.host/api/1/upload", {
            method: "POST",
            body: imgForm,
        });

        const uploadJSON = await uploadResp.json();
        const imageURL = uploadJSON.image.url; // URL final para guardar en BD

        // 🟢 GUARDAR PRODUCTO EN BACKEND
        const saveResp = await fetch(API + "/productos/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            nombre,
            precio,
            cantidad,
            id_categoria: idCategoria,
            imagen: imageURL,
            }),
        });

        const responseData = await saveResp.json();

        if (!responseData.ok) throw new Error();

        Alert.alert(
            "Producto creado",
            `"${nombre}" se guardó correctamente`,
            [
            { text: "Crear otro", onPress: () => resetForm() },
            { text: "Volver", onPress: () => navigation.goBack() },
            ]
        );
        } catch (err) {
        Alert.alert("Error", "No se pudo crear el producto");
        } finally {
        setLoading(false);
        }
    };

    const resetForm = () => {
        setNombre("");
        setPrecio("");
        setCantidad("");
        setImagenLocal(null);
        setIdCategoria(null);
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Nuevo Producto</Text>

        <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
        <TextInput style={styles.input} placeholder="Precio" keyboardType="numeric" value={precio} onChangeText={setPrecio} />
        <TextInput style={styles.input} placeholder="Cantidad" keyboardType="numeric" value={cantidad} onChangeText={setCantidad} />

        {/* Selector de categoría (simple por ahora) */}
        <Text style={{ marginTop: 8, fontWeight: "bold" }}>Categoría</Text>
        {categorias.map((cat) => (
            <TouchableOpacity key={cat.id} onPress={() => setIdCategoria(cat.id)}>
            <Text style={[
                styles.categoria,
                idCategoria === cat.id && styles.categoriaActive
            ]}>
                {cat.nombre}
            </Text>
            </TouchableOpacity>
        ))}

        {/* Imagen */}
        <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
            <Text style={styles.imgBtnTxt}>Seleccionar Imagen</Text>
        </TouchableOpacity>

        {imagenLocal && (
            <Image
            source={{ uri: `data:image/jpeg;base64,${imagenLocal}` }}
            style={{ width: 150, height: 150, alignSelf: "center", marginTop: 10 }}
            />
        )}

        <TouchableOpacity style={styles.btnGuardar} onPress={guardarProducto} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Guardar</Text>}
        </TouchableOpacity>
        </View>
    );
}

// 🎨 Estilos
const styles = StyleSheet.create({
    container: { flex: 1, padding: 25 },
    title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, fontSize: 18, padding: 12, marginBottom: 10 },
    imgBtn: { backgroundColor: "#333", padding: 12, borderRadius: 10, marginTop: 10 },
    imgBtnTxt: { color: "#fff", textAlign: "center", fontWeight: "bold" },
    btnGuardar: { backgroundColor: "#e91e63", padding: 18, borderRadius: 10, marginTop: 25 },
    btnText: { color: "#fff", textAlign: "center", fontSize: 18, fontWeight: "bold" },
    categoria: { padding: 10, borderWidth: 1, borderColor: "#aaa", borderRadius: 8, marginTop: 5 },
    categoriaActive: { backgroundColor: "#e91e63", color: "#fff", borderColor: "#e91e63" },
});








// import React from 'react';
// // import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
// import { useContext, useState } from 'react';
// import { StyleSheet, Text, View, FlatList, SafeAreaView } from "react-native"; 
// import InputHelado from '../components/InputHelado';
// import * as ImagePicker from 'expo-image-picker';
// // import { DbaseContext } from '../context/DbaseContext'



// const CreaHeladoScreen = () => {
//     return (
//         <View>
//         <Text>Este es settings</Text>
//             <SafeAreaView style={styles.container}> 
//                 <InputHelado />
//             </SafeAreaView>
//         </View>
//     )
// }
// export default CreaHeladoScreen;

// const styles = StyleSheet.create({})
