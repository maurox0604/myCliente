import { useContext, useEffect, useState, useCallback } from "react";
import {
  Dimensions, Text, Button, TextInput, StyleSheet, View, Image,
  KeyboardAvoidingView, Platform, Keyboard, Alert, Animated, TouchableOpacity
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome5 } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";
import { DbaseContext } from "../context/DbaseContext";
import { Dropdown } from "react-native-element-dropdown";
import { useFocusEffect } from "@react-navigation/native";

export default function InputHelado() {
    const [showEmojies, setShowEmojies] = useState(false);
    const [sabor, setSabor] = useState("");
    const [precio, setPrecio] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false); // ⬅ para evitar doble guardado mientras sube
    const [categorias, setCategorias] = useState([]);
    const [idCategoria, setIdCategoria] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0.1));

    const { fetchHelados } = useContext(CartContext);
    const { regCambios } = useContext(DbaseContext);

  /* ⬇⬇ Cargar categorías desde el servidor al abrir pantalla */
    useFocusEffect(
        useCallback(() => {
            console.log("ruta categorias: ", process.env.EXPO_PUBLIC_API_URL)
            fetch(process.env.EXPO_PUBLIC_API_URL + "/categorias")
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        setCategorias(data.categorias.map(c => ({
                            label: c.nombre,
                            value: c.id
                        })));
                    }
                })
                .catch(err => console.log("Error obteniendo categorías:", err));
        }, [])
    );


  /* ⬇⬇ Animación opcional del teclado */
    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
        setShowEmojies(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        });

        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
        setShowEmojies(false);
        Animated.timing(fadeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }).start();
        });

        return () => {
        showSubscription.remove();
        hideSubscription.remove();
        };
    }, []);

  /* ⬇⬇ Abrir galería para elegir imagen */
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
        alert("Se requieren permisos para acceder a la galería");
        return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        });

        if (!result.canceled) {
        setSelectedImage(result.assets[0]); // ⬅ guardamos info de la imagen
        }
    };

  /* ⬇⬇ Subir imagen a freeimage.host y devolver la URL pública */
    const uploadImageToFreeImageHost = async () => {
        const apiKey = "TU_API_KEY_DE_FREEIMAGE_HOST"; // ⚠ REEMPLAZAR

        const formData = new FormData();
        formData.append("source", {
        uri: selectedImage.uri,
        name: "helado.jpg",
        type: "image/jpeg",
        });
        formData.append("key", apiKey);
        formData.append("format", "json");

        const res = await fetch("https://freeimage.host/api/1/upload", {
        method: "POST",
        body: formData,
        });

        const data = await res.json();
        return data?.image?.url || null;
    };

  /* ⬇⬇ Guardar helado (automáticamente sube imagen primero si existe) */
    const guardarHelado = async () => {
        if (loading) return; // previene toques repetidos
        if (!sabor || !precio || !cantidad || !idCategoria) {
        Alert.alert("Campos incompletos", "Llena todos los campos antes de guardar");
        return;
        }

        setLoading(true);

        try {
        let iconUrl = "";

        // ⭐ Si el usuario seleccionó una imagen, primero subirla
        if (selectedImage) {
            iconUrl = await uploadImageToFreeImageHost();

            if (!iconUrl) {
            Alert.alert("Error", "Falló la subida de imagen, intenta nuevamente");
            setLoading(false);
            return;
            }
        }

      // 🔥 Ahora guardar helado en backend
        const res = await fetch(process.env.EXPO_PUBLIC_API_URL + "/createHelados", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            sabor,
            precio,
            cantidad,
            icon: iconUrl,  // ⬅ se guarda URL pública
            id_categoria: idCategoria,
            }),
        });

        await res.json();

        regCambios(true);
        fetchHelados(); // refresca lista global

        Alert.alert("¡Éxito!", "Helado guardado correctamente");
        setSabor(""); setPrecio(""); setCantidad(""); setSelectedImage(null); setIdCategoria(null);
        } catch (error) {
        Alert.alert("Error", "No se pudo guardar el helado");
        console.log(error);
        }

        setLoading(false);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.container}>

            {/* Campos del formulario */}
            <View style={styles.inputContainer}>
            <View style={styles.campos}>
                <FontAwesome5 name="ice-cream" style={styles.iconos} />
                <TextInput style={styles.containerTextInput} placeholder="Sabor" value={sabor} onChangeText={setSabor} />
            </View>

            <View style={styles.campos}>
                <FontAwesome5 name="dollar-sign" style={styles.iconos} />
                <TextInput style={styles.containerTextInput} placeholder="Precio" value={precio} keyboardType="numeric" onChangeText={setPrecio} />
            </View>

            <View style={styles.campos}>
                <FontAwesome5 name="calculator" style={styles.iconos} />
                <TextInput style={styles.containerTextInput} placeholder="Cantidad" value={cantidad} keyboardType="numeric" onChangeText={setCantidad} />
            </View>
            </View>

            {/* Selección de imagen */}
            <TouchableOpacity onPress={pickImage}>
            <Text style={styles.saveButtonText}>📷 Seleccionar imagen</Text>
            </TouchableOpacity>
            {selectedImage && (
            <Image source={{ uri: selectedImage.uri }} style={{ width: 150, height: 150, marginTop: 10 }} />
            )}

            {/* Dropdown de categorías */}
            <Dropdown
            style={[styles.dropdown, isFocus && { borderColor: "#e91e63" }]}
            data={categorias}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? "Selecciona categoría" : "..."}
            search
            value={idCategoria}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
                setIdCategoria(item.value);
                setIsFocus(false);
            }}
            />

            {/* Botón guardar */}
            <TouchableOpacity onPress={guardarHelado} style={styles.saveButton} disabled={loading}>
            <Text style={styles.saveButtonText}>
                {loading ? "Guardando..." : "Guardar"}
            </Text>
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
    );
    }

const windowWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
    container: { borderTopWidth: 0.2, borderTopColor: "#00000030", alignItems: "baseline" },
    inputContainer: { width: "100%", alignItems: "center", justifyContent: "center" },
    containerTextInput: {
        width: windowWidth - 10, borderWidth: 1, borderRadius: 30, minHeight: 45,
        paddingHorizontal: 15, fontSize: 16, backgroundColor: "#fff", marginBottom: 5, marginLeft: 8,
    },
    campos: { flexDirection: "row", alignItems: "center", height: 60, marginBottom: 32, width: "100%" },
    iconos: { color: "#01abea", borderWidth: 1, borderColor: "#01abea", borderRadius: 20, padding: 10, width: "21%", fontSize: 24 },
    saveButton: { backgroundColor: "purple", padding: 13, alignSelf: "center", borderRadius: 10, width: windowWidth - 60 },
    saveButtonText: { color: "white", textAlign: "center", fontWeight: "800", fontSize: 16 },
    dropdown: { height: 55, borderColor: "#ccc", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginTop: 20, width: windowWidth - 40 },
});
