import React, { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Dimensions, Text, TextInput, StyleSheet, View, TouchableHighlight, KeyboardAvoidingView, Platform, Keyboard, Alert, Animated, TouchableOpacity } from "react-native";

export default function InputHelado() {
    const [showEmojies, setShowEmojies] = useState(false);
    const [messageBody, setMessageBody] = useState("");
    const [sabor, setSabor] = useState("");
    const [precio, setPrecio] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [foto, setFoto] = useState(null);  // Inicializa con null
    const [fadeAnim] = useState(new Animated.Value(0.1));

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setShowEmojies(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        });

        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setShowEmojies(false);
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }).start();
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    // Función para seleccionar la imagen
    const openBrowserImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFoto(result.assets[0].uri);  // Actualiza la URI de la foto seleccionada
        }
    };

    const guardarHelado = async () => {
        try {
            const formData = new FormData();
            formData.append('sabor', sabor);
            formData.append('precio', precio);
            formData.append('cantidad', cantidad);

            if (foto) {
                const filename = foto.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('icon', { uri: foto, name: filename, type });
            }

            const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error desconocido');
                } else {
                    const errorText = await response.text();
                    throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
                }
            }

            const data = await response.json();
            console.log("Los datos enviados: ", data);
            Alert.alert('Éxito', 'Helado guardado correctamente');
        } catch (error) {
            console.error('Error al guardar el helado:', error);
            Alert.alert('Error', `No se pudo guardar el helado: ${error.message}`);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.container}>
                {showEmojies && (
                    <Animated.View style={[styles.emojiesContainer, { opacity: fadeAnim }]}>
                        {/* Emojis u otros componentes pueden ir aquí */}
                    </Animated.View>
                )}

                <Animated.View style={[styles.fadingContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.fadingText}>Fading View!</Text>
                </Animated.View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.containerTextInput}
                        placeholder="Sabor"
                        onChangeText={setSabor}
                        defaultValue={sabor}
                    />
                    <TextInput
                        style={styles.containerTextInput}
                        placeholder="Precio"
                        onChangeText={setPrecio}
                        keyboardType="numeric"
                        defaultValue={precio}
                    />
                    <TextInput
                        style={styles.containerTextInput}
                        placeholder="Cantidad"
                        onChangeText={setCantidad}
                        keyboardType="numeric"
                        defaultValue={cantidad}
                    />
                </View>

                <TouchableOpacity onPress={openBrowserImage}>
                    <Text style={{ fontWeight: "800", fontSize: 15, textAlign: "center", color: "white" }}>
                        Cargar foto
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={guardarHelado} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 0.2,
        borderTopColor: "#00000030",
        alignItems: "baseline",
    },
    emojiesContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
        paddingLeft: 10,
        marginVertical: 10,
    },
    inputContainer: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    containerTextInput: {
        width: windowWidth - 100,
        borderWidth: 1,
        borderRadius: 30,
        minHeight: 45,
        paddingHorizontal: 15,
        paddingTop: 8,
        fontSize: 16,
        paddingVertical: 5,
        borderColor: "lightgray",
        backgroundColor: "#fff",
        marginBottom: 5,
        fontWeight: "600",
    },
    saveButton: {
        backgroundColor: "purple",
        padding: 10,
        alignSelf: "center",
        borderRadius: 10,
    },
    saveButtonText: {
        fontWeight: "800",
        fontSize: 15,
        textAlign: "center",
        color: "white",
    },
});

