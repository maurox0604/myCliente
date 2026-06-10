import React, { createContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase-config.js";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [emailUser, setEmailUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmailUser(currentUser.email);

        try {
          // ✅ getIdToken(true) fuerza refresh — evita el 401 en arranque frío
          const token = await currentUser.getIdToken(true);

          const response = await axios.get(
            `${process.env.EXPO_PUBLIC_API_URL}/users/me/role`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          setRole(response.data.rol);
        } catch (error) {
          console.error("Error fetching user role:", error.message);
          // No desloguear al usuario por un error de red — solo dejar role en null
          // El RootNavigator mostrará pantalla de error o reintentará
        }
      } else {
        setUser(null);
        setRole(null);
        setEmailUser(null);
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
    <AuthContext.Provider
      value={{ user, role, emailUser, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
