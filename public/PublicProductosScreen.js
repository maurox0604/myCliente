import { View, FlatList, Text, ActivityIndicator, useWindowDimensions } from "react-native";
import { useContext, useState } from "react";
// import { productosContext } from "../context/productosContext";
import PublicProductCard from "../components/PublicProductCard";
import PublicProductModal from "../components/PublicProductModal";
import { PublicProductosContext } from "../context/PublicProductosContext";
import PublicSkeletonCard from "../components/PublicSkeletonCard";

export default function PublicProductosScreen() {
//   const { productos, loading } = useContext(productosContext);
    const { width } = useWindowDimensions();
    const [selected, setSelected] = useState(null);
    const { productos, loading } = useContext(PublicProductosContext);


    const numColumns = width < 600 ? 2 : width < 900 ? 3 : 4;
    
    console.log("🧩 productos en pantalla:", productos);

// 1️⃣ Aún no hay datos
if (loading || productos === null) {
  return (
    <FlatList
      data={Array.from({ length: 6 })}
      numColumns={numColumns}
      renderItem={() => <PublicSkeletonCard />}
    />
  );
}

// 2️⃣ Ya cargó, pero está vacío
if (productos.length === 0) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>No hay productos disponibles</Text>
    </View>
  );
}


  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={productos}
        key={numColumns}
        numColumns={numColumns}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <PublicProductCard
            producto={item}
            onPress={() => setSelected(item)}
          />
        )}
      />

      <PublicProductModal
        visible={!!selected}
        producto={selected}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}
