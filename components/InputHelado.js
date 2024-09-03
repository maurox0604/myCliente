import React, { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Dimensions, Text, Button, TextInput, StyleSheet, View, Image, KeyboardAvoidingView, Platform, Keyboard, Alert, Animated, TouchableOpacity } from "react-native";

export default function InputHelado() {
    const [showEmojies, setShowEmojies] = useState(false);
    const [messageBody, setMessageBody] = useState("");
    const [sabor, setSabor] = useState("");
    const [precio, setPrecio] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [foto, setFoto] = useState(null);  // Inicializa con null
    const [fadeAnim] = useState(new Animated.Value(0.1));
    const [selectedImage, setSelectedImage] = useState(null);
    // const [image, setImage] = useState<string | null>(null);

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
            console.log("result.assets[0].uri: ", result.assets[0].uri)
            setFoto(result.assets[0].uri);  // Actualiza la URI de la foto seleccionada
            // setSelectedImage(result.assets[0].uri );
            setSelectedImage({ localUri: result.assets[0].uri });
            console.log("Foto: ", foto, "      selectedImage: ", selectedImage)
        }
    };

    const guardarHelado = async () => {
            console.log("................Foto: ", foto);
            console.log("................setSelectedImage: ", setSelectedImage.localUri);

            const formData = new FormData();
            formData.append('sabor', sabor);
            formData.append('precio', precio);
            formData.append('cantidad', cantidad);

            // if (foto) {
            //     // Asumiendo que `selectedImage` es un objeto de tipo File (o Blob)
            //     formData.append("icon", {
            //         uri: foto.uri,
            //         type: 'image/jpeg', // Ajusta según el tipo de tu imagen
            //         name: 'imagen.jpg', // Nombre de la imagen
            //     });
            // }
        
            try {
                const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados`, {
                // const response = await fetch(`http://192.168.1.11:3001/helados`, {
                method: 'POST',
                body: formData,
                headers: {
                    // 'Content-Type': 'multipart/form-data',
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

    const pickImage = async () => {
        // Solicita permisos para acceder a la galería de imágenes
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Se requieren permisos para acceder a las imágenes');
                return;
            }
        }

        

        // Abre la galería para seleccionar una imagen
        let result = await ImagePicker.launchImageLibraryAsync({
            // let result = await ImagePicker.launchImageLibrary({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
      
          console.log("++++++++++++      ++   : ",result);
      
          if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
          }

        if (!result.canceled) {
            // setSelectedImage(result.uri);
            console.log("1.enviando imagen: ", result)
             console.log("2.enviando imagen result.uri: ", result.assets[0].uri)
        }
        if (!result.canceled) {
           // setSelectedImage(result.assets[0]);
            console.log("3. enviando imagen: ", result.assets[0])
            console.log("4 .enviando imagen URI: ", result.assets[0].fileName)
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            alert('Por favor selecciona una imagen');
            return;
        }

        // const formData = new FormData();
        // formData.append('image', {
        //     uri: selectedImage,
        //     name: 'image.jpg',
        //     type: 'image/jpeg',
        // });

        const formData = new FormData();
    // formData.append('sabor', sabor);
    // formData.append('precio', precio);
    // formData.append('cantidad', cantidad);

    if (selectedImage) {
        // const filename = selectedImage.uri.split('/').pop();
        // const match = /\.(\w+)$/.exec(filename);
        // const type = match ? `image/${match[1]}` : `image`;

        formData.append('file', { 
            uri: selectedImage.uri, 
            name: selectedImage.fileName, 
            type: selectedImage.type 
        });
    }

    formData.append('array',JSON.stringify(Array));
        try {
            const response = await fetch('http://192.168.1.11:3001/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Imagen subida con éxito:', data.imageUrl);
                Alert.alert('Éxito', 'Imagen subida con éxito');
            } else {
                console.error('Error al subir la imagen:', response.statusText);
                Alert.alert('Error', 'Hubo un problema al subir la imagen');
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            Alert.alert('Error', 'Hubo un problema con la solicitud');
        }
    };


    // const pickImage = async () => {
    //     let result = await ImagePicker.launchImageLibraryAsync({
    //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //       allowsEditing: true,
    //       aspect: [4, 3],
    //       quality: 1,
    //     });
    
    //     if (!result.canceled) {
    //       setSelectedImage(result.assets[0].uri);
    //     }
    //   };
    
    //   const uploadImage = async () => {
    //     if (!selectedImage) {
    //       Alert.alert('Error', 'Por favor selecciona una imagen primero');
    //       return;
    //     }
    
    //     let filename = selectedImage.split('/').pop();
    //     let match = /\.(\w+)$/.exec(filename);
    //     let type = match ? `image/${match[1]}` : `image`;
    
    //     let formData = new FormData();
    //     formData.append('image', { uri: selectedImage, name: filename, type });
    
    //     try {
    //       const response = await fetch('http://192.168.1.11:3001/upload', {
    //         method: 'POST',
    //         body: formData,
    //         headers: {
    //           'Content-Type': 'multipart/form-data',
    //         },
    //       });
    
    //       if (!response.ok) {
    //         throw new Error(`Error HTTP: ${response.status}`);
    //       }
    
    //       const data = await response.json();
    //       console.log('Imagen subida:', data.filePath);
    //       Alert.alert('Éxito', 'Imagen subida correctamente');
    //     } catch (error) {
    //       console.error('Error al subir la imagen:', error);
    //       Alert.alert('Error', `No se pudo subir la imagen: ${error.message}`);
    //     }
    //   };


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
                    <Text style={styles.saveButtonText}>
                        Cargar foto
                    </Text>
                </TouchableOpacity>
{/* 
                <Image
                    source={{
                        uri:
                        selectedImage !== null 
                        ? selectedImage.localUri
                        : "https://picsum.photos/200/200",
                        }}
                    style={styles.img}
                    /> */}

                {/* {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />} */}

                <TouchableOpacity onPress={guardarHelado} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>

                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Button title="Seleccionar Imagen" onPress={pickImage} />
            {selectedImage && (
                <Image
                    source={{ uri: selectedImage.uri }}
                    style={{ width: 200, height: 200, marginTop: 20 }}
                />
            )}
            <Button title="Subir Imagen" onPress={handleUpload} />
        </View>


                
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
    img:{
    width: 150,
    height: 150,
    resizeMode:"contain",
    zIndex: 1,
    position: "relative",
    top: 10
  },
});

