import React, { useState, useContext } from 'react';
import {
    SafeAreaView, ScrollView, TextInput, StyleSheet,
    Text, View, Pressable, Alert, ActivityIndicator
} from 'react-native';
// import { auth } from '../firebase-config.js';
import { AuthContext } from '../context/AuthContext.js';
import RequireRole from '../components/RequireRole';

const ROLES = ["vendedor", "superadmin"];

const RegisterScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('vendedor'); // ✅ rol seleccionado, default vendedor
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert("Error", "Todos los campos son requeridos");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);
        try {
            // ✅ Usa user.getIdToken() desde AuthContext
            const token = await user?.getIdToken();

            console.log("👤 user desde AuthContext:", user?.email);
            console.log("🔑 token existe:", !!token);

            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ name, email, password, rol }),
            })

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Error", data.error || "No se pudo crear el usuario");
                return;
            }

            Alert.alert("✅ Usuario creado", `${name} (${rol}) fue registrado correctamente`);
            // Limpia el formulario
            setName('');
            setEmail('');
            setPassword('');
            setRol('vendedor');

        } catch (error) {
            console.error("Error en registro:", error);
            Alert.alert("Error", "Error al crear el usuario");
        } finally {
            setLoading(false);
        }
    };

    return (
         <RequireRole allowedRoles={["superadmin"]}>
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>Crear Usuario</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    onChangeText={setName}
                    value={name}
                    autoCorrect={false}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    onChangeText={setEmail}
                    value={email}
                    autoCorrect={false}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña (mín. 6 caracteres)"
                    onChangeText={setPassword}
                    value={password}
                    autoCorrect={false}
                    secureTextEntry={true}
                />

                {/* ✅ Selector de rol */}
                <Text style={styles.label}>Rol:</Text>
                <View style={styles.rolContainer}>
                    {ROLES.map((r) => (
                        <Pressable
                            key={r}
                            onPress={() => setRol(r)}
                            style={[styles.rolButton, rol === r && styles.rolButtonActive]}
                        >
                            <Text style={[styles.rolText, rol === r && styles.rolTextActive]}>
                                {r}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>Crear usuario</Text>
                    }
                </Pressable> */}

                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Volver</Text>
                </Pressable>
            </ScrollView>
            </SafeAreaView>
        </RequireRole>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { padding: 30, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '700', marginBottom: 30, color: '#353147' },
    label: { alignSelf: 'flex-start', fontWeight: '600', marginBottom: 8, color: '#353147' },
    input: {
        backgroundColor: '#f5f5f5', padding: 14, borderRadius: 10,
        marginBottom: 16, width: '100%', fontSize: 16,
    },
    rolContainer: { flexDirection: 'row', gap: 12, marginBottom: 24, width: '100%' },
    rolButton: {
        flex: 1, padding: 14, borderRadius: 10, borderWidth: 2,
        borderColor: '#ddd', alignItems: 'center',
    },
    rolButtonActive: { borderColor: '#e91e63', backgroundColor: '#fce4ec' },
    rolText: { fontWeight: '600', color: '#888' },
    rolTextActive: { color: '#e91e63' },
    button: {
        backgroundColor: '#e91e63', width: '100%', padding: 16,
        borderRadius: 12, alignItems: 'center', marginBottom: 16,
    },
    buttonDisabled: { backgroundColor: '#ccc' },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    backButton: { marginTop: 8 },
    backText: { color: '#888', fontSize: 14 },
});