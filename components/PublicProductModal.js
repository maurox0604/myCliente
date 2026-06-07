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
  const { addItem, items } = usePublicCart();
  const { width } = useWindowDimensions();

  const [fotoActiva, setFotoActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);

  const galeria = producto
    ? producto.fotos?.length > 0
      ? producto.fotos
      : [producto.icon]
    : [];

  // ── Cuántas unidades de este producto ya están en el carrito
  const enCarrito = producto
    ? (items.find((i) => i.id === producto.id)?.cantidad ?? 0)
    : 0;

  // ── Cuántas quedan disponibles para agregar
  const disponibleRestante = producto
    ? Math.max(0, producto.cantidad - enCarrito)
    : 0;

  const agotado = producto?.cantidad === 0;
  const sinRestante = disponibleRestante === 0 && !agotado; // stock hay pero el carrito lo tiene todo

  useEffect(() => {
    if (visible) {
      setFotoActiva(0);
      setCantidad(1); // siempre arranca en 1 (unidades NUEVAS a agregar)
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

  useEffect(() => {
    // Si al abrir el modal el disponibleRestante es menor que la cantidad seleccionada,
    // ajustamos para no exceder
    if (visible && cantidad > disponibleRestante) {
      setCantidad(Math.max(1, disponibleRestante));
    }
  }, [visible, disponibleRestante]);

  if (!producto) return null;

  const imageSize = Math.min(width - 80, 360);

  const handleAgregar = () => {
    if (!agotado && disponibleRestante > 0) {
      addItem(producto, cantidad, producto.cantidad);
      onClose();
    }
  };

  const decrementar = () => setCantidad((c) => Math.max(1, c - 1));
  const incrementar = () =>
    setCantidad((c) => Math.min(disponibleRestante, c + 1));

  // Etiqueta de stock para mostrar al usuario
  const stockLabel = () => {
    if (agotado) return "❌ Agotado";
    if (sinRestante) return "🛒 Solo quedan estos disponibles";
    if (enCarrito > 0) return `🛒 ${enCarrito} en carrito`; //· quedan ${disponibleRestante}`;
    return `✅ Disponible`;
  };

  const bloqueado = agotado || sinRestante;

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

            {/* Precio + estado stock */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ${Number(producto.precio).toLocaleString("es-CO")}
              </Text>
              <Text
                style={[
                  styles.stock,
                  sinRestante && styles.stockAgotado,
                  enCarrito > 0 && !sinRestante && styles.stockEnCarrito,
                ]}
              >
                {stockLabel()}
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
                style={[
                  styles.qtyBtn,
                  (cantidad <= 1 || bloqueado) && styles.qtyBtnDisabled,
                ]}
                onPress={decrementar}
                disabled={cantidad <= 1 || bloqueado}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>

              {/* Muestra: en carrito + nuevos a agregar */}
              <View style={styles.qtyCenter}>
                {/* {enCarrito > 0 &&
                  {
                     <Text style={styles.qtyCarrito}>🛒 {enCarrito}</Text> 
                  }} */}
                <Text style={styles.qtyValue}>
                  {bloqueado ? "—" : `${cantidad}`}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.qtyBtn,
                  (cantidad >= disponibleRestante || bloqueado) &&
                    styles.qtyBtnDisabled,
                ]}
                onPress={incrementar}
                disabled={cantidad >= disponibleRestante || bloqueado}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>

            {/* Botón agregar */}
            <Pressable
              style={[styles.addBtn, bloqueado && styles.addBtnDisabled]}
              onPress={handleAgregar}
              disabled={bloqueado}
            >
              <Text style={styles.addBtnText}>
                {agotado
                  ? "AGOTADO"
                  : sinRestante
                    ? "YA ESTÁ EN EL CARRITO"
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

  mainImageWrapper: { width: "100%", backgroundColor: "#f8f0f4" },
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
    flexWrap: "wrap",
    gap: 4,
  },
  price: { fontSize: 24, fontWeight: "900", color: "#e91e63" },
  stock: { fontSize: 12, color: "#555", fontWeight: "600" },
  stockAgotado: { color: "#d32f2f" },
  stockEnCarrito: { color: "#e91e63" },

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
  qtyBtnDisabled: { opacity: 0.3 },
  qtyBtnText: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },

  // Centro del selector — muestra carrito + nuevos
  qtyCenter: {
    alignItems: "center",
    minWidth: 48,
  },
  qtyCarrito: {
    fontSize: 10,
    color: "#e91e63",
    fontWeight: "700",
    marginBottom: 1,
  },
  qtyValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
  },

  // Botón agregar
  addBtn: {
    flex: 1,
    backgroundColor: "#e91e63",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  addBtnDisabled: { backgroundColor: "#bbb" },
  addBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
