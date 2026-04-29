import { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import ItemCart from "./ItemCart";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { HeladosContext } from "../context/HeladosContext";
import { useVentas } from "../context/VentasContext";
import { useSede } from "../context/SedeContext";
import { formatFechaVenta } from "../utils/formatFechaGlobal";
import { auth } from "../firebase-config.js";

const CartModalContent = ({ closeModal }) => {
  const { emailUser } = useContext(AuthContext);
  const { carts, totalPrice, clearCart, calculateTotalPrice, cartItemCount } =
    useContext(CartContext);
  const { reloadHelados } = useContext(HeladosContext);
  const { fechaVentaManual } = useContext(CartContext);
  const { sedeActiva } = useSede();

  const [isProcessing, setIsProcessing] = useState(false);
  // ✅ NUEVO: motivo de la transacción
  const [motivo, setMotivo] = useState("venta");

  useEffect(() => {
    calculateTotalPrice(carts);
  }, [carts]);

  const procesarCarrito = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const fechaFormateada = formatFechaVenta(fechaVentaManual);
      const token = await auth.currentUser?.getIdToken();

      const itemsConMotivo = carts.map((item) => ({
        ...item,
        totVentaXhelado: item.precio * item.cantCompra,
        user: emailUser,
        motivo: motivo,
      }));

      console.log("🎯 Motivo seleccionado:", motivo); // ✅ NUEVO
      console.log("📦 Items a enviar:", itemsConMotivo); // ✅ NUEVO

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/ventas/procesar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // ✅ motivo se agrega a cada item
            items: carts.map((item) => ({
              ...item,
              totVentaXhelado: item.precio * item.cantCompra,
              user: emailUser,
              motivo: motivo, // ✅ NUEVO
            })),
            fecha_manual: fechaFormateada,
            id_sede: sedeActiva?.id || 1,
          }),
        },
      );

      if (!response.ok) throw new Error(await response.text());

      clearCart();
      closeModal();
    } catch (error) {
      console.error("Error procesando carrito:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderItem = useCallback(({ item }) => <ItemCart {...item} />, []);

  // ✅ NUEVO: opciones de motivo
  const motivos = [
    { key: "venta", label: "🛒 Venta", color: "#e91e63" },
    { key: "obsequio", label: "🎁 Obsequio", color: "#9c27b0" },
    { key: "muestra", label: "🧪 Muestra", color: "#00bcd4" },
    { key: "derretido", label: "🌡️ Derretido", color: "#ff9800" },
  ];

  return (
    <SafeAreaView style={styles.contentContainer}>
      {/* HEADER */}
      <View style={styles.contHeader}>
        {fechaVentaManual && (
          <Text style={{ fontSize: 12, color: "#555" }}>
            📅 {new Date(fechaVentaManual).toLocaleString()}
          </Text>
        )}
        <Text style={styles.textCantidad}>{cartItemCount}</Text>
        {carts.length === 0 ? (
          <Text>No hay nada en el carrito</Text>
        ) : (
          <Text style={styles.title}>Carrito</Text>
        )}
        <Pressable onPress={closeModal} style={styles.botCerrarModal}>
          <Text style={{ color: "white", fontWeight: "bold" }}>x</Text>
        </Pressable>
      </View>

      {/* ✅ SELECTOR DE MOTIVO */}
      <View style={styles.motivoBar}>
        {motivos.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => setMotivo(m.key)}
            style={[
              styles.motivoBtn,
              motivo === m.key && { backgroundColor: m.color },
            ]}
          >
            <Text
              style={[
                styles.motivoBtnText,
                motivo === m.key && { color: "#fff" },
              ]}
            >
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* LISTA */}
      <View style={styles.contFlatList}>
        <FlatList
          style={{ flex: 1 }}
          data={carts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.contentContainerStyle}
        />
      </View>

      {/* PIE */}
      <View style={styles.pie}>
        <View>
          <Text>TOTAL: </Text>
          <Text style={styles.priceText}>
            $ {motivo === "venta" ? totalPrice.toLocaleString("es-ES") : "0"}{" "}
            {/* ✅ si no es venta el ingreso es 0 */}
          </Text>
        </View>

        <Pressable
          style={[
            styles.button,
            isProcessing && styles.buttonDisabled,
            // ✅ color del botón según motivo
            motivo === "obsequio" && { backgroundColor: "#9c27b0" },
            motivo === "muestra" && { backgroundColor: "#00bcd4" },
            motivo === "derretido" && { backgroundColor: "#ff9800" },
          ]}
          onPress={procesarCarrito}
          disabled={isProcessing || carts.length === 0}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>
              {motivo === "venta" ? "Facturar" : ""}
              {motivo === "obsequio" ? "Obsequiar" : ""}
              {motivo === "muestra" ? "Muestra" : ""}
              {motivo === "derretido" ? "Derretido" : ""}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ✅ todos tus estilos originales +
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#FDEBD0",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  contFlatList: { flex: 8, width: "100%" },
  contentContainerStyle: {
    paddingHorizontal: 10,
    paddingTop: 15,
    backgroundColor: "#ff1188",
  },
  pie: {
    flex: 3,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    backgroundColor: "#fff",
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
    marginBottom: 10,
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

  // ✅ NUEVOS estilos para motivo
  motivoBar: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: "#fff",
  },
  motivoBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  motivoBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555",
  },
});

export default CartModalContent;
