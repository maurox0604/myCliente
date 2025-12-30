import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSede } from "../context/SedeContext";



export default function SedeSelectorHeader({ onOpenMenu , onOpenSede }) {
  const { sedeActiva } = useSede();

  return (
    <View style={styles.container}>
     <Pressable onPress={onOpenSede} style={styles.sede}>

        <Text style={styles.text}>
          🏪 {sedeActiva?.nombre || "Sede"}
        </Text>
      </Pressable>

      <Pressable onPress={onOpenMenu} style={styles.menu}>
        <Text style={styles.menuText}>☰</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  sede: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#f6f6f6",
  },
  text: {
    fontWeight: "600",
    color: "#e70071",
  },
  menu: {
    paddingHorizontal: 4,
  },
  menuText: {
    fontSize: 22,
  },
});
