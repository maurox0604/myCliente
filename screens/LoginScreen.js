import React, { useContext, useState } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { AuthContext } from "../context/AuthContext.js";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  return (
    <View style={s.screen}>
      {/* Fondo oscuro explícito para web */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: "#1a0a10" }} />
      </View>

      {/* Blob top-right */}
      <View
        pointerEvents="none"
        style={[s.blob, { width: 300, height: 300, top: -80, right: -80 }]}
      />
      {/* Blob bottom-left */}
      <View
        pointerEvents="none"
        style={[
          s.blob,
          { width: 200, height: 200, bottom: -60, left: -60, opacity: 0.12 },
        ]}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            {/* LOGO */}
            <View style={s.logoArea}>
              <View style={s.logoCircle}>
                <Text style={s.logoEmoji}>🍦</Text>
              </View>
              <Text style={s.logoText}>Ice Queen</Text>
              <Text style={s.logoSub}>PANEL DE GESTIÓN</Text>
            </View>

            <Text style={s.greeting}>Hola, bienvenido 👋</Text>
            <Text style={s.sub}>Inicia sesión para continuar</Text>

            {/* EMAIL */}
            <View style={s.field}>
              <Text style={s.label}>Correo electrónico</Text>
              <TextInput
                style={s.input}
                placeholder="tu@correo.com"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            {/* PASSWORD */}
            <View style={s.field}>
              <Text style={s.label}>Contraseña</Text>
              <View style={s.inputWrap}>
                <TextInput
                  style={[s.input, { paddingRight: 48 }]}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={s.eyeBtn}
                  onPress={() => setShowPwd((p) => !p)}
                  activeOpacity={0.7}
                >
                  <Text style={s.eyeIcon}>{showPwd ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* RECOVERY */}
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 16 }}
            >
              <Text style={s.recovery}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* LOGIN BTN */}
            <TouchableOpacity
              style={s.btnPrimary}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={s.btnPrimaryText}>Iniciar sesión</Text>
            </TouchableOpacity>

            {/* DIVIDER */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>o continúa con</Text>
              <View style={s.dividerLine} />
            </View>

            {/* SOCIAL */}
            <View style={s.socialRow}>
              <TouchableOpacity style={s.socialBtn}>
                <Text style={s.socialText}>G Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.socialBtn}>
                <Text style={s.socialText}> Apple</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1a0a10",
    ...(Platform.OS === "web" && {
      minHeight: "100vh",
      height: "100vh",
      backgroundColor: "#1a0a10",
    }),
    position: "relative",
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#DB1B53",
    opacity: 0.18,
    zIndex: 0,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    ...(Platform.OS === "web" && {
      minHeight: "100vh", // ← y esta
    }),
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(219,27,83,0.3)",
    borderRadius: 24,
    padding: 28,
    zIndex: 2,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DB1B53",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
    marginBottom: 8,
  },
  logoEmoji: { fontSize: 32 },
  logoText: {
    fontSize: 22,
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 1,
    marginBottom: 4,
  },
  logoSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 2,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 20,
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(219,27,83,0.35)",
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 14,
    width: "100%",
  },
  inputWrap: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  eyeIcon: { fontSize: 16 },
  recovery: {
    fontSize: 12,
    color: "#DB1B53",
  },
  btnPrimary: {
    backgroundColor: "#DB1B53",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  dividerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
  },
  socialRow: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1,
    padding: 11,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    alignItems: "center",
  },
  socialText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
});
