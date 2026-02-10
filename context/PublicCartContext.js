import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";


export const PublicCartContext = createContext();

export function PublicCartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (producto, cantidad = 1) => {
    setItems(prev => {
      const existe = prev.find(p => p.id === producto.id);

      if (existe) {
        return prev.map(p =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + cantidad }
            : p
        );
      }

      return [...prev, { ...producto, cantidad }];
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(p => p.id !== id));
  };

  const updateCantidad = (id, cantidad) => {
    if (cantidad <= 0) return removeItem(id);

    setItems(prev =>
      prev.map(p =>
        p.id === id ? { ...p, cantidad } : p
      )
    );
  };

  const total = items.reduce(
  (sum, item) => sum + item.precio * item.cantidad,
  0
);

  const clearCart = () => setItems([]);

// Persistencia simple con localStorage o AsyncStorage
  const STORAGE_KEY = "public_cart";

  const storage = {
    async get() {
      if (Platform.OS === "web") {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } else {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      }
    },

    async set(value) {
      const json = JSON.stringify(value);
      if (Platform.OS === "web") {
        localStorage.setItem(STORAGE_KEY, json);
      } else {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        await AsyncStorage.setItem(STORAGE_KEY, json);
      }
    },
  };


  return (
    <PublicCartContext.Provider
      value={{ items, addItem, removeItem, updateCantidad, clearCart, total }}
    >
      {children}
    </PublicCartContext.Provider>
  );
}

// helper opcional
export const usePublicCart = () => useContext(PublicCartContext);
