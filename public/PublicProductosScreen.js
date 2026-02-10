import { View, FlatList, Text, useWindowDimensions } from "react-native";
import { useContext, useState } from "react";
import PublicProductCard from "../components/PublicProductCard";
import PublicProductModal from "../components/PublicProductModal";
import PublicCartBar from "../components/PublicCartBar";
import PublicCartPanel from "../components/PublicCartPanel";
import { PublicProductosContext } from "../context/PublicProductosContext";

export default function PublicProductosScreen() {
    const { width, height } = useWindowDimensions();
    const [selected, setSelected] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const { productos, loading } = useContext(PublicProductosContext);

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
        </View>
    );
}
