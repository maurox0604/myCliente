import { View, Text, Image, Pressable, StyleSheet } from "react-native";

export default function PublicProductCard({ producto, onPress }) {

    console.log("PRODUCTO PUBLICO 👉", producto);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Imagen */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: producto.icon }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Info */}
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
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 3,
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: 1, // 🔑 cuadrado perfecto (mobile + web)
    backgroundColor: "#f2f2f2",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  info: {
    padding: 10,
    alignItems: "center",
  },

name: {
  fontSize: 14,
  fontWeight: "600",
  textAlign: "center",
  lineHeight: 18,
  minHeight: 36, // 🔑 mantiene altura uniforme
},

});
