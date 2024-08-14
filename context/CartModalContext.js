import React, { createContext, useState, useContext } from 'react';

const CartModalContext = createContext();

export const CartModalProvider = ({ children }) => {
    const [isCartModalVisible, setCartModalVisible] = useState(false);

    const openCartModal = () => setCartModalVisible(true);
    const closeCartModal = () => setCartModalVisible(false);

    return (
        <CartModalContext.Provider value={{ isCartModalVisible, openCartModal, closeCartModal }}>
            {children}
        </CartModalContext.Provider>
    );
};

export const useCartModal = () => useContext(CartModalContext);
