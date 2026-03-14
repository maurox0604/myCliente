import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

// =======================
// Screens
// =======================
import HomeScreen from "../screens/HomeScreen";
import StackEdit from "../screens/StackEdit";
import ListaHelados from "../screens/ListaHelados";
import VentasScreen from "../screens/VentasScreen";
import ReportesScreen from "../screens/ReportesScreen";

// =======================
// Components
// =======================
import SedeSelectorHeader from "../components/SedeSelectorHeader";

// =======================
// Contexts
// =======================
import { CartContext } from "../context/CartContext";

// =======================
// Navigator
// =======================
const Tab = createBottomTabNavigator();

/**
 * HomeTabs
 * ----------
 * Navegación principal por pestañas de la app (zona privada).
 *
 * ⚠️ IMPORTANTE:
 * - Este navigator NO maneja NavigationContainer
 * - Vive dentro de MainStack
 * - Recibe funciones desde arriba para abrir modales
 */

export default function HomeTabs({
  openCartModal,
  openMenuVenta,
  openSedeModal,
}) {
  const { cartItemCount, cartItemCero } = useContext(CartContext);
  const { logout, role } = useContext(AuthContext);
  const navigation = useNavigation(); // ✅ NUEVO: hook de navegación


  const handleLogout = async () => {
  await logout();
  navigation.reset({         // ✅ NUEVO: resetea el stack y navega al Welcome
    index: 0,
    routes: [{ name: "Welcome" }],
  });
};


  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: "#e91e63",
        headerTitleAlign: "center",
        headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={{ marginRight: 15, flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <MaterialCommunityIcons name="logout" size={22} color="#e91e63" />
          {/* ✅ Muestra "..." mientras carga, y el rol cuando está disponible */}
          <Text style={{ color: "#e91e63", fontSize: 12 }}>
            {role ?? "..."}
          </Text>
        </TouchableOpacity>
      ),
      }}
    >
      {/* ================= HOME ================= */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />

      {/* ================= EDITAR ================= */}
      <Tab.Screen
        name="Editar"
        component={StackEdit}
        options={{
          tabBarLabel: "Editar",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="ice-pop" color={color} size={size} />
          ),
          // Badge con cantidad (ej: pendientes)
          tabBarBadge: cartItemCero > 0 ? cartItemCero : undefined,
        }}
      />

      {/* ================= CARRITO =================
           No navega a pantalla, abre modal */}
      <Tab.Screen
        name="Carrito"
        component={() => null} // no se renderiza pantalla
        options={{
          tabBarLabel: "Carrito",
          tabBarIcon: ({ color }) => (
            <View style={{ top: -10 }}>
              <MaterialCommunityIcons name="cart" color={color} size={28} />
              {cartItemCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    right: -6,
                    top: -4,
                    backgroundColor: "red",
                    borderRadius: 10,
                    width: 18,
                    height: 18,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 10 }}>
                    {cartItemCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            openCartModal(); // abre BottomSheet
          },
        }}
      />

      {/* ================= SABORES ================= */}
      <Tab.Screen
        name="Sabores"
        component={ListaHelados}
        options={{
          tabBarLabel: "Sabores",
          headerTitle: "Sabores",
          headerRight: () => (
            <SedeSelectorHeader
              onOpenMenu={openMenuVenta}
              onOpenSede={openSedeModal}
            />
          ),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="flip-vertical"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* ================= VENTAS ================= */}
      <Tab.Screen
        name="Ventas"
        component={VentasScreen}
        options={{
          tabBarLabel: "Ventas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cash-register"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* ================= REPORTES ================= */}
      <Tab.Screen
        name="Reportes"
        component={ReportesScreen}
        options={{
          tabBarLabel: "Reportes",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-pie"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
