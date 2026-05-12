// screens/HomeScreen.js
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import HomeFondo from "../assets/images/HomeFondo.png";

const BOTONES = [
  { label: "Sabores", screen: "Sabores", icon: "ice-cream", color: "#e91e63" },
  {
    label: "Editar helados",
    screen: "Editar",
    icon: "ice-pop",
    color: "#9c27b0",
  },
  {
    label: "Ventas",
    screen: "Ventas",
    icon: "cash-register",
    color: "#00897b",
  },
  {
    label: "Reportes",
    screen: "Reportes",
    icon: "chart-pie",
    color: "#1565c0",
  },
  {
    label: "Activar/Desactivar",
    screen: "HeladosAdmin",
    icon: "chart-pie",
    color: "#ffdded",
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { role } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Fondo */}
      <Image source={HomeFondo} style={styles.fondo} />

      {/* Overlay oscuro para legibilidad */}
      <View style={styles.overlay} />

      {/* Contenido */}
      <View style={styles.content}>
        {/* Logo / título */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="crown" size={40} color="#e91e63" />
          <Text style={styles.titulo}>Ice Queen</Text>
          <Text style={styles.subtitulo}>Panel de control</Text>
        </View>

        {/* Grid de botones principales */}
        <View style={styles.grid}>
          {BOTONES.map((b) => (
            <TouchableOpacity
              key={b.screen}
              style={[styles.boton, { borderColor: b.color }]}
              onPress={() => navigation.navigate(b.screen)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name={b.icon} size={28} color={b.color} />
              <Text style={[styles.botonLabel, { color: b.color }]}>
                {b.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón Dashboard — solo superadmin */}
        {role === "superadmin" && (
          <TouchableOpacity
            style={styles.dashboardBtn}
            onPress={() => navigation.navigate("Dashboard")}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="chart-bar" size={22} color="#fff" />
            <Text style={styles.dashboardBtnText}>Ver Dashboard</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#111" },

  fondo: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 100, // espacio para la tab bar flotante
  },

  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
    marginTop: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },

  // Grid 2x2
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    width: "100%",
    maxWidth: 420,
    marginBottom: 24,
  },

  boton: {
    width: "45%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
    backdropFilter: "blur(10px)",
  },
  botonLabel: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  // Botón Dashboard destacado
  dashboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#e91e63",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#e91e63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  dashboardBtnText: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
