import { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Switch,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { HeladosContext } from "../context/HeladosContext";

export default function HeladosAdminScreen() {
  const {
    helados,
    activarProducto,
    desactivarProducto,
    loadingId,
    fetchHeladosAdmin,
  } = useContext(HeladosContext);

    const [filtro, setFiltro] = useState("todos");
    
    useEffect(() => {
  fetchHeladosAdmin();
}, []);


  const toggleEstado = (item) => {
    if (item.activo) {
      const confirm = window.confirm(
        `¿Desactivar ${item.sabor}?`
      );
      if (!confirm) return;

      desactivarProducto(item.id);
    } else {
      activarProducto(item.id);
    }
  };

  const heladosFiltrados = helados.filter(h => {
    if (filtro === "activos") return h.activo === 1;
    if (filtro === "inactivos") return h.activo === 0;
    return true;
  });

  return (
    <View style={{ flex: 1, padding: 12 }}>

      {/* FILTROS */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 12
      }}>
        {["todos", "activos", "inactivos"].map(tipo => (
          <Pressable
            key={tipo}
            onPress={() => setFiltro(tipo)}
            style={{
              padding: 8,
              borderRadius: 6,
              backgroundColor:
                filtro === tipo ? "#333" : "#ddd"
            }}
          >
            <Text style={{
              color: filtro === tipo ? "white" : "black"
            }}>
              {tipo.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={heladosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{
            padding: 12,
            borderBottomWidth: 1,
            borderColor: "#eee",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <View>
              <Text style={{ fontWeight: "bold" }}>
                {item.sabor}
              </Text>

              <Text>
                ${item.precio}
              </Text>

              <Text style={{
                color: item.activo ? "green" : "red"
              }}>
                {item.activo ? "Activo" : "Inactivo"}
              </Text>
            </View>

            {loadingId === item.id ? (
              <ActivityIndicator />
            ) : (
              <Switch
                value={item.activo === 1}
                onValueChange={() => toggleEstado(item)}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}
