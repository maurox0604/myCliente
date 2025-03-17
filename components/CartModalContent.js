import { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View, , SafeAreaView } from "react-native"; 
// import Helado from './Helado';

import ItemCart from './ItemCart';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { HeladosContext } from '../context/HeladosContext';

//import { useNavigation } from '@react-navigation/native';


// const [helados, setHelados] = useState([]);

const CartModalContent = ({ closeModal, carrito }) => {

    // const navigation = useNavigation();
    const { emailUser } = useContext(AuthContext);
    const { updateHeladoCantidad } = useContext(HeladosContext);
    const { carts, totalPrice, clearCart, calculateTotalPrice, cartItemCount } = useContext(CartContext);
    const [isProcessing, setIsProcessing] = useState(false); // Estado para controlar el botón

    console.log("CartModalContent ......Carts: ",carts);

    useEffect(() => {
        calculateTotalPrice(carts);
    },  
    [] );

    // const actualizarHelado = async () => {

    //     try {
    //             // const response = await fetch(`http://192.168.1.11:8000/multicompra`, { //web
    //                 const response = await fetch(`https://backend-de-prueba-delta.vercel.app/multicompra`, {
    //                 headers: {
    //                 "Content-Type": "application/json",
    //                 // 'Access-Control-Allow-Origin': '*',
    //             },
    //             method: "PUT",
    //             body: JSON.stringify({ items: carts }),
    //         });

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
    //         }
    //         const data = await response.json();
    //         console.log("Datos actualizados: ", data);
    //     //   Alert.alert('Éxito', 'Helado actualizado correctamente');
    //         clearModal()
    //         closeModal(); // Cerrar el modal después de la actualización exitosa
    //         guardarVentas();
    //         updateHeladoCantidad();
    //     } catch (error) {
    //         console.error('Error al actualizar el helado:', error);
    //     //   Alert.alert('Error', `No se pudo actualizar el helado: ${error.message}`);
    //     }
    // }


    // //const { id_helado, cantidad, precio, fecha }
    // const guardarVentas = async () => {
    //     try {
    //         console.log("Datos a enviar: ",JSON.stringify(carts))
    //         const response = await fetch(`https://backend-de-prueba-delta.vercel.app/ventas`, {
    //             // const response = await fetch(`http://localhost:3001/ventas`, {
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             method: "POST",
    //             // body: JSON.stringify({ items: carts}),
    //             body: JSON.stringify({ 
    //                 items: carts.map(item => ({ ...item, user: emailUser })), // Agregamos el campo 'user' a cada item
    //             }),
    //         });
    //         // console.log("Datos a ENVIADOS: ", JSON.stringify(items))

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
    //         }
    //         const data = await response.json();
    //        // alert('Éxito', 'Helado actualizado correctamente');
    //         console.log("Datos actualizados: ", data);

    //     // Sincronizar los helados con las cantidades actualizadas
    //     // const updatedItems = carts.map(item => ({
    //     //     id: item.id,
    //     //     cantidad: item.cantidad - item.unidadesVendidas, // Ejemplo: ajustar cantidades
    //     // }));
    //     // syncHelados(updatedItems);
        
    //     } catch (error) {
    //         console.error('Error al guardarVentas el helado:', error);
    //         alert(`No se pudo guardarVentas el helado: ${error.message}`);
    //     }
    // }
    
    
    const procesarCarrito = async () => {
        try {
        setIsProcessing(true); // Deshabilitar el botón mientras se procesa
        const response = await fetch('https://backend-de-prueba-delta.vercel.app/procesarCarrito', {
            // const response = await fetch('http://localhost:3001/procesarCarrito', {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({
                items: carts.map(item => ({ ...item, user: emailUser }))
            }),
        });

        if (!response.ok) throw new Error(await response.text());

        console.log('Carrito procesado con éxito');
        clearModal();
        closeModal();
    } catch (error) {
        console.error('Error procesando el carrito:', error);
    }finally {
            setIsProcessing(false); // Volver a habilitar el botón
        }
};


    useEffect(() => {
    fetchHelados();
}, [clearCart]); // Llama fetchHelados solo si clearCart se ejecuta

    // async function fetchHelados() {
    //     console.log("Esta es fethcData")

        
    //     const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados`, {
    //      //   headers: {
    //      //     "x-api-key": "abcdef123456",
    //      //   },
    //     });
    //     const data = await response.json();
    //     console.log("Los datos:  ", data)
    //     console.log("//Los datos:  ", data[0].sabor)
    // }
    async function fetchHelados() {
        try {
        // const response = await fetch("http://localhost:3001/helados");
        const response = await fetch('https://backend-de-prueba-delta.vercel.app/helados');
        if (!response.ok) throw new Error('Error al obtener los helados');

        const data = await response.json();
        console.log("Datos de helados cargados:", data);
    } catch (error) {
        console.error('Error al cargar helados:', error);
    }
}

    const clearModal = () => {
        clearCart();
        fetchHelados();
    }
    

    return (

        <SafeAreaView style={styles.contentContainer}> 
            <View style={styles.contHeader}>
                <Text style={styles.textCantidad}>{cartItemCount}</Text>
                {carts.length == 0 ?
                    <Text>
                        NO hay nada en el carrito
                    </Text>
                    :
                    <Text style={styles.title}> Helados en el carrito </Text>
                } 
                {/* <Button 
                    style={styles.botCerrarModal}
                    title="X" onPress={closeModal} 
                /> */}
                <Pressable onPress={closeModal} style={styles.botCerrarModal}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>x</Text>
                </Pressable>
            </View>

            <View style={styles.contFlatList}>
                <FlatList
                    style={{flex:1}}
                    data={carts}
                    keyExtractor={(todo) => todo.id}
                    renderItem={({ item }) => (
                        <>
                        <ItemCart {...item} />

                        {/* {console.log("item: ", item)} */}
                        {/* {console.log("data: ", {helados})} */}
                        </>
                        )}
                    // ListHeaderComponent={() => <Text style={styles.title}>Queen - Hoy </Text>}
                    contentContainerStyle={styles.contentContainerStyle}
                /> 
            </View>

            <View style={styles.pie}>
                <View> 
                    <Text>TOTAL: </Text>
                    <Text style={styles.priceText}> ${(totalPrice).toLocaleString('es-ES') }</Text>
                </View>

                <View>
                    <Pressable
                        style={[styles.button, isProcessing && styles.buttonDisabled]} // Cambiar estilo si está deshabilitado
                        onPress={procesarCarrito}
                        disabled={isProcessing || carts.length === 0} // Deshabilitar si está procesando o no hay items
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#FFFFFF" /> // Mostrar spinner si está procesando
                        ) : (
                            <Text style={styles.buttonText}>Compra</Text>
                        )}
                    </Pressable>
                </View>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        backgroundColor: "#fbddf0",
        alignItems: "center",
        justifyContent : "center",
        fontWeight: "400",
        fontSize: 29,

        // borderBlockColor:"red",
        // borderWidth: 2,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
    },
    contHeader:{
        flex:1,
        flexDirection:'row',
        alignContent:"space-between",
        height: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FDEBD0',
        width:"100%",
        paddingHorizontal: 10,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    contFlatList:{
        flex:8,
        // borderBlockColor:"blue",
        // borderWidth:2,
        width:"100%", // define el ancho de la fila
    },
    contentContainerStyle: {
        paddingHorizontal: 10,
        paddingTop: 15,
        // borderColor:"green",
        // borderWidth:2,
        backgroundColor: "#ff1188"
    },
    pie: {
        flex: 3,
        flexWrap:"wrap",
        width:"100%",
        // height:30,
        flexDirection:"row",
        alignItems: 'flex-end',
        alignContent:"center",
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 33,
        elevation: 5,
    },

    title: {
        fontSize: 24,
        // marginBottom: 20,
    },

    priceText: {
        fontSize: 40,
        fontWeight: "600",
        backgroundColor: "#0092e7",
        color: "#FFFFFF",
        padding: 10,
        borderRadius: 15,
    },
    button: {
        backgroundColor: "#e70071",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.45,
        shadowRadius: 15,
        // marginTop: 30,
    },
    buttonDisabled: {
        backgroundColor: "#cccccc", // Color cuando el botón está deshabilitado
    },
    buttonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "700",
    },
    botCerrarModal:{
        width:30,
        height:30,
        backgroundColor:"red",
        borderRadius:20,
        justifyContent:"center",
        alignItems:"center",
        textAlign:"center"
    },

        textCantidad: {
        display: "flex",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: "600",

    color: "#ffffff",
    width:32,
    height:32,
    textAlign: "center",
    backgroundColor:"#09aef5",
    borderRadius:20,
    alignItems:"center",
    },
});

export default CartModalContent;



