import { View, StyleSheet } from "react-native";

export default function PublicSkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={styles.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#e5e5e5",
  },
  text: {
    height: 14,
    margin: 10,
    borderRadius: 6,
    backgroundColor: "#e5e5e5",
  },
});
