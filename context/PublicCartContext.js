import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";


export const PublicCartContext = createContext();

export function PublicCartProvider({ children }) {
  const [items, setItems] = useState([]);

  /* ================= FUNCIONES DE CARRITO ================= */
  // Agregar producto al carrito
  const addItem = (producto, cantidad = 1) => {
  setItems(prev => {
    const existe = prev.find(p => p.id === producto.id);

    const cantidadEnCarrito = existe ? existe.cantidad : 0;
    const nuevaCantidad = cantidadEnCarrito + cantidad;

    // 🔒 Validación de stock
    if (nuevaCantidad > producto.cantidad) {
      alert(`Solo quedan ${producto.cantidad} en existencia`);
      return prev; // No modifica el carrito
    }

    if (existe) {
      return prev.map(p =>
        p.id === producto.id
          ? { ...p, cantidad: nuevaCantidad }
          : p
      );
    }

    return [
      ...prev,
      {
        ...producto,
        stock: producto.cantidad, // guardamos stock separado
        cantidad
      }
    ];
  });
};

  const removeItem = (id) => {
    setItems(prev => prev.filter(p => p.id !== id));
  };

  // Actualizar cantidad de un producto en el carrito
const updateCantidad = (id, cantidadNueva) => {
  setItems(prev => {
    const item = prev.find(p => p.id === id);
    if (!item) return prev;

    if (cantidadNueva <= 0) {
      return prev.filter(p => p.id !== id);
    }

    if (cantidadNueva > item.stock) {
      alert(`Por HOY Solo quedan ${item.stock} en existencia`);
      return prev;
    }

    return prev.map(p =>
      p.id === id ? { ...p, cantidad: cantidadNueva } : p
    );
  });
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
