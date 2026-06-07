import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  ScrollView,
  Easing,
  Platform,
  Linking,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { usePublicCart } from "../context/PublicCartContext";
import Alert from "@blazejkustra/react-native-alert";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function PublicCartPanel({ visible, onClose, screenHeight }) {
  const { items, total, updateCantidad, clearCart } = usePublicCart();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
    setShowConfirmModal(false);
    const mensaje = items.map((i) => `• ${i.nombre} x${i.cantidad}`).join("\n");
    const texto = encodeURIComponent(
      `Hola 👋, quisiera pedir:\n\n${mensaje}\n\nTotal: $${total.toLocaleString()}`,
    );
    const phone = "573182091329";
    const appUrl = `whatsapp://send?phone=${phone}&text=${texto}`;
    const webUrl = `https://wa.me/${phone}?text=${texto}`;

    if (Platform.OS !== "web") {
      const supported = await Linking.canOpenURL(appUrl);
      if (supported) {
        Linking.openURL(appUrl);
        return;
      }
    }
    Linking.openURL(webUrl);
  };

  const confirmWhatsApp = () => {
    if (items.length === 0) {
      Alert.alert(
        "Carrito vacío",
        "Agrega productos antes de enviar el pedido.",
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmClearCart = () => {
    Alert.alert(
      "Vaciar carrito",
      "¿Seguro que deseas eliminar todos los productos?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Vaciar", style: "destructive", onPress: clearCart },
      ],
    );
  };

  if (!visible) return null;
  if (items.length === 0) return null;

  return (
    // Wrapper relativo para que el overlay absoluto quede contenido aquí
    <View style={styles.wrapper}>
      {/* ── PANEL CARRITO ── */}
      <Animated.View style={[styles.panel, { transform: [{ translateY }] }]}>
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
          {items.map((item) => {
            const enLimite = item.cantidad >= item.stock;
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nombre}</Text>
                  {enLimite && (
                    <Text style={styles.stockWarning}>
                      Máximo disponible: {item.stock}
                    </Text>
                  )}
                </View>

                <View style={styles.qtyBox}>
                  <Pressable
                    style={styles.qtyBtn}
                    onPress={() => updateCantidad(item.id, item.cantidad - 1)}
                  >
                    <Text style={styles.qtyText}>−</Text>
                  </Pressable>
                  <Text style={styles.qtyValue}>{item.cantidad}</Text>
                  <Pressable
                    style={[styles.qtyBtn, enLimite && styles.qtyBtnDisabled]}
                    onPress={() => updateCantidad(item.id, item.cantidad + 1)}
                    disabled={enLimite}
                  >
                    <Text
                      style={[
                        styles.qtyText,
                        enLimite && styles.qtyTextDisabled,
                      ]}
                    >
                      +
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.itemPrice}>
                  ${(item.precio * item.cantidad).toLocaleString()}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            <Text style={styles.total}>Total: ${total.toLocaleString()}</Text>
            <Pressable onPress={confirmClearCart}>
              <Text style={styles.clearText}>Vaciar carrito</Text>
            </Pressable>
          </View>
          <Pressable style={styles.whatsappBtn} onPress={confirmWhatsApp}>
            {/* <Text style={styles.whatsappIcon}>📲</Text> */}
            <MaterialCommunityIcons name="whatsapp" size={32} color="#fff" />
            <Text style={styles.whatsappText}>Enviar pedido por WhatsApp</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* ── MODAL CONFIRMACIÓN — overlay puro sin Modal de RN ── */}
      {showConfirmModal && (
        <>
          {/* Fondo oscuro */}
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowConfirmModal(false)}
          />

          {/* Caja del modal */}
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirmar pedido</Text>
            <Text style={styles.modalSubtitle}>
              Revisa tu selección antes de enviar
            </Text>

            {/* Lista de ítems */}
            <ScrollView
              style={styles.modalList}
              contentContainerStyle={{ paddingBottom: 4 }}
              showsVerticalScrollIndicator={false}
            >
              {items.map((item) => (
                <View key={item.id} style={styles.modalItem}>
                  <View style={styles.modalItemLeft}>
                    <Text style={styles.modalItemBullet}>•</Text>
                    <Text style={styles.modalItemName}>{item.nombre}</Text>
                  </View>
                  <View style={styles.modalItemRight}>
                    <Text style={styles.modalItemQty}>×{item.cantidad}</Text>
                    <Text style={styles.modalItemPrice}>
                      ${(item.precio * item.cantidad).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Total */}
            <View style={styles.modalDivider} />
            <View style={styles.modalTotalRow}>
              <Text style={styles.modalTotalLabel}>Total</Text>
              <Text style={styles.modalTotalValue}>
                ${total.toLocaleString()}
              </Text>
            </View>

            {/* Botón WhatsApp */}
            <Pressable style={styles.modalWhatsappBtn} onPress={sendToWhatsApp}>
              <MaterialCommunityIcons name="whatsapp" size={32} color="#fff" />
              <Text style={styles.modalWhatsappText}>Enviar por WhatsApp</Text>
            </Pressable>

            {/* Cancelar — solo texto, discreto */}
            <Pressable
              style={styles.modalCancelBtn}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Wrapper que contiene panel + overlay
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
    zIndex: 100,
  },

  // ── PANEL ──
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: { fontSize: 17, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#777" },
  close: { fontSize: 22, paddingHorizontal: 8 },
  list: { flex: 1, paddingHorizontal: 16 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15 },
  stockWarning: {
    fontSize: 11,
    color: "#e91e63",
    marginTop: 2,
    fontWeight: "500",
  },
  itemPrice: { fontWeight: "600", marginLeft: 8 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  footerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  total: { fontSize: 17, fontWeight: "700" },
  clearText: { color: "#d32f2f", fontSize: 14, fontWeight: "500" },
  whatsappBtn: {
    backgroundColor: "#25D366",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  whatsappIcon: { fontSize: 18 },
  whatsappText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  qtyBox: { flexDirection: "row", alignItems: "center", marginHorizontal: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnDisabled: { backgroundColor: "#f5f5f5" },
  qtyText: { fontSize: 18, fontWeight: "600", color: "#333" },
  qtyTextDisabled: { color: "#ccc" },
  qtyValue: { marginHorizontal: 8, fontSize: 15, fontWeight: "600" },

  // ── MODAL OVERLAY (sin Modal de RN) ──
  modalBackdrop: {
    position: "absolute",
    top: "-200%", // cubre toda la pantalla hacia arriba también
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  },
  modalBox: {
    position: "absolute",
    bottom: "10%",
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    zIndex: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginBottom: 2,
  },
  modalSubtitle: { fontSize: 13, color: "#888", marginBottom: 16 },
  modalList: { maxHeight: 200 },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f2f2f2",
  },
  modalItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  modalItemBullet: { color: "#05cf4f", fontSize: 16, fontWeight: "700" },
  modalItemName: { fontSize: 14, color: "#222", fontWeight: "500", flex: 1 },
  modalItemRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  modalItemQty: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  modalItemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
    minWidth: 60,
    textAlign: "right",
  },
  modalDivider: { height: 1, backgroundColor: "#eee", marginVertical: 14 },
  modalTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTotalLabel: { fontSize: 15, fontWeight: "600", color: "#555" },
  modalTotalValue: { fontSize: 20, fontWeight: "800", color: "#111" },
  modalWhatsappBtn: {
    backgroundColor: "#25D366",
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  modalWhatsappIcon: { fontSize: 18 },
  modalWhatsappText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalCancelBtn: { alignItems: "center", paddingVertical: 10 },
  modalCancelText: { color: "#999", fontSize: 15, fontWeight: "500" },
});
