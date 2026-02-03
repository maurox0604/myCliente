import { View, Text, Image, StyleSheet } from "react-native";

export default function PublicHeladoItem({ item }) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.icon }}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.nombre}>{item.nombre}</Text>

      {item.descripcion ? (
        <Text style={styles.descripcion}>{item.descripcion}</Text>
      ) : null}

      <Text style={styles.precio}>
        ${Number(item.precio).toLocaleString("es-CO")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 8,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  descripcion: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  precio: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 6,
  },
});
