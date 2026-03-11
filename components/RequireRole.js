import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { View, Text } from "react-native";

/**
 * Componente que restringe acceso por rol
 */
export default function RequireRole({ allowedRoles, children }) {
    const { role, loading } = useContext(AuthContext);

    if (loading) return null;

    if (!allowedRoles.includes(role)) {
        return (
        <View>
            <Text>No tienes permisos para acceder a esta sección.</Text>
        </View>
        );
    }

    return children;
}
