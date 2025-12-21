import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    Pressable,
    Platform,
    StyleSheet,
} from "react-native";
import { useVentas } from "../context/VentasContext";

import DateTimePicker from "@react-native-community/datetimepicker";

// 👉 SOLO WEB
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FechaVentaModal({ visible, onClose }) {
    const { activarVentaManual } = useVentas();
    const [fecha, setFecha] = useState(new Date());
    const [showMobilePicker, setShowMobilePicker] = useState(false);

    const confirmar = () => {
        activarVentaManual(fecha);
        onClose();
    };

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* BACKDROP */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* MODAL */}
      <View style={styles.modal}>
        <Text style={styles.title}>📅 Fecha de la venta</Text>

        {/* WEB REAL */}
        {Platform.OS === "web" ? (
          <DatePicker
            selected={fecha}
            onChange={(date) => setFecha(date)}
            showTimeSelect
            timeIntervals={15}
            dateFormat="dd/MM/yyyy HH:mm"
            className="datepicker"
          />
        ) : (
          <>
            <Pressable
              style={styles.mobileButton}
              onPress={() => setShowMobilePicker(true)}
            >
              <Text>{fecha.toLocaleString()}</Text>
            </Pressable>

            {showMobilePicker && (
              <DateTimePicker
                value={fecha}
                mode="datetime"
                onChange={(e, d) => {
                  setShowMobilePicker(false);
                  if (d) setFecha(d);
                }}
              />
            )}
          </>
        )}

        <Pressable style={styles.confirm} onPress={confirmar}>
          <Text style={{ color: "#fff" }}>Confirmar</Text>
        </Pressable>

        <Pressable onPress={onClose} style={{ marginTop: 10 }}>
          <Text>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    position: "absolute",
    top: "25%",
    left: "5%",
    right: "5%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "600",
  },
  mobileButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  confirm: {
    backgroundColor: "#e70071",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
});
