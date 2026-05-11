import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import RegisterScreen from "../screens/RegisterScreen";

import HomeScreen from "../screens/HomeScreen";
import StackEdit from "../screens/StackEdit";
import ListaHelados from "../screens/ListaHelados";
import VentasScreen from "../screens/VentasScreen";
import ReportesScreen from "../screens/ReportesScreen";
import DashboardScreen from "../screens/DashboardScreen";
import SedeSelectorHeader from "../components/SedeSelectorHeader";
import { CartContext } from "../context/CartContext";

const Tab = createBottomTabNavigator();

function CartTabButton({ children, onPress, cartItemCount }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.cartButtonWrapper}
    >
      <View style={styles.cartButton}>
        <MaterialCommunityIcons name="cart" color="#fff" size={28} />
        {cartItemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeTabs({
  openCartModal,
  openMenuVenta,
  openSedeModal,
}) {
  const { cartItemCount, cartItemCero } = useContext(CartContext);
  const { logout, role } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: "#e91e63",
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#333",
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={22} color="#e91e63" />
            <Text style={styles.logoutText}>{role ?? "..."}</Text>
          </TouchableOpacity>
        ),
      }}
    >
      {/* HOME */}
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

      {/* EDITAR */}
      <Tab.Screen
        name="Editar"
        component={StackEdit}
        options={{
          tabBarLabel: "Editar",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="ice-pop" color={color} size={size} />
          ),
          tabBarBadge: cartItemCero > 0 ? cartItemCero : undefined,
        }}
      />

      {/* SABORES */}
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

      {/* CARRITO — botón flotante central */}
      <Tab.Screen
        name="Carrito"
        component={() => null}
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <CartTabButton
              {...props}
              cartItemCount={cartItemCount}
              onPress={openCartModal}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            openCartModal();
          },
        }}
      />

      {/* VENTAS */}
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

      {/* DASHBOARD — accesible solo desde HomeScreen, oculto en tab bar */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-bar"
              color={color}
              size={size}
            />
          ),
          tabBarButton: () => null,
        }}
      />

      {/* REPORTES */}
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

      {/* USUARIOS — solo superadmin */}
      <Tab.Screen
        name="Usuarios"
        component={RegisterScreen}
        options={{
          tabBarLabel: "Usuarios",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-plus"
              color={color}
              size={size}
            />
          ),
          tabBarButton: role === "superadmin" ? undefined : () => null,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 0,
    height: 65,
    paddingBottom: 8,
    paddingTop: 4,
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: Platform.OS === "ios" ? 20 : 8,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 12,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  tabLabel: { fontSize: 10, fontWeight: "600" },
  cartButtonWrapper: {
    top: -22,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
  },
  cartButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e91e63",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00bcd4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 6,
    borderColor: "#fff",
  },
  cartBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#00bcd4",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  logoutButton: {
    marginRight: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logoutText: { color: "#e91e63", fontSize: 12, fontWeight: "600" },
});
