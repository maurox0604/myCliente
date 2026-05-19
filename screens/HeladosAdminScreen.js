import { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Switch,
  ActivityIndicator,
  Pressable,
  TextInput,
  StyleSheet,
} from "react-native";
import { HeladosContext } from "../context/HeladosContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HeladosAdminScreen({ navigation }) {
  const {
    helados,
    activarProducto,
    desactivarProducto,
    loadingId,
    fetchHeladosAdmin,
  } = useContext(HeladosContext);

  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("nombre"); // "nombre" | "cantidad"

  useEffect(() => {
    fetchHeladosAdmin();
  }, []);

  const toggleEstado = (item) => {
    if (item.activo) {
      const confirm = window.confirm(`¿Desactivar ${item.sabor}?`);
      if (!confirm) return;
      desactivarProducto(item.id);
    } else {
      activarProducto(item.id);
    }
  };

  const heladosFiltrados = helados
    .filter((h) => {
      const matchFiltro =
        filtro === "activos"
          ? h.activo === 1
          : filtro === "inactivos"
            ? h.activo === 0
            : true;
      const matchBusqueda = h.sabor
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      return matchFiltro && matchBusqueda;
    })
    .sort((a, b) =>
      orden === "nombre"
        ? a.sabor.localeCompare(b.sabor)
        : a.cantidad - b.cantidad,
    );

  return (
    <View style={s.container}>
      {/* BUSCADOR */}
      <View style={s.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={20} color="#888" />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar sabor..."
          placeholderTextColor="#bbb"
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
        />
        {busqueda.length > 0 && (
          <Pressable onPress={() => setBusqueda("")}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color="#bbb"
            />
          </Pressable>
        )}
      </View>

      {/* FILTROS ACTIVO/INACTIVO */}
      <View style={s.filtrosRow}>
        {["todos", "activos", "inactivos"].map((tipo) => (
          <Pressable
            key={tipo}
            onPress={() => setFiltro(tipo)}
            style={[s.filtroBtn, filtro === tipo && s.filtroBtnActive]}
          >
            <Text style={[s.filtroTxt, filtro === tipo && s.filtroTxtActive]}>
              {tipo.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ORDEN */}
      <View style={s.ordenRow}>
        <Text style={s.ordenLabel}>Ordenar:</Text>
        <Pressable
          onPress={() => setOrden("nombre")}
          style={[s.ordenBtn, orden === "nombre" && s.ordenBtnActive]}
        >
          <MaterialCommunityIcons
            name="order-alphabetical-ascending"
            size={16}
            color={orden === "nombre" ? "#fff" : "#555"}
          />
          <Text style={[s.ordenTxt, orden === "nombre" && s.ordenTxtActive]}>
            A-Z
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setOrden("cantidad")}
          style={[s.ordenBtn, orden === "cantidad" && s.ordenBtnActive]}
        >
          <MaterialCommunityIcons
            name="order-numeric-ascending"
            size={16}
            color={orden === "cantidad" ? "#fff" : "#555"}
          />
          <Text style={[s.ordenTxt, orden === "cantidad" && s.ordenTxtActive]}>
            Cantidad
          </Text>
        </Pressable>

        <Text style={s.countTxt}>{heladosFiltrados.length} productos</Text>
      </View>

      {/* LISTA */}
      <FlatList
        data={heladosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={[s.row, !item.activo && s.rowInactivo]}>
            <View style={{ flex: 1 }}>
              <Text style={s.sabor}>{item.sabor}</Text>
              <Text style={s.detalle}>
                ${item.precio?.toLocaleString("es-CO")} · {item.cantidad} und
              </Text>
              <Text
                style={[
                  s.estado,
                  { color: item.activo ? "#2e7d32" : "#c62828" },
                ]}
              >
                {item.activo ? "● Activo" : "● Inactivo"}
              </Text>
            </View>

            {/* BOTÓN MEDIA */}
            <Pressable
              onPress={() =>
                navigation.navigate("EditarMedia", { helado: item })
              }
              style={s.btnMedia}
            >
              <Text style={s.btnMediaTxt}>📝</Text>
            </Pressable>

            {/* SWITCH */}
            {loadingId === item.id ? (
              <ActivityIndicator style={{ marginLeft: 8 }} />
            ) : (
              <Switch
                value={item.activo === 1}
                onValueChange={() => toggleEstado(item)}
                trackColor={{ false: "#eee", true: "#a5d6a7" }}
                thumbColor={item.activo ? "#2e7d32" : "#bbb"}
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={s.empty}>
            {busqueda ? `Sin resultados para "${busqueda}"` : "Sin productos"}
          </Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: "#333" },
  filtrosRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  filtroBtn: {
    flex: 1,
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  filtroBtnActive: { backgroundColor: "#333" },
  filtroTxt: { fontSize: 12, fontWeight: "600", color: "#333" },
  filtroTxtActive: { color: "#fff" },
  ordenRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  ordenLabel: { fontSize: 12, color: "#888" },
  ordenBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  ordenBtnActive: { backgroundColor: "#e91e63" },
  ordenTxt: { fontSize: 12, fontWeight: "600", color: "#555" },
  ordenTxtActive: { color: "#fff" },
  countTxt: { marginLeft: "auto", fontSize: 12, color: "#aaa" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#f0f0f0",
  },
  rowInactivo: { backgroundColor: "#fafafa", opacity: 0.6 },
  sabor: { fontSize: 15, fontWeight: "700", color: "#222" },
  detalle: { fontSize: 12, color: "#888", marginTop: 2 },
  estado: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  btnMedia: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  btnMediaTxt: { fontSize: 16 },
  empty: { textAlign: "center", color: "#bbb", marginTop: 40, fontSize: 14 },
});
