import { createContext, useState, useEffect } from "react";
import ListaHelados from "../screens/ListaHelados";

export const CartContext = createContext();

export const  CartProvider = ({children}) => {
    const [carts, setCarts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [cartItemCero, setCartItemCero] = useState(0);
    const [updateHeladoCantidadFunc, setUpdateHeladoCantidadFunc] = useState(null);


    const addToCart = (item) => {
        console.log('Dentro de CardContext item: ', item);
    
        const itemIndex = carts.findIndex((cart) => cart.id === item.id);
        let updatedCarts;
        
        if (itemIndex === -1) {
            // Si el ítem no está en el carrito, lo añadimos
            updatedCarts = [...carts, item];
        } else {
            // Si el ítem ya existe, actualizamos la cantidad
            updatedCarts = carts.map((cart, index) => 
                index === itemIndex
                    ? { ...cart, cantCompra: item.cantCompra }
                    : cart
            );
        }

        // Actualizamos el estado del carrito
        setCarts(updatedCarts);
    
        // Recalculamos la cantidad total de ítems
        updateCartItemCount(updatedCarts);
    };


    const updateCartItemCount = (cartItems) => {
        let totalItems = cartItems.reduce((total, item) => total + item.cantCompra, 0);
        setCartItemCount(totalItems);

        let itemCero = cartItems.reduce((total, item) => item.cantidad === 0 && total + item.cantCompra, 0);
        setCartItemCero(itemCero);
        console.log("                            .", cartItemCero)
        console.log("........☺ cart Items ☺..........", cartItemCero)
    }

    const existCart = (item) => {
        
        console.log(' ..... ♥ Dentro de CardContext item: ', item);
        console.log(' ..... ♥ Dentro de CardContext carts: ', carts);

        /* carts es cada linea de la lista o array de lista y contiene array item */
        const itemExist = carts.findIndex((cart) => cart.id === item.id );

            return{ 
                itemObj: carts[itemExist],
                itemExiste: itemExist
            };
    }

    const calculateTotalPrice = () => {
        const totalSum = carts.reduce((total, item) => total + (item.precio * item.cantCompra), 0);
        setTotalPrice(totalSum);
    };

    const handleRemoveItem = (id) => {
        let itemSeleccionado = carts.find(item => item.id === id);
        let suma = itemSeleccionado.cantCompra + itemSeleccionado.cantQueda;

        const newCarts = carts.filter(item => item.id !== id);
        setCarts(newCarts);
        updateCartItemCount(newCarts);
    
        // Llamar a la función `updateHeladoCantidad` después de eliminar un ítem
        if (updateHeladoCantidadFunc) {
            updateHeladoCantidadFunc(id, suma);  // Aquí puedes ajustar la cantidad a lo que necesites
        }
    };

    const updateHeladoCantidadContext = (func) => {
        setUpdateHeladoCantidadFunc(() => func);
    }

    const clearCart = () => {
        setCarts([]);
        setTotalPrice(0);
        setCartItemCount(0);
        //settoTalItemCompra(0);
    }

    


    // useEffect(() => {
    //     // fetchData();
    //     fetchHelados();
    // },  
    // [] );



   // async function fetchHelados() {
        const fetchHelados = async () => {

        console.log("Esta es fethcData")
        const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados`, {
            // const response = await fetch(`http://192.168.1.11:3001/helados`, {
            // 
            method: "GET",
            mode: "cors",
            headers: {
                // "x-api-key": "abcdef123456",
                // 'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        });
        const data = await response.json();
        // console.log("Los datos:  ", data)
        // console.log("//Los datos:  ", data[0].sabor)

        // const lowQuantityCount = data.filter(helado => helado.cantidad === 1).length;
        //     setBadgeCount(lowQuantityCount);
        //     setHelados(data);
        // console.log('LOS DATOS: '+helados.length);
    }


    const value = {
        carts,
        addToCart,
        totalPrice,
        existCart,
        clearCart,
        calculateTotalPrice,
        handleRemoveItem,
        cartItemCount,
        updateHeladoCantidadContext,
        cartItemCero,
        fetchHelados,
    };
    return <CartContext.Provider value={value}>
                {children}
            </CartContext.Provider>;
}