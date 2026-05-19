import { FontAwesome5 } from "@expo/vector-icons";
import { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { HeladosContext } from "../context/HeladosContext";

export default function EditModalContent({
  id,
  _icon,
  _sabor,
  _precio,
  _cantidad,
  _id_categoria,
  closeEditModal,
}) {
  const [sabor, setSabor] = useState(_sabor ?? "");
  const [precio, setPrecio] = useState(String(_precio ?? ""));
  const [cantidad, setCantidad] = useState(String(_cantidad ?? ""));
  const [foto, setFoto] = useState(_icon ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [focusField, setFocusField] = useState(null);
  const [guardadoOk, setGuardadoOk] = useState(false);

  const { updateHeladoCantidad, handleSearch } = useContext(HeladosContext);

  const showAlert = (title, msg) => {
    if (Platform.OS === "web") window.alert(`${title}\n${msg}`);
    else Alert.alert(title, msg);
  };

  const actualizarHelado = async () => {
    if (isSaving) return;
    if (!sabor.trim()) {
      showAlert("Error", "El sabor no puede estar vacío");
      return;
    }
    if (isNaN(Number(precio))) {
      showAlert("Error", "El precio debe ser un número");
      return;
    }
    if (isNaN(Number(cantidad))) {
      showAlert("Error", "La cantidad debe ser un número");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/productos/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: sabor.trim(),
            precio: Number(precio),
            cantidad: Number(cantidad),
            icon: foto,
            id_categoria: _id_categoria,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      updateHeladoCantidad(id, Number(cantidad));
      handleSearch("");

      // Mostrar confirmación brevemente antes de cerrar
      setGuardadoOk(true);
      setTimeout(() => {
        setGuardadoOk(false);
        closeEditModal();
      }, 1200);
    } catch (error) {
      console.error("Error al actualizar:", error);
      showAlert("Error", "No se pudo guardar. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const campos = [
    {
      key: "sabor",
      label: "Sabor",
      icon: "ice-cream",
      value: sabor,
      onChange: setSabor,
      keyboardType: "default",
      placeholder: "Nombre del sabor",
    },
    {
      key: "precio",
      label: "Precio",
      icon: "dollar-sign",
      value: precio,
      onChange: setPrecio,
      keyboardType: "numeric",
      placeholder: "0",
    },
    {
      key: "cantidad",
      label: "Cantidad",
      icon: "calculator",
      value: cantidad,
      onChange: setCantidad,
      keyboardType: "numeric",
      placeholder: "0",
    },
  ];

  return (
    <View style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <Text style={s.titulo} numberOfLines={1}>
          ✏️ Editar — {_sabor}
        </Text>
        <Pressable onPress={closeEditModal} style={s.btnCerrar}>
          <Text style={s.btnCerrarTxt}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* CAMPOS */}
        {campos.map((c) => (
          <View key={c.key} style={s.campo}>
            <Text style={s.label}>{c.label}</Text>
            <View
              style={[s.inputWrap, focusField === c.key && s.inputWrapFocus]}
            >
              <FontAwesome5
                name={c.icon}
                size={16}
                color="#e91e63"
                style={s.icon}
              />
              <TextInput
                value={c.value}
                onChangeText={c.onChange}
                onFocus={() => setFocusField(c.key)}
                onBlur={() => setFocusField(null)}
                keyboardType={c.keyboardType}
                placeholder={c.placeholder}
                placeholderTextColor="#bbb"
                style={s.input}
              />
            </View>
          </View>
        ))}

        {/* CONFIRMACIÓN */}
        {guardadoOk && (
          <View style={s.successBanner}>
            <Text style={s.successTxt}>✅ ¡Guardado correctamente!</Text>
          </View>
        )}

        {/* BOTÓN GUARDAR */}
        <Pressable
          onPress={actualizarHelado}
          disabled={isSaving || !sabor.trim()}
          style={[
            s.btnGuardar,
            (isSaving || !sabor.trim()) && s.btnGuardarDisabled,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnGuardarTxt}>💾 Guardar cambios</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    flex: 1,
    marginRight: 10,
  },
  btnCerrar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  btnCerrarTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
  },
  campo: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    paddingHorizontal: 12,
    height: 50,
  },
  inputWrapFocus: {
    borderColor: "#e91e63",
    backgroundColor: "#fff",
  },
  icon: {
    marginRight: 10,
    width: 20,
    textAlign: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
  successBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  successTxt: {
    color: "#2e7d32",
    fontWeight: "700",
    fontSize: 14,
  },
  btnGuardar: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#e91e63",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGuardarDisabled: {
    backgroundColor: "#ccc",
  },
  btnGuardarTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
