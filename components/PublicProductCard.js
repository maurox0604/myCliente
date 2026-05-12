// components/PublicProductCard.js
import { View, Text, Image, Pressable, StyleSheet } from "react-native";

export default function PublicProductCard({ producto, onPress }) {
  const foto = producto.fotos?.[0] || producto.icon;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Imagen */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: foto }} style={styles.image} resizeMode="cover" />
        {/* Badge precio flotante */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            ${Number(producto.precio).toLocaleString("es-CO")}
          </Text>
        </View>
        {/* Badge fotos múltiples */}
        {producto.fotos?.length > 1 && (
          <View style={styles.photosBadge}>
            <Text style={styles.photosText}>+{producto.fotos.length} 📷</Text>
          </View>
        )}
      </View>

      {/* Nombre */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {producto.nombre}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 18,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 0.9,
    backgroundColor: "#f8f0f4",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  priceBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#e91e63",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priceText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  photosBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  photosText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  info: {
    padding: 10,
    paddingBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    color: "#1a1a1a",
    lineHeight: 18,
  },
});
