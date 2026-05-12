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

  // foto activa en la galería
  const [fotoActiva, setFotoActiva] = useState(0);

  // construir galería: fotos[] + icon como fallback
  const galeria = producto
    ? producto.fotos?.length > 0
      ? producto.fotos
      : [producto.icon]
    : [];

  useEffect(() => {
    if (visible) {
      setFotoActiva(0); // reset al abrir
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

  const imageSize = Math.min(width - 80, 380);

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

            {/* Thumbnails — solo si hay más de una foto */}
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
                {producto.cantidad > 0 ? `✅ Disponible` : "❌ Agotado"}
              </Text>
            </View>

            {/* Descripción si existe */}
            {producto.descripcion ? (
              <Text style={styles.descripcion}>{producto.descripcion}</Text>
            ) : null}
          </ScrollView>

          {/* Botón agregar */}
          <Pressable
            style={[
              styles.addBtn,
              producto.cantidad === 0 && styles.addBtnDisabled,
            ]}
            onPress={() => {
              if (producto.cantidad > 0) {
                addItem(producto, 1);
                onClose();
              }
            }}
            disabled={producto.cantidad === 0}
          >
            <Text style={styles.addBtnText}>
              {producto.cantidad > 0 ? "AGREGAR AL PEDIDO" : "AGOTADO"}
            </Text>
          </Pressable>
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
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  closeText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "700",
  },

  // Imagen principal
  mainImageWrapper: {
    width: "100%",
    backgroundColor: "#f8f0f4",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },

  // Thumbnails
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
  thumbActive: {
    borderColor: "#e91e63",
    borderWidth: 2.5,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },

  // Info
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "900",
    color: "#e91e63",
  },
  stock: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },
  descripcion: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  // Botón
  addBtn: {
    margin: 16,
    backgroundColor: "#e91e63",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#ccc",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
