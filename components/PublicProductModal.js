import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Linking from "expo-linking";
import { usePublicCart } from "../context/PublicCartContext";

export default function PublicProductModal({ visible, producto, onClose }) {
    const scale = useRef(new Animated.Value(0.9)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    
    const { addItem } = usePublicCart();
    const [cantidad, setCantidad] = useState(1);


    useEffect(() => {
        if (visible) {
        Animated.parallel([
            Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            }),
            Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
            }),
        ]).start();
        }
    }, [visible]);
        
        // Función para abrir WhatsApp con un mensaje predefinido
        const enviarWhatsApp = () => {
        const mensaje = `Hola 👋, me interesa el producto: ${producto.nombre}`;
        const url = `https://wa.me/573182091329?text=${encodeURIComponent(mensaje)}`;
        Linking.openURL(url);
        };

    if (!producto) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
            <Animated.View
                style={[
                    styles.container,
                    { transform: [{ scale }], opacity },
                ]}
                >
                    {/* HEADER */}
                    <View style={styles.header}>                             
                        {/* <Pressable onPress={onClose} hitSlop={10}> */}
                        {/* <View>
                            <Text style={styles.title}>{producto.nombre}</Text>
                        </View>  */}
                        <Pressable onPress={onClose} hitSlop={10}>
                            <Text style={styles.close}>✕</Text>
                        </Pressable>               
                    </View>

                    <Image
                        source={{ uri: producto.icon }}
                        style={styles.image}
                        resizeMode="contain"
                    />

                    <Text style={styles.title}>{producto.nombre}</Text>
                    
                    <Pressable
                        onPress={() => {
                            addItem(producto, cantidad);
                            onClose();
                        }}
                        style={styles.whatsapp}
                    >
                        <Text style={styles.addText}>Agregar al pedido</Text>
                    </Pressable>

            {/* WhatsApp (futuro pedido) */}
            
            {/* <Pressable style={styles.whatsapp}>
                <Text style={styles.whatsappText}>Pedir por WhatsApp</Text>
            </Pressable> */}

            <Pressable onPress={onClose} style={styles.close}>
                <Text>Cerrar</Text>
            </Pressable>
            </Animated.View>
        </View>
        </Modal>
    );
    }

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    container: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
    },

    image: {
        width: "100%",
        height: 260,
        borderRadius: 12,
    },

    title: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },

    whatsapp: {
        marginTop: 20,
        backgroundColor: "#25D366",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
    },

    whatsappText: {
        color: "#fff",
        fontWeight: "700",
        },
    
        addText: {
            color: "#fff",
        fontWeight: "700",
        },

    close: {
        marginTop: 15,
    },
    
    header: {
        flex: 1,
        // flexDirection: "row",
        width: "100%",
        // justifyContent: "",
        alignItems: "right",
        padding: 16,
        borderBottomWidth: 1,
        borderColor: "#ff0000",
        justifyContent: "space-between",
        alignItems: "center",
        },
});
