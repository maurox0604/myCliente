import React, { createContext, useState, useContext } from 'react';

const CartModalContext = createContext();

export const CartModalProvider = ({ children }) => {

    const [fechaVenta, setFechaVenta] = useState(null);

        const setFechaVentaManual = (fecha) => {
        setFechaVenta(fecha);
        };

        const resetFechaVenta = () => {
        setFechaVenta(null);
        };

    const [isCartModalVisible, setCartModalVisible] = useState(false);

    const openCartModal = () => setCartModalVisible(true);
    const closeCartModal = () => setCartModalVisible(false);

    return (
        <CartModalContext.Provider value={{
            fechaVenta,
            setFechaVentaManual,
            resetFechaVenta,
            isCartModalVisible,
            openCartModal,
            closeCartModal
        }}>
            {children}
        </CartModalContext.Provider>
    );
};

export const useCartModal = () => useContext(CartModalContext);
