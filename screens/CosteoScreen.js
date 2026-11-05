// screens/CosteoScreen.js
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useCosteo } from "../context/CosteoContext";

import IngredientesTab from "../components/costeo/IngredientesTab";
import PreparacionesTab from "../components/costeo/PreparacionesTab";
import BasesTab from "../components/costeo/BasesTab";
import PackagingTab from "../components/costeo/PackagingTab";
import CostosFijosTab from "../components/costeo/CostosFijosTab";
import RecetasTab from "../components/costeo/RecetasTab";

const TABS = [
  { key: "ingredientes", label: "Ingredientes" },
  { key: "preparaciones", label: "Preparaciones" },
  { key: "bases", label: "Bases" },
  { key: "packaging", label: "Packaging" },
  { key: "fijos", label: "Costos fijos" },
  { key: "recetas", label: "Recetas" },
];

export default function CosteoScreen() {
  const { initCosteo, loading } = useCosteo();
  const [tab, setTab] = useState("ingredientes");

  useEffect(() => {
    initCosteo();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Cargando módulo de costeo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧮 Costeo de helados</Text>
      </View>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text
              style={[styles.tabText, tab === t.key && styles.tabTextActive]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* CONTENIDO */}
      <View style={styles.content}>
        {tab === "ingredientes" && <IngredientesTab />}
        {tab === "preparaciones" && <PreparacionesTab />}
        {tab === "bases" && <BasesTab />}
        {tab === "packaging" && <PackagingTab />}
        {tab === "fijos" && <CostosFijosTab />}
        {tab === "recetas" && <RecetasTab />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#666", fontSize: 14 },

  header: {
    backgroundColor: "#e91e63",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: "#e91e63",
  },
  tabText: { fontSize: 11, color: "#888", fontWeight: "600" },
  tabTextActive: { color: "#e91e63" },

  content: { flex: 1 },
});
