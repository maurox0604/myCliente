import { createContext, useState } from "react";

export const CartContext = createContext();

export const  CartProvider = ({children}) => {
    // console.log("children", children)
    const [carts, setCarts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalItemCompra, settoTalItemCompra] = useState(0);
    const [yaExiste, setYaExiste] = useState(false);
    

    const addToCart = (item) => {
        console.log('Dentro de CardContext item: ', item);
        let cartItems = [];

        const itemExist = carts.findIndex((cart) => cart.id === item.id );

        // const objIndex = carts.findIndex(obj => carts[itemExist].id === item.id,
        //   );
        //   console.log("<<< itemExist:    ", itemExist, "  Y objIndex: ", objIndex);

            console.log("itemExist:    ", itemExist)
            if (itemExist === -1) {
                cartItems.push(item) 

                setCarts([...carts, item])
                // calculateTotalPrice(cartItems);
                console.log("cartItems en conetxt cartItems: ", cartItems)
                console.log("Carts en conetxt carts: ", carts)
                //  calculateTotalPrice(carts);

            }else{

                console.log("YA ESTA, solo cambio carts: ", carts)

                carts[itemExist].cantCompra = item.cantCompra;
                carts[itemExist].cantQueda  = item.cantQueda;
                // console.log("<<<  item.cantCompra: ", item.cantCompra);
                // console.log("<<< carts[itemExist] :    ", carts[itemExist]);
                // console.log("<<< carts[itemExist].cantCompra :    ", carts[itemExist].cantCompra);

                // console.log("♦ cartItems[itemExist].cantCompra: ", cartItems[itemExist].cantCompra);
                console.log(itemExist, ".  >>>>>> item.cantCompra: ", item.cantCompra)
               // cartItems[itemExist].cantCompra = item.cantCompra ;
               //

               //setCarts(carts);
                // calculateTotalPrice(carts);
            }
                console.log("<<<  carts ", carts);
                console.log("<<< en conetxt cartItems: ", cartItems)
                setYaExiste(true)
                
        // setCarts(item)
    }

    const existCart = (item) => {
        
        console.log(' ..... ♥Dentro de CardContext item: ', item);
        console.log(' ..... ♥Dentro de CardContext carts: ', carts);
        let cartItems = [];
        let elExiste = []
        /* carts es cada linea de la lista o array de lista y contiene array item */
        const itemExist = carts.findIndex((cart) => cart.id === item.id );
            console.log("itemExist:    ", itemExist)

            // if (itemExist === -1) {
            //     console.log(".....................carts NO EXISTE: ", carts)
            // }else{
            //     // setYaExiste(true);
            //     console.log("itemExist:    ", itemExist);
            //     console.log(".....................carts SI EXISTE: ", carts);
            //     console.log("........itemExist....carts SI EXISTE: ", carts[itemExist]); 
            // }

            return{ 
                itemObj: carts[itemExist],
                itemExiste: itemExist
            };
    }
    
    const calculateTotalPrice = (cartHelado) => {
        //setTotalPrice(totalPrice);
        console.log("<< >>>calculateTotalPrice carts: ", cartHelado)

        let totalSum = cartHelado.reduce((total, item) => total + (item.precio * item.cantCompra), 0);
        // settoTalItemCompra (cartHelado.reduce((total, item) => total + (item.precio * item.cantCompra), 0));
        
        console.log("Total sum: ", totalSum)
        
        setTotalPrice(totalSum);
        console.log("Total totalPrice: ", totalPrice);
        settoTalItemCompra(totalSum);
    };

    const handleRemoveItem = (id) => {
        const newCarts = carts.filter(item => item.id !== id);
        setCarts(newCarts);
    };

    const deleteCartItem = (id) => {
        console.log("id: ",id)
        //const itemExist = carts.findIndex((cart) => cart.id === id );

       // console.log(" itemExist: ", itemExist);
        console.log(" 1 Carts: ", carts);

        setCarts((prevState) =>
            prevState.filter((carts, id) => index !== indexItem)
          );

        const filtredData = carts.filter(item => item.id !== id);
        console.log("filterData: ", filtredData)
        setCarts({ items: filtredData });

        console.log(" 2 carts: ", carts);
        // setCarts([...carts, filtredData])

       // setCarts(carts);


    //     let cartItems = await AsyncStorage.getItem("cart");
    //     cartItems = cartItems ? JSON.parse(cartItems) : [];
    //     cartItems = cartItems.filter((item) => item.id !== id);
    //     setCartItems(cartItems);
    //     calculateTotalPrice(cartItems);
    //     await AsyncStorage.setItem("cart", JSON.stringify(cartItems));
        };

    const clearCart = () => {
        setCarts([]);
        setTotalPrice(0);
        settoTalItemCompra(0);
    }

    const value = {
        carts,
        addToCart,
        totalPrice,
        existCart,
        yaExiste,
        clearCart,
        calculateTotalPrice,
        handleRemoveItem,
    };

    return <CartContext.Provider value={value}>
        {children}
    </CartContext.Provider>;
}