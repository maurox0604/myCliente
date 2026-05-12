// components/PublicProductModal.js
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { usePublicCart } from "../context/PublicCartContext";

export default function PublicProductModal({ visible, producto, onClose }) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { addItem } = usePublicCart();
  const { width } = useWindowDimensions();

  const [fotoActiva, setFotoActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);

  const galeria = producto
    ? producto.fotos?.length > 0
      ? producto.fotos
      : [producto.icon]
    : [];

  useEffect(() => {
    if (visible) {
      setFotoActiva(0);
      setCantidad(1);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.92);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!producto) return null;

  const agotado = producto.cantidad === 0;
  const imageSize = Math.min(width - 80, 360);

  const handleAgregar = () => {
    if (!agotado) {
      addItem(producto, cantidad);
      onClose();
    }
  };

  const decrementar = () => setCantidad((c) => Math.max(1, c - 1));
  const incrementar = () =>
    setCantidad((c) => Math.min(producto.cantidad, c + 1));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { transform: [{ scale }], opacity }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {producto.nombre}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {/* Foto principal */}
            <View style={[styles.mainImageWrapper, { height: imageSize }]}>
              <Image
                source={{ uri: galeria[fotoActiva] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            </View>

            {/* Thumbnails */}
            {galeria.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbsRow}
              >
                {galeria.map((uri, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setFotoActiva(i)}
                    style={[
                      styles.thumb,
                      fotoActiva === i && styles.thumbActive,
                    ]}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Precio */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ${Number(producto.precio).toLocaleString("es-CO")}
              </Text>
              <Text style={styles.stock}>
                {agotado ? "❌ Agotado" : "✅ Disponible"}
              </Text>
            </View>

            {/* Descripción */}
            {producto.descripcion ? (
              <Text style={styles.descripcion}>{producto.descripcion}</Text>
            ) : null}
          </ScrollView>

          {/* Footer: cantidad + botón agregar */}
          <View style={styles.footer}>
            {/* Selector cantidad */}
            <View style={styles.qtyRow}>
              <Pressable
                style={[styles.qtyBtn, cantidad <= 1 && styles.qtyBtnDisabled]}
                onPress={decrementar}
                disabled={cantidad <= 1}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{cantidad}</Text>
              <Pressable
                style={[
                  styles.qtyBtn,
                  cantidad >= producto.cantidad && styles.qtyBtnDisabled,
                ]}
                onPress={incrementar}
                disabled={cantidad >= producto.cantidad}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>

            {/* Botón agregar */}
            <Pressable
              style={[styles.addBtn, agotado && styles.addBtnDisabled]}
              onPress={handleAgregar}
              disabled={agotado}
            >
              <Text style={styles.addBtnText}>
                {agotado
                  ? "AGOTADO"
                  : `AGREGAR  $${(Number(producto.precio) * cantidad).toLocaleString("es-CO")}`}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: { fontSize: 16, color: "#555", fontWeight: "700" },

  mainImageWrapper: {
    width: "100%",
    backgroundColor: "#f8f0f4",
  },
  mainImage: { width: "100%", height: "100%" },

  thumbsRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    flexDirection: "row",
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#eee",
  },
  thumbActive: { borderColor: "#e91e63", borderWidth: 2.5 },
  thumbImage: { width: "100%", height: "100%" },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  price: { fontSize: 24, fontWeight: "900", color: "#e91e63" },
  stock: { fontSize: 13, color: "#555", fontWeight: "600" },

  descripcion: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },

  // Selector cantidad
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  qtyBtnDisabled: { opacity: 0.35 },
  qtyBtnText: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
  qtyValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a1a1a",
    minWidth: 28,
    textAlign: "center",
  },

  // Botón agregar
  addBtn: {
    flex: 1,
    backgroundColor: "#e91e63",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  addBtnDisabled: { backgroundColor: "#ccc" },
  addBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
