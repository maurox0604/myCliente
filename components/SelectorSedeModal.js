import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSede } from "../context/SedeContext";

const SEDES = [
  { id: 1, nombre: "Local" },
  { id: 2, nombre: "Rappi" },
  { id: 3, nombre: "Eventosss" },
];

export default function SelectorSedeModal({ onClose }) {
  const { sedeActiva, setSede, sedes } = useSede();
  

  return (
    <View style={styles.modal}>
      <Text style={styles.title}>Seleccionar sede</Text>

      {sedes.map((sede) => {
        const activa = sedeActiva?.id === sede.id;

        return (
          <Pressable
            key={sede.id}
            onPress={() => {
              // setSede(sede);
              cambiarSede(sede);
              onClose();
            }}
            style={[
              styles.item,
              activa && styles.activa,
            ]}
          >
            <Text style={[
              styles.text,
              activa && styles.textActiva,
            ]}>
              {sede.nombre}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: 220,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  item: {
    paddingVertical: 10,
  },
  activa: {
    backgroundColor: "#e70071",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 15,
  },
  textActiva: {
    color: "#fff",
    fontWeight: "600",
  },
});

