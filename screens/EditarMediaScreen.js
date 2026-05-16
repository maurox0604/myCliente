import { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { HeladosContext } from "../context/HeladosContext";

export default function EditarMediaScreen({ route, navigation }) {
  const { helado } = route.params;
  const { editarMedia } = useContext(HeladosContext);

  const [descripcion, setDescripcion] = useState(helado.descripcion ?? "");
  const [fotos, setFotos] = useState(
    Array.isArray(helado.fotos) ? helado.fotos : [],
  );
  const [nuevaUrl, setNuevaUrl] = useState("");
  const [guardando, setGuardando] = useState(false);

  const showAlert = (title, message, buttons) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${message ?? ""}`);
      if (buttons && buttons[0]?.onPress) buttons[0].onPress();
    } else {
      showAlert(title, message, buttons);
    }
  };

  /* ── Agregar URL ── */
  const agregarFoto = () => {
    const url = nuevaUrl.trim();
    if (!url) return;
    if (fotos.includes(url)) {
      showAlert("Repetida", "Esa URL ya está en la lista.");
      return;
    }
    setFotos((prev) => [...prev, url]);
    setNuevaUrl("");
  };

  /* ── Quitar URL ── */
  const quitarFoto = (url) => setFotos((prev) => prev.filter((f) => f !== url));

  /* ── Guardar ── */
  const guardar = async () => {
    setGuardando(true);
    const result = await editarMedia(helado.id, descripcion, fotos);
    setGuardando(false);

    if (result.ok) {
      showAlert("✅ Guardado", "Cambios aplicados correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      showAlert("❌ Error", "No se pudieron guardar los cambios.");
    }
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.titulo}>Editar media — {helado.sabor}</Text>

      {/* ── DESCRIPCIÓN ── */}
      <Text style={s.label}>Descripción</Text>
      <TextInput
        style={s.textArea}
        multiline
        numberOfLines={4}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Escribe una descripción del helado..."
        placeholderTextColor="#aaa"
      />

      {/* ── FOTOS ── */}
      <Text style={s.label}>Fotos ({fotos.length})</Text>

      {fotos.length === 0 && (
        <Text style={s.vacio}>Sin fotos aún. Agrega una URL abajo.</Text>
      )}

      {fotos.map((url, i) => (
        <View key={i} style={s.fotoRow}>
          <Image source={{ uri: url }} style={s.thumb} resizeMode="cover" />
          <Text style={s.urlTexto} numberOfLines={2}>
            {url}
          </Text>
          <Pressable onPress={() => quitarFoto(url)} style={s.btnQuitar}>
            <Text style={{ color: "white", fontWeight: "bold" }}>✕</Text>
          </Pressable>
        </View>
      ))}

      {/* ── AGREGAR URL ── */}
      <Text style={s.label}>Agregar URL de foto</Text>
      <Text style={s.hint}>
        Sube tu imagen en freeimage.host, copia la URL directa y pégala aquí.
      </Text>
      <View style={s.urlRow}>
        <TextInput
          style={s.urlInput}
          value={nuevaUrl}
          onChangeText={setNuevaUrl}
          placeholder="https://iili.io/..."
          placeholderTextColor="#aaa"
          autoCapitalize="none"
        />
        <Pressable onPress={agregarFoto} style={s.btnAgregar}>
          <Text style={{ color: "white", fontWeight: "bold" }}>+ Agregar</Text>
        </Pressable>
      </View>

      {/* ── PREVIEW URL ingresada ── */}
      {nuevaUrl.trim().length > 10 && (
        <Image
          source={{ uri: nuevaUrl.trim() }}
          style={s.previewGrande}
          resizeMode="cover"
        />
      )}

      {/* ── GUARDAR ── */}
      <Pressable
        onPress={guardar}
        disabled={guardando}
        style={[s.btnGuardar, guardando && { opacity: 0.6 }]}
      >
        {guardando ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={s.btnGuardarTxt}>💾 Guardar cambios</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  titulo: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  label: { fontWeight: "600", marginTop: 16, marginBottom: 6 },
  hint: { fontSize: 12, color: "#888", marginBottom: 8 },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    // textAlignVertical: "top",
    fontSize: 14,
  },
  vacio: { color: "#aaa", fontStyle: "italic", marginBottom: 8 },
  fotoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  thumb: { width: 60, height: 60, borderRadius: 6, backgroundColor: "#eee" },
  urlTexto: { flex: 1, fontSize: 11, color: "#555" },
  btnQuitar: {
    backgroundColor: "#e53935",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  urlRow: { flexDirection: "row", gap: 8 },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
  },
  btnAgregar: {
    backgroundColor: "#6c47ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  previewGrande: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: "#eee",
  },
  btnGuardar: {
    backgroundColor: "#2e7d32",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  btnGuardarTxt: { color: "white", fontWeight: "bold", fontSize: 16 },
});
