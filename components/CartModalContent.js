import { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import ItemCart from './ItemCart';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { HeladosContext } from '../context/HeladosContext';
import { useVentas } from '../context/VentasContext';
import { useSede } from '../context/SedeContext';
import { formatFechaVenta } from '../utils/formatFechaGlobal';





const CartModalContent = ({ closeModal }) => {

    const { emailUser } = useContext(AuthContext);
    const { carts, totalPrice, clearCart, calculateTotalPrice, cartItemCount } = useContext(CartContext);
    const { reloadHelados } = useContext(HeladosContext);
    const [isProcessing, setIsProcessing] = useState(false);
    // const { fechaVentaManual , activarVentaManual } = useVentas();
    // const [fechaVentaManual , setfechaVentaManual ] = useState(fechaVentaManual );
    const { fechaVentaManual  } = useContext(CartContext);


    const { sedeActiva } = useSede();


    useEffect(() => {
    calculateTotalPrice(carts);
}, [carts]);


// Función para formatear la fecha en formato local YYYY-MM-DD HH:mm:ss
    const formatLocalDateTime = (date) => {
        const pad = (n) => n.toString().padStart(2, "0");

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}
        ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const procesarCarrito = async () => {
        if (isProcessing) return; // 🔒 bloqueo duro
        setIsProcessing(true);

        try {
            console.log("CartModalContent/procesarCarrito fechaVentaManual : ", fechaVentaManual )
            setIsProcessing(true);
             // Formatear fecha según el caso
            const fechaFormateada = formatFechaVenta(fechaVentaManual);
            console.log("📦 carts SOLO :", carts);

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/ventas/procesar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: carts.map(item => ({ ...item, totVentaXhelado: item.precio * item.cantCompra, user: emailUser })),
                    fecha_manual:fechaFormateada,
                    id_sede: sedeActiva?.id || 1
                })
            });
        

            if (!response.ok) throw new Error(await response.text());

            clearCart();           // Vacía el carrito
            // await reloadHelados(); // Refresca la lista en toda la app
            closeModal();          // Cierra modal

        } catch (error) {
            console.error("Error procesando carrito:", error);
        } finally {
            setIsProcessing(false);
        }
    };

// FlatList renderItem optimizado
    const renderItem = useCallback(
  ({ item }) => <ItemCart {...item} />,
  []
);


    return (
        <SafeAreaView style={styles.contentContainer}>
            <View style={styles.contHeader}>
                            {fechaVentaManual  && (
            <Text style={{ fontSize: 12, color: "#555" }}>
                📅 Venta: {new Date(fechaVentaManual ).toLocaleString()}
            </Text>
                )}
                
                <Text>
                    Fecha: {fechaVentaManual
                    ? new Date(fechaVentaManual).toLocaleString()
                    : ""}
                </Text>


                <Text style={styles.textCantidad}>{cartItemCount}</Text>

                {carts.length === 0 ? (
                    <Text>No hay nada en el carrito</Text>
                ) : (
                    <Text style={styles.title}>Helados en el carrito</Text>
                )}

                <Pressable onPress={closeModal} style={styles.botCerrarModal}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>x</Text>
                </Pressable>
            </View>

            <View style={styles.contFlatList}>
                <FlatList
                    style={{ flex: 1 }}
                    data={carts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    // keyExtractor={(item) => item.id}
                    // renderItem={({ item }) => <ItemCart {...item} />}
                    contentContainerStyle={styles.contentContainerStyle}
                />
            </View>

            <View style={styles.pie}>
                <View>
                    <Text>TOTAL: </Text>
                    <Text style={styles.priceText}>
                        $ {totalPrice.toLocaleString('es-ES')}
                    </Text>
                </View>

                <View>
                    <Pressable
                        style={[styles.button, isProcessing && styles.buttonDisabled]}
                        onPress={procesarCarrito}
                        disabled={isProcessing || carts.length === 0}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>Comprar</Text>
                        )}
                    </Pressable>
                </View>
            </View>

            <StatusBar style="auto" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // ← Mantenemos todos tus estilos originales
    contentContainer: {
        flex: 1,
        backgroundColor: "#fbddf0",
        alignItems: "center",
        justifyContent: "center",
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
    },
    contHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: "100%",
        paddingHorizontal: 10,
        backgroundColor: '#FDEBD0',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    contFlatList: {
        flex: 8,
        width: "100%",
    },
    contentContainerStyle: {
        paddingHorizontal: 10,
        paddingTop: 15,
        backgroundColor: "#ff1188"
    },
    pie: {
        flex: 3,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        backgroundColor: '#fff',
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
        elevation: 5,
    },
    title: { fontSize: 24 },
    priceText: {
        fontSize: 40,
        fontWeight: "600",
        backgroundColor: "#0092e7",
        color: "#FFF",
        padding: 10,
        borderRadius: 15,
    },
    button: {
        backgroundColor: "#e70071",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        paddingHorizontal: 20,
    },
    buttonDisabled: { backgroundColor: "#ccc" },
    buttonText: { fontSize: 24, color: "#FFF", fontWeight: "700" },
    botCerrarModal: {
        width: 30,
        height: 30,
        backgroundColor: "red",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    textCantidad: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        width: 32,
        height: 32,
        textAlign: "center",
        backgroundColor: "#09aef5",
        borderRadius: 20,
    },
});

export default CartModalContent;
