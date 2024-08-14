import React, { useEffect, useState } from "react";
import { Dimensions, Text, TextInput, StyleSheet, View, TouchableHighlight, KeyboardAvoidingView, Platform, Keyboard, Pressable, Alert,
    Animated,// Anima la ventana modal
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";


// export default function InputHelado({ todos, setTodos }) {
    export default function InputHelado() {
    const [showEmojies, setShowEmojies] = useState(false);// Oculta emojis al mostrar u pcultar el keyboard
    const [messageBody, setMessageBody] = useState("");// Campo input
    const [sabor, setSabor] = useState("");// Campo input
    const [precio, setPrecio] = useState("");// Campo input
    const [cantidad, setCantidad] = useState("");// Campo input
    const [foto, setFoto] = useState("../assets/images/helados/Icon_App.png");// Campo Uri Foto
    const [fadeAnim] = useState(new Animated.Value(0.1));// Anima el modal

    useEffect(() => {
       // const pruebaKeyB = Keyboard.addListener("keyboardDidShow", () => alert('keyboardDidShow'));
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            alert('♥ Mostrando keyboardDidShow');
            setShowEmojies(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
            console.log('♥ showEmojies:', showEmojies);
        });


        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            alert('♦Teclado oculto');
            setShowEmojies(false);
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }).start();
            console.log('♦ showEmojies:', showEmojies)
        });

    return () => {
        showSubscription.remove();
        hideSubscription.remove();
       // pruebaKeyB.remove();
    };
    }, []);

    // const handleSubmit = async () => {
    //     if (sabor === "") {
    //         return;
    //     } else {
    //         const response = await fetch("http://192.168.1.11:8000/helados", {
    //             headers: {
    //                 "x-api-key": "abcdef123456",
    //                 "Content-Type": "application/json",
    //             },
    //             method: "POST",
    //             body: JSON.stringify({
    //             // user_id: 1,
    //             // title: messageBody,
    //             sabor:sabor,
    //             precio:precio,
    //             cantidad:cantidad,
    //             foto:foto,
    //             }),
    //         });
    //         console.log(response.data); // Aquí puedes manejar la respuesta como lo necesites
    //         Alert.alert('Éxito', 'Helado guardado correctamente');

    //     const newTodo = await response.json();
    //     setTodos([...todos, { ...newTodo, shared_with_id: null }]);
    //     Keyboard.dismiss();// Cierra el keyboard
    //     setMessageBody("");// Limpia el input
    //     setCantidad("");
    //     setSabor("");
    //     setPrecio("");
    //     }
    // };


    // const guardarHelado = async () => {
    //     console.log("voy a guardar: ",sabor," - ",precio," - ",cantidad,"-",foto)
    //     try {
    //       //const response = await axios.post('http://192.168.1.11:8000/helados', {
    //         const response = await fetch("http://192.168.1.11:8000/helados", {
    //             headers: {
    //                 // "x-api-key": "abcdef123456",
    //                 "Content-Type": "application/json",
    //             },
    //             method: "POST",
    //             body: JSON.stringify({
    //                     sabor:sabor,
    //                     precio:precio,
    //                     icon:"url foto",
    //                     cantidad:cantidad
    //                 }),
    //         });
    //             console.log("Los dato fetch a enviar: ",response.data); // Aquí puedes manejar la respuesta como lo necesites
    //             Alert.alert('Éxito', 'Helado guardado correctamente');
    //       // Aquí podrías limpiar los campos o hacer otra acción después de guardar
    //     } catch (error) {
    //       console.error('Error al guardar el helado:', error);
    //       Alert.alert('Error', 'No se pudo guardar el helado');
    //     }
    //   };


    const guardarHelado = async () => {
        try {
        //   const response = await fetch("http://192.168.1.11:8000/helados", {
            const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados`, {
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              sabor: sabor,
              precio: precio,
              icon: foto,
              cantidad: cantidad,
            }),
          });
      
          if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const errorData = await response.json();
              if (errorData.error) {
                throw new Error(errorData.error);
              }
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
      
      
      

    const RenderEmoji = ({ emoji }) => {
        return (
            <TouchableHighlight
                activeOpacity={1}
                underlayColor={"transparent"}
                onPress={() => {
                setMessageBody(messageBody + emoji);
            }}
            >
            {/* <Text>Esto es una prueba</Text> */}
            <Text style={styles.emoji}>{emoji}</Text>
            </TouchableHighlight>
        );
    };

    return (
        // El KeyboardAvoidingView muestra el KB debajo del input text
        <KeyboardAvoidingView  
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                {showEmojies && (
                <Animated.View
                    style={[
                    styles.emojiesContainer,
                    {
                        opacity: fadeAnim,
                    },
                    ]}
                    >
                    {/* <RenderEmoji emoji="✅" />
                    <RenderEmoji emoji="🚨" />
                    <RenderEmoji emoji="📝" />
                    <RenderEmoji emoji="🎁" />
                    <RenderEmoji emoji="🛒" />
                    <RenderEmoji emoji="🎉" />
                    <RenderEmoji emoji="🏃🏻‍♂️" /> */}
                </Animated.View>
                )}

                <Animated.View
                    style={[
                    styles.fadingContainer,
                    {
                        // Bind opacity to animated value
                        opacity: fadeAnim,
                    },
                    ]}>
                    <Text style={styles.fadingText}>Fading View!</Text>
                </Animated.View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.containerTextInput}
                        placeholder="Sabor"
                        scrollEnabled={true}
                        onChangeText={setSabor}
                        defaultValue={sabor}
                    />
                    <TextInput
                        style={styles.containerTextInput}
                        placeholder="Precio"
                        scrollEnabled={true}
                        onChangeText={setPrecio}
                        defaultValue={precio}
                    />
                    <TextInput
                        style={styles.containerTextInput}
                        placeholder="cantidad"
                        scrollEnabled={true}
                        onChangeText={setCantidad}
                        defaultValue={cantidad}
                    />
                </View>

                <View>
                    <MaterialCommunityIcons
                        name="camera"
                        size={40}
                        color={messageBody ? "black" : "#00000050"}
                        style={{ paddingLeft: 5 }}
                        // onPress={handleSubmit}
                    />
                    <TouchableOpacity
                        onPress={guardarHelado}
                            style={{
                                backgroundColor: "purple",
                                padding:10,
                                alignSelf:"center",
                                borderRadius:10,
                            }}
                            >
                        <Text
                            style={{
                                fontWeight: "800",
                                fontSize: 15,
                                textAlign:"center",
                                color:"white"
                            }}
                        >
                            Guardar
                        </Text>
                    </TouchableOpacity>
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
    emoji: {
        fontSize: 25,
        paddingVertical: 5,
        marginRight: 10,
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
});