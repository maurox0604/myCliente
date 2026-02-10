import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { usePublicCart } from "../context/PublicCartContext";

export default function PublicCartBar({ onPress }) {
  const { items } = usePublicCart();

  // ✅ hooks SIEMPRE arriba
  const scale = useRef(new Animated.Value(1)).current;

  const totalItems = items?.reduce((acc, i) => acc + i.cantidad, 0) || 0;
  const totalPrecio =
    items?.reduce(
      (acc, i) => acc + (Number(i.precio) || 0) * i.cantidad,
      0
    ) || 0;

  // animación solo si hay items
  useEffect(() => {
    if (totalItems === 0) return;

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [totalItems]);

  // ⛔ el return condicional VA DESPUÉS de los hooks
  if (!items || items.length === 0) return null;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable style={styles.bar} onPress={onPress}>
        <View style={styles.left}>
          <Text style={styles.cartIcon}>🛒</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>

          <Text style={styles.text}>Ver carrito</Text>
        </View>

        <Text style={styles.total}>
          ${totalPrecio.toLocaleString()}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cartIcon: {
    fontSize: 18,
  },
  badge: {
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  total: {
    color: "#25D366",
    fontWeight: "700",
    fontSize: 16,
  },
});
