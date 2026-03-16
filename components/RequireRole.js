import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";


 const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
            backgroundColor: "#fff",
            gap: 12,
        },
        title: {
            fontSize: 22,
            fontWeight: "bold",
            color: "#333",
        },
        subtitle: {
            fontSize: 15,
            color: "#666",
            textAlign: "center",
            lineHeight: 22,
        },
        role: {
            fontWeight: "bold",
            color: "#e91e63",
        },
    });

/**
 * Componente que restringe acceso por rol
 */
export default function RequireRole({ allowedRoles, children }) {
    const { role, loading } = useContext(AuthContext);

    if (loading) return null;

    if (!allowedRoles.includes(role)) {
        return (
        <View style={styles.container}>
            <MaterialCommunityIcons name="lock" size={60} color="#e91e63" />
            <Text style={styles.title}>Acceso Restringido</Text>
            <Text style={styles.subtitle}>
            Tu rol <Text style={styles.role}>"{role}"</Text> no tiene permisos para esta sección.
            </Text>
        </View>
        );
    }


    return children;
}
