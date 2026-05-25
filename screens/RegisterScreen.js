// client/screens/RegisterScreen.js
import React, { useState, useContext, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext.js";
import RequireRole from "../components/RequireRole";

const ROLES = ["vendedor", "admin", "superadmin"];

const ROLE_COLORS = {
  superadmin: { bg: "#fce4ec", border: "#e91e63", text: "#c2185b" },
  admin: { bg: "#e3f2fd", border: "#1976d2", text: "#1565c0" },
  vendedor: { bg: "#f3e5f5", border: "#7b1fa2", text: "#6a1b9a" },
};

// ─── Componente: tarjeta de usuario ────────────────────────────────────────
const UserCard = ({ item, onChangeRol, onToggle, currentUserEmail }) => {
  const isSelf = item.email === currentUserEmail;
  const colors = ROLE_COLORS[item.rol] || ROLE_COLORS.vendedor;

  return (
    <View style={[styles.card, !item.activo && styles.cardInactive]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{item.name || "(sin nombre)"}</Text>
          <Text style={styles.cardEmail}>{item.email}</Text>
        </View>
        <View
          style={[
            styles.rolBadge,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.rolBadgeText, { color: colors.text }]}>
            {item.rol}
          </Text>
        </View>
      </View>

      {/* Cambio de rol — deshabilitado si es uno mismo o está inactivo */}
      {!isSelf && item.activo === 1 && (
        <View style={styles.rolRow}>
          <Text style={styles.rolLabel}>Cambiar rol:</Text>
          <View style={styles.rolPills}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => {
                  console.log("🔘 pill tocado:", r);
                  onChangeRol(item.id, r);
                }}
                style={[
                  styles.rolPill,
                  item.rol === r && {
                    backgroundColor: ROLE_COLORS[r].bg,
                    borderColor: ROLE_COLORS[r].border,
                  },
                ]}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.rolPillText,
                    item.rol === r && { color: ROLE_COLORS[r].text },
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isSelf && <Text style={styles.selfNote}>Este es tu usuario</Text>}

      {/* Toggle activo/inactivo */}
      {!isSelf && (
        <Pressable
          onPress={() => onToggle(item)}
          style={[
            styles.toggleBtn,
            item.activo ? styles.toggleBtnDeactivate : styles.toggleBtnActivate,
          ]}
        >
          <Text style={styles.toggleBtnText}>
            {item.activo ? "🚫 Desactivar" : "✅ Reactivar"}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

// ─── Pantalla principal ─────────────────────────────────────────────────────
const RegisterScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  // Formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("vendedor");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Lista
  const [usuarios, setUsuarios] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sección activa
  const [seccion, setSeccion] = useState("lista"); // 'lista' | 'crear'

  // ── helpers ──────────────────────────────────────────────────────────────
  const getToken = async () => {
    const token = await user?.getIdToken();
    if (!token) throw new Error("Sin token de autenticación");
    return token;
  };

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  // ── cargar lista ─────────────────────────────────────────────────────────
  const cargarUsuarios = useCallback(
    async (showRefresh = false) => {
      showRefresh ? setRefreshing(true) : setLoadingList(true);
      try {
        const token = await getToken();
        const res = await fetch(`${apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("👥 usuarios:", JSON.stringify(data.users));
        if (!res.ok) throw new Error(data.error || "Error al cargar usuarios");
        setUsuarios(data.users);
      } catch (err) {
        Alert.alert("Error", err.message);
      } finally {
        setLoadingList(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      cargarUsuarios();
    }, [cargarUsuarios]),
  );

  // ── crear usuario ─────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Todos los campos son requeridos");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          rol,
        }),
      });
      const data = await res.json();
      console.log("📦 respuesta register:", res.status, data);
      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudo crear el usuario");
        return;
      }
      Alert.alert("✅ Listo", `${name} (${rol}) fue creado correctamente`);
      setName("");
      setEmail("");
      setPassword("");
      setRol("vendedor");
      setSeccion("lista");
      cargarUsuarios();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setCreating(false);
    }
  };

  // ── cambiar rol ───────────────────────────────────────────────────────────
  const handleChangeRol = (id, nuevoRol) => {
    const usuario = usuarios.find((u) => u.id === id);
    if (!usuario || usuario.rol === nuevoRol) return;

    const confirmar = window.confirm(
      `¿Cambiar a ${usuario.name} de "${usuario.rol}" a "${nuevoRol}"?`,
    );
    if (!confirmar) return;

    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${apiUrl}/users/${id}/rol`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rol: nuevoRol }),
        });
        const data = await res.json();
        if (!res.ok) {
          window.alert(data.error || "No se pudo cambiar el rol");
          return;
        }
        setUsuarios((prev) =>
          prev.map((u) => (u.id === id ? { ...u, rol: nuevoRol } : u)),
        );
      } catch (err) {
        window.alert(err.message);
      }
    })();
  };

  // ── desactivar / reactivar ────────────────────────────────────────────────

  const handleToggle = (item) => {
    const accion = item.activo ? "desactivar" : "reactivar";
    const confirmar = window.confirm(
      `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${item.name} (${item.email})?`,
    );
    if (!confirmar) return;

    (async () => {
      try {
        const token = await getToken();
        const endpoint = item.activo
          ? `${apiUrl}/users/${item.id}`
          : `${apiUrl}/users/${item.id}/reactivar`;
        const method = item.activo ? "DELETE" : "PUT";
        const res = await fetch(endpoint, {
          method,
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          window.alert(data.error || "No se pudo completar la acción");
          return;
        }
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === item.id ? { ...u, activo: item.activo ? 0 : 1 } : u,
          ),
        );
      } catch (err) {
        window.alert(err.message);
      }
    })();
  };
  // const handleToggle = (item) => {
  //   const accion = item.activo ? "desactivar" : "reactivar";

  //    const confirmar = window.confirm(
  //      `¿Cambiar a ${usuario.name} de "${usuario.rol}" a "${nuevoRol}"?`,
  //    );
  //   if (!confirmar) return;

  // Alert.alert(
  //   `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario?`,
  //   `${item.name} (${item.email})`,
  //   [
  //     { text: "Cancelar", style: "cancel" },
  //     {
  //       text: "Confirmar",
  //       style: item.activo ? "destructive" : "default",
  //       onPress: async () => {
  //         try {
  //           const token = await getToken();
  //           const endpoint = item.activo
  //             ? `${apiUrl}/users/${item.id}`
  //             : `${apiUrl}/users/${item.id}/reactivar`;
  //           const method = item.activo ? "DELETE" : "PUT";
  //           const res = await fetch(endpoint, {
  //             method,
  //             headers: { Authorization: `Bearer ${token}` },
  //           });
  //           const data = await res.json();
  //           if (!res.ok) {
  //             Alert.alert(
  //               "Error",
  //               data.error || "No se pudo completar la acción",
  //             );
  //             return;
  //           }
  //           // Actualiza localmente
  //           setUsuarios((prev) =>
  //             prev.map((u) =>
  //               u.id === item.id ? { ...u, activo: item.activo ? 0 : 1 } : u,
  //             ),
  //           );
  //         } catch (err) {
  //           Alert.alert("Error", err.message);
  //         }
  //       },
  //     },
  //   ],
  // );
  // };

  // ── render lista ──────────────────────────────────────────────────────────
  const renderLista = () => {
    if (loadingList) {
      return <ActivityIndicator color="#e91e63" style={{ marginTop: 40 }} />;
    }
    return (
      <FlatList
        data={usuarios}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => cargarUsuarios(true)}
            tintColor="#e91e63"
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No hay usuarios registrados !</Text>
        }
        renderItem={({ item }) => (
          <UserCard
            item={item}
            onChangeRol={handleChangeRol}
            onToggle={handleToggle}
            currentUserEmail={user?.email}
          />
        )}
      />
    );
  };

  // ── render crear ──────────────────────────────────────────────────────────
  const renderCrear = () => (
    <ScrollView
      contentContainerStyle={styles.formScroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>Nuevo usuario</Text>

      <Text style={styles.fieldLabel}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        onChangeText={setName}
        value={name}
        autoCorrect={false}
      />

      <Text style={styles.fieldLabel}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="correo@ejemplo.com"
        onChangeText={setEmail}
        value={email}
        autoCorrect={false}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.fieldLabel}>Contraseña</Text>
      <View style={styles.passRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Mínimo 6 caracteres"
          onChangeText={setPassword}
          value={password}
          autoCorrect={false}
          secureTextEntry={!showPassword}
        />
        <Pressable
          onPress={() => setShowPassword((v) => !v)}
          style={styles.eyeBtn}
        >
          <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
        </Pressable>
      </View>

      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Rol</Text>
      <View style={styles.rolContainer}>
        {ROLES.map((r) => (
          <Pressable
            key={r}
            onPress={() => setRol(r)}
            style={[
              styles.rolButton,
              rol === r && {
                borderColor: ROLE_COLORS[r].border,
                backgroundColor: ROLE_COLORS[r].bg,
              },
            ]}
          >
            <Text
              style={[
                styles.rolText,
                rol === r && { color: ROLE_COLORS[r].text },
              ]}
            >
              {r}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.button, creating && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear usuario</Text>
        )}
      </Pressable>
    </ScrollView>
  );

  // ── render principal ──────────────────────────────────────────────────────
  return (
    <RequireRole allowedRoles={["superadmin"]}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.title}>Usuarios</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Tab selector */}
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setSeccion("lista")}
            style={[styles.tab, seccion === "lista" && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                seccion === "lista" && styles.tabTextActive,
              ]}
            >
              Lista
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSeccion("crear")}
            style={[styles.tab, seccion === "crear" && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                seccion === "crear" && styles.tabTextActive,
              ]}
            >
              + Crear
            </Text>
          </Pressable>
        </View>

        {/* Contenido */}
        {seccion === "lista" ? renderLista() : renderCrear()}
      </SafeAreaView>
    </RequireRole>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#353147" },
  backButton: { padding: 4 },
  backText: { fontSize: 22, color: "#888" },

  // Tabs
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#e91e63" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#aaa" },
  tabTextActive: { color: "#e91e63" },

  // Lista
  empty: { textAlign: "center", color: "#aaa", marginTop: 60, fontSize: 15 },

  // Card
  card: {
    backgroundColor: "#fafafa",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardInactive: { opacity: 0.5 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardName: { fontSize: 15, fontWeight: "700", color: "#353147" },
  cardEmail: { fontSize: 13, color: "#888", marginTop: 2 },
  rolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  rolBadgeText: { fontSize: 12, fontWeight: "700" },

  rolRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  rolLabel: { fontSize: 13, color: "#888", marginRight: 4 },
  rolPills: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  rolPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
  },
  rolPillText: { fontSize: 12, fontWeight: "600", color: "#aaa" },

  selfNote: {
    fontSize: 12,
    color: "#aaa",
    fontStyle: "italic",
    marginBottom: 4,
  },

  toggleBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  toggleBtnDeactivate: {
    backgroundColor: "#fff0f3",
    borderWidth: 1,
    borderColor: "#e91e63",
  },
  toggleBtnActivate: {
    backgroundColor: "#f0fff4",
    borderWidth: 1,
    borderColor: "#388e3c",
  },
  toggleBtnText: { fontSize: 13, fontWeight: "600", color: "#555" },

  // Formulario
  formScroll: { padding: 24, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#353147",
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#353147",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 15,
  },
  passRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 18 },

  rolContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  rolButton: {
    flex: 1,
    minWidth: 80,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
  },
  rolText: { fontWeight: "600", color: "#888", fontSize: 13 },

  button: {
    backgroundColor: "#e91e63",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#ccc" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
