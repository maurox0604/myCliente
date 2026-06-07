import { createContext, useContext, useState } from "react";
import { Platform } from "react-native";

export const PublicCartContext = createContext();

export function PublicCartProvider({ children }) {
  const [items, setItems] = useState([]);
  // Toast liviano en lugar de alert() bloqueante
  const [toast, setToast] = useState(null); // { mensaje: string }

  const showToast = (mensaje) => {
    setToast({ mensaje });
    setTimeout(() => setToast(null), 2500);
  };

  /* ─────────────────────────────────────────
   * addItem — agrega o incrementa un producto
   * stockActual: cantidad real del servidor
   *   (se pasa desde el contexto de productos
   *    para usar siempre el valor más fresco)
   * ───────────────────────────────────────── */
  const addItem = (producto, cantidad = 1, stockActual) => {
    // stockActual puede venir del contexto de productos (más fresco)
    // o del campo cantidad del producto como fallback
    const stockDisponible = stockActual ?? producto.cantidad;

    setItems((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      const cantidadEnCarrito = existe ? existe.cantidad : 0;
      const nuevaCantidad = cantidadEnCarrito + cantidad;

      if (nuevaCantidad > stockDisponible) {
        const restante = stockDisponible - cantidadEnCarrito;
        if (restante <= 0) {
          showToast(`No hay más ${producto.nombre} disponible 😔`);
        } else {
          showToast(`Solo quedan ${restante} unidad${restante > 1 ? "es" : ""} de ${producto.nombre}`);
        }
        return prev; // no modifica el carrito
      }

      if (existe) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: nuevaCantidad } : p
        );
      }

      return [
        ...prev,
        {
          ...producto,
          stock: stockDisponible, // guardamos stock separado
          cantidad,
        },
      ];
    });
  };

  /* ─────────────────────────────────────────
   * syncStock — actualiza el stock guardado en
   * cada ítem del carrito cuando llega polling
   * (llamar desde PublicProductosContext)
   * ───────────────────────────────────────── */
  const syncStock = (productosActualizados) => {
    if (!productosActualizados?.length) return;

    setItems((prev) =>
      prev.map((item) => {
        const productoFresco = productosActualizados.find((p) => p.id === item.id);
        if (!productoFresco) return item;

        const nuevoStock = productoFresco.cantidad;

        // Si el carrito ya tiene más de lo disponible, recortamos
        if (item.cantidad > nuevoStock) {
          showToast(
            nuevoStock === 0
              ? `${item.nombre} ya no está disponible 😔`
              : `Solo quedan ${nuevoStock} unidad${nuevoStock > 1 ? "es" : ""} de ${item.nombre}`
          );
          if (nuevoStock === 0) {
            return null; // marcamos para filtrar
          }
          return { ...item, stock: nuevoStock, cantidad: nuevoStock };
        }

        return { ...item, stock: nuevoStock };
      }).filter(Boolean) // elimina los que quedaron en null
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  /* ─────────────────────────────────────────
   * updateCantidad — usado en el panel del carrito
   * con botones + y −
   * ───────────────────────────────────────── */
  const updateCantidad = (id, cantidadNueva) => {
    setItems((prev) => {
      const item = prev.find((p) => p.id === id);
      if (!item) return prev;

      if (cantidadNueva <= 0) {
        return prev.filter((p) => p.id !== id);
      }

      if (cantidadNueva > item.stock) {
        showToast(`Solo quedan ${item.stock} unidad${item.stock > 1 ? "es" : ""} de ${item.nombre}`);
        return prev; // no modifica
      }

      return prev.map((p) =>
        p.id === id ? { ...p, cantidad: cantidadNueva } : p
      );
    });
  };

  const total = items.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );

  const clearCart = () => setItems([]);

  return (
    <PublicCartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateCantidad,
        syncStock,
        clearCart,
        total,
        toast, // expuesto para que la UI muestre el aviso
      }}
    >
      {children}
    </PublicCartContext.Provider>
  );
}

export const usePublicCart = () => useContext(PublicCartContext);
