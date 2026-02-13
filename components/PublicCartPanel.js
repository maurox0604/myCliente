import { View, Text, Pressable, Animated, StyleSheet, Dimensions, ScrollView, Easing, Platform, Linking } from "react-native";
// import { ScrollView } from "react-native-gesture-handler";
import { useEffect, useRef } from "react";
import { usePublicCart } from "../context/PublicCartContext";
import Alert from '@blazejkustra/react-native-alert';

export default function PublicCartPanel({ visible, onClose, screenHeight }) {

    const { items, total, updateCantidad, clearCart } = usePublicCart();
    
    const SCREEN_HEIGHT = Dimensions.get("window").height;
    const animation = useRef(new Animated.Value(0)).current;

    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [screenHeight * 0.7, 0],
    });


    useEffect(() => {
        Animated.timing(animation, {
            toValue: visible ? 1 : 0,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [visible]);


    const sendToWhatsApp = async () => {
        const mensaje = items
            .map(i => `• ${i.nombre} x${i.cantidad}`)
            .join("\n");

        // const url = `https://wa.me/573182091329?text=${encodeURIComponent(
        //     `Hola 👋, quisiera pedir:\n\n${mensaje}\n\nTotal: $${total.toLocaleString()}`
        // )}`;

        // Linking.openURL(url);


        const texto = encodeURIComponent(
        `Hola 👋, quisiera pedir:\n\n${mensaje}\n\nTotal: $${total.toLocaleString()}`
            );

        const phone = "573182091329";

        const appUrl = `whatsapp://send?phone=${phone}&text=${texto}`;
        const webUrl = `https://wa.me/${phone}?text=${texto}`;
        
        // Intentar abrir la app de WhatsApp
        if (Platform.OS !== "web") {
            // Android / iOS (APK futura)
            const supported = await Linking.canOpenURL(appUrl);
            if (supported) {
            Linking.openURL(appUrl);
            return;
            }
        }

        // Web o fallback
        Linking.openURL(webUrl);
    };

    // Función para confirmar el envío del pedido por WhatsApp
    const confirmWhatsApp = () => {
        if (items.length === 0) {
            Alert.alert("Carrito vacío", "Agrega productos antes de enviar el pedido.");
            return;
        }

        const resumen = items
            .map(i => `• ${i.nombre} x${i.cantidad}`)
            .join("\n");

        Alert.alert(
            "Confirmar pedido",
            `${resumen}\n\nTotal: $${total.toLocaleString()}`,
            [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Enviar por WhatsApp",
                onPress: sendToWhatsApp,
            },
            ]
        );
    };



/*
    // Función para manejar el envío del pedido por WhatsApp
    const handleWhatsApp = () => {
        const mensaje = items
            .map(
            i =>
                `• ${i.nombre} x${i.cantidad} = $${(
                i.precio * i.cantidad
                ).toLocaleString()}`
            )
            .join("\n");

        const textoFinal =
            `🛒 Pedido Ice Queen\n\n` +
            mensaje +
            `\n\nTotal: $${total.toLocaleString()}`;

        const url = `https://wa.me/573182091329?text=${encodeURIComponent(
            textoFinal
        )}`;

        // 🌐 WEB
        if (Platform.OS === "web") {
            const ok = window.confirm(textoFinal + "\n\n¿Enviar por WhatsApp?");
            if (ok) {
            window.open(url, "_blank");
            }
            return;
        }

        // 📱 MÓVIL
        Alert.alert(
            "Confirmar pedido",
            textoFinal,
            [
            { text: "Cancelar", style: "cancel" },
            { text: "Enviar", onPress: () => Linking.openURL(url) },
            ],
            { cancelable: true }
        );
    };
    */
    
// Función para confirmar el vaciado del carrito
    const confirmClearCart = () => {
        Alert.alert(
            "Vaciar carrito",
            "¿Seguro que deseas eliminar todos los productos?",
            [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Vaciar",
                style: "destructive",
                onPress: clearCart,
            },
            ]
        );
    };





    if (!visible) return null;
    if (items.length === 0) return null;


    return (
        <Animated.View
        style={[
            styles.panel,
            { transform: [{ translateY }] },
        ]}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>🛒 Tu pedido</Text>
                    <Text style={styles.subtitle}>Revisa antes de enviar</Text>
                </View>

                <Pressable onPress={onClose} hitSlop={10}>
                    <Text style={styles.close}>✕</Text>
                </Pressable>
            </View>

            {/* LISTADO */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                >
                {items.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.nombre}</Text>

                        <View style={styles.qtyBox}>
                            <Pressable
                            style={styles.qtyBtn}
                            onPress={() => updateCantidad(item.id, item.cantidad - 1)}
                            >
                            <Text style={styles.qtyText}>−</Text>
                            </Pressable>

                            <Text style={styles.qtyValue}>{item.cantidad}</Text>

                            <Pressable
                            style={styles.qtyBtn}
                            onPress={() => updateCantidad(item.id, item.cantidad + 1)}
                            >
                            <Text style={styles.qtyText}>+</Text>
                            </Pressable>
                        </View>

                        <Text style={styles.itemPrice}>
                            ${(item.precio * item.cantidad).toLocaleString()}
                        </Text>
                    </View>
                ))}
            </ScrollView>


            {/* FOOTER FIJO */}
            <View style={styles.footer}>
                <Pressable onPress={confirmClearCart} style={styles.clearBtn}>
                    <Text style={styles.clearText}>Vaciar carrito</Text>
                </Pressable>

                <Text style={styles.total}>
                    Total: ${total.toLocaleString()}
                </Text>

                <Pressable style={styles.whatsappBtn} onPress={confirmWhatsApp}>
                    <Text style={styles.whatsappText}>
                    Enviar pedido por WhatsApp
                    </Text>
                </Pressable>
            </View>

            </Animated.View>
    );
}


const styles = StyleSheet.create({
    panel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "65%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 20,
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },

    header: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: "#eee",
        flexDirection: "row",
        alignItems: "end",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },

    title: {
        fontSize: 17,
        fontWeight: "700",
    },

    subtitle: {
        fontSize: 13,
        color: "#777",
    },
    close: {
    fontSize: 22,
    paddingHorizontal: 8,
    },
    list: {
        flex: 1,
        paddingHorizontal: 16,
    },
    whatsappBox: {
        padding: 16,
        borderTopWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fff",
    },

    whatsappBtn: {
        backgroundColor: "#25D366",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    whatsappText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    total: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 13,
        color: "#666",
    },

    itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    },
    itemName: {
    flex: 1,
    fontSize: 15,
    },
    itemQty: {
    width: 40,
    textAlign: "center",
    color: "#555",
    },
    itemPrice: {
    fontWeight: "600",
    },

    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fff",
    },

    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#ccc",
        alignSelf: "center",
        marginVertical: 8,
    },

    qtyBox: {
        flexDirection: "row",
        alignItems: "center",
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#eee",
        alignItems: "center",
        justifyContent: "center",
    },
        qtyText: {
        fontSize: 18,
        fontWeight: "600",
    },
    qtyValue: {
        marginHorizontal: 8,
        fontSize: 15,
        fontWeight: "600",
    },

    clearBtn: {
    alignSelf: "flex-end",
    marginBottom: 8,
    },

    clearText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "500",
    },


});

