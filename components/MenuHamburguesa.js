import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const MenuHamburguesa = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.menu}>
            <Pressable
                style={styles.item}
                onPress={() => navigation.navigate("VentaManual")}
            >
                <Text style={styles.text}>📅 Venta manual</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    menu: {
        position: "absolute",
        top: 60,
        right: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        elevation: 5,
    },
    item: {
        paddingVertical: 10,
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
    },
});

export default MenuHamburguesa;
