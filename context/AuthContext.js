import React, { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { firebaseConfig } from '../firebase-config.js';
import { initializeApp } from "firebase/app";
import axios from "axios";
// import app from '../firebase-config.js';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
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


            // Obtener el rol desde la base de datos
            try {
                // const response = await axios.post('http://localhost:3001/getUserRole', {
                const response = await axios.post(`https://backend-de-prueba-delta.vercel.app/getUserRole`, {
                    
                    email: currentUser.email, // Enviar el email en el cuerpo de la solicitud
                });
                setRole(response.data.rol); // Asignar el rol recibido
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
    }, [auth]);

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
