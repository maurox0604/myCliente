import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSede } from "../context/SedeContext";

export default function SedeSelectorSheet({ closeModal }) {
  const { sedes, sedeActiva, cambiarSede } = useSede();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar sede</Text>

      {sedes.map((sede) => {
        const activa = sedeActiva?.id === sede.id;

        return (
          <Pressable
            key={sede.id}
            onPress={() => {
              cambiarSede(sede);
              closeModal();
            }}
            style={[
              styles.item,
              activa && styles.itemActive
            ]}
          >
            <Text style={styles.text}>
              🏪 {sede.nombre}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  item: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
    marginBottom: 10,
  },
  itemActive: {
    backgroundColor: "#e70071",
  },
  text: {
    fontSize: 16,
    color: "#000",
  },
});
