import {
  View,
  FlatList,
  Text,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { useContext, useState } from "react";
import PublicProductCard from "../components/PublicProductCard";
import PublicProductModal from "../components/PublicProductModal";
import PublicCartBar from "../components/PublicCartBar";
import PublicCartPanel from "../components/PublicCartPanel";
import { PublicProductosContext } from "../context/PublicProductosContext";
import { usePublicCart } from "../context/PublicCartContext";

export default function PublicProductosScreen() {
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { productos, loading } = useContext(PublicProductosContext);
  const { toast } = usePublicCart(); // Para mostrar mensajes al usuario

  const numColumns = width < 600 ? 2 : width < 900 ? 3 : 4;

  if (loading || !productos) {
    return <Text>Cargando...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* CATÁLOGO */}
      <FlatList
        data={productos}
        key={numColumns}
        numColumns={numColumns}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => (
          <PublicProductCard
            producto={item}
            onPress={() => setSelected(item)}
          />
        )}
      />

      {/* MODAL PRODUCTO */}
      <PublicProductModal
        visible={!!selected}
        producto={selected}
        onClose={() => setSelected(null)}
      />

      {/* BARRA CARRITO */}
      <PublicCartBar onPress={() => setCartOpen(true)} />

      {/* PANEL CARRITO */}
      <PublicCartPanel
        visible={cartOpen}
        onClose={() => setCartOpen(false)}
        screenHeight={height}
      />

      {/* TOAST NOTIFICATION LIVIANO */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast.mensaje}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 90, // encima de la barra del carrito
    left: 20,
    right: 20,
    backgroundColor: "rgba(30,30,30,0.88)",
    paddingVertical: 52,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    zIndex: 9999,
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
