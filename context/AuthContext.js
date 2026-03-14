import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { firebaseConfig } from '../firebase-config.js';
// import { initializeApp } from "firebase/app";
import { auth } from '../firebase-config.js'; // ✅ importa el auth ya inicializado
import axios from "axios";
// import app from '../firebase-config.js';

const AuthContext = createContext();
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
    
const AuthProvider = ({ children }) => {
    
    
    const [user, setUser] = useState(null); // Datos básicos del usuario
    const [role, setRole] = useState(null); // Rol del usuario
    const [emailUser, setEmailUser] = useState(null);// Email del usuario
    const [loading, setLoading] = useState(true); // Estado de carga


     const authContextValue = {
        emailUser, // Este es el valor que usarás con `useContext`
        setEmailUser,
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth,async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            console.log("******User: ", currentUser);	
            console.log("Current user email:", currentUser.email);

            setEmailUser(currentUser.email);
            console.log("👉 API URL para roles:", process.env.EXPO_PUBLIC_API_URL);



            // Obtener el rol desde la base de datos
            try {
                const token = await currentUser.getIdToken();

                // const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/users/getUserRole`, {
                    
                //     email: currentUser.email, // Enviar el email en el cuerpo de la solicitud
                // });
                const response = await axios.get(
                    `${process.env.EXPO_PUBLIC_API_URL}/users/me/role`,
                    {
                        headers: {
                        Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // 🔍 LOGS TEMPORALES DE DIAGNÓSTICO
                console.log("📦 response.data completo:", JSON.stringify(response.data));
                console.log("📦 response.data.rol:", response.data.rol);
                console.log("📦 response.data.role:", response.data.role);


                setRole(response.data.rol); // Asignar el rol recibido
                console.log("rol role setRole: ", role)
                console.log("Rol response: ", response);
                console.log("Rol data: ", response.data);
                console.log("Rol: ", response.data.rol);
            } catch (error) {
                console.error('Error fetching user role:', error);
            }
        } else {
            setUser(null);
            setRole(null);
        }
        setLoading(false);
    });
        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, role, authContextValue, emailUser, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
