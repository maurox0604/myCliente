import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import FechaVentaModal from "./FechaVentaModal";
import { useVentas } from "../context/VentasContext";

export default function MenuVenta({ closeModal }) {
  const { activarVentaNormal } = useVentas();

  const [showFechaModal, setShowFechaModal] = useState(false);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={closeModal}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.item}
          onPress={() => {
            activarVentaNormal();
            closeModal();
          }}
        >
          <Text style={styles.text}>🛒 Nueva venta</Text>
        </Pressable>

        <Pressable
          style={styles.item}
          onPress={() => {
            setShowFechaModal(true); // 👈 ABRE CALENDARIO
          }}
        >
          <Text style={styles.text}>📅 Venta con fecha manual</Text>
        </Pressable>

        <Pressable style={styles.item}>
          <Text style={styles.text}>📊 Reportes</Text>
        </Pressable>
      </View>

      {/* MODAL DE FECHA */}
      <FechaVentaModal
        visible={showFechaModal}
        onClose={() => {
          setShowFechaModal(false);
          closeModal(); // cerramos el menú también
        }}
      />
    </>
  );
}



const styles = StyleSheet.create({
  container: { padding: 20 },
  item: { paddingVertical: 15 },
  text: { fontSize: 18 },
  header: {
  alignItems: "flex-end",
  paddingBottom: 10,
},
close: {
  fontSize: 22,
  fontWeight: "bold",
}

});
