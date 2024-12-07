import { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, FlatList, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View, , SafeAreaView } from "react-native"; 
// import Helado from './Helado';

import ItemCart from './ItemCart';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

//import { useNavigation } from '@react-navigation/native';


// const [helados, setHelados] = useState([]);

const CartModalContent = ({ closeModal, carrito }) => {

    // const navigation = useNavigation();
    const { emailUser } = useContext(AuthContext);

    console.log("CartModalContent   emailUser::::::: ",emailUser)

    const {carts, totalPrice, clearCart, calculateTotalPrice} = useContext(CartContext);

    console.log("CartModalContent ......Carts: ",carts);

    useEffect(() => {
        calculateTotalPrice(carts);
    },  
    [] );

    const actualizarHelado = async () => {

        try {
                // const response = await fetch(`http://192.168.1.11:8000/multicompra`, { //web
                    const response = await fetch(`https://backend-de-prueba-delta.vercel.app/multicompra`, {
                    headers: {
                    "Content-Type": "application/json",
                    'Access-Control-Allow-Origin': '*',
                },
                method: "PUT",
                body: JSON.stringify({ items: carts }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            console.log("Datos actualizados: ", data);
        //   Alert.alert('Éxito', 'Helado actualizado correctamente');
            clearModal()
            closeModal(); // Cerrar el modal después de la actualización exitosa
            guardarVentas();
            

        } catch (error) {
            console.error('Error al actualizar el helado:', error);
        //   Alert.alert('Error', `No se pudo actualizar el helado: ${error.message}`);
        }
    }


    //const { id_helado, cantidad, precio, fecha }
    const guardarVentas = async () => {
        try {
            console.log("Datos a enviar: ",JSON.stringify(carts))
            const response = await fetch(`https://backend-de-prueba-delta.vercel.app/ventas`, {
            // const response = await fetch(`http://localhost:3001/ventas`, {
                    headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                        // body: JSON.stringify({ items: carts}),
                body: JSON.stringify({ 
            items: carts.map(item => ({ ...item, user: emailUser })), // Agregamos el campo 'user' a cada item
}),
                    });
            
            
            // console.log("Datos a ENVIADOS: ", JSON.stringify(items))

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
           // alert('Éxito', 'Helado actualizado correctamente');
            console.log("Datos actualizados: ", data);
        
        } catch (error) {
            console.error('Error al guardarVentas el helado:', error);
            alert(`No se pudo guardarVentas el helado: ${error.message}`);
        }
    }

    useEffect(() => {
        // fetchData();
        fetchHelados();
    },  
    [] );

    async function fetchHelados() {
        console.log("Esta es fethcData")

        // const response = await fetch("http://10.0.2.2:8000/helados", {
        const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados`, {
         //   headers: {
         //     "x-api-key": "abcdef123456",
         //   },
        });
        const data = await response.json();
        console.log("Los datos:  ", data)
        console.log("//Los datos:  ", data[0].sabor)

        // const lowQuantityCount = data.filter(helado => helado.cantidad === 1).length;
        //     setBadgeCount(lowQuantityCount);
        //  setHelados(data);
       // console.log('LOS DATOS: '+helados.length);
    }

    const clearModal = () => {
        clearCart();
        fetchHelados();
    }

    return (

        <SafeAreaView style={styles.contentContainer}> 
            <View style={styles.contHeader}>
                {carts.length == 0 ?
                    <Text>
                        NO hay nada en el carrito
                    </Text>
                    :
                    <Text style={styles.title}> Este es CartModalContent </Text>
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
                    <Pressable  style={styles.button} onPress={() => actualizarHelado() } disabled={carts.length === 0}>
                        <Text style={styles.buttonText}> Compra </Text>
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
        backgroundColor: "#00E9ff",
        alignItems: "center",
        justifyContent : "center",
        fontWeight: "400",
        fontSize: 29,

        borderBlockColor:"red",
        borderWidth:2,
    },
    contHeader:{
        flex:2,
        flexDirection:'row',
        alignContent:"space-between",
        height:20,
    },
    contFlatList:{
        flex:8,
        borderBlockColor:"blue",
        borderWidth:2,
        width:"100%", // define el ancho de la fila
    },
    contentContainerStyle: {
        paddingHorizontal:10,
        borderColor:"green",
        borderWidth:2,
        backgroundColor: "#aa00dd"
    },
    pie: {
        flex: 3,
        flexWrap:"wrap",
        width:"100%",
        // height:30,
        flexDirection:"row",
        alignItems: 'center',
        alignContent:"center",
        justifyContent: 'space-around',
        backgroundColor:'#FDEBD0'
    },

    title: {
        fontSize: 24,
        marginBottom: 20,
    },

    priceText: {
        fontSize: 34,
        color: "#757575",
        fontWeight: "600",
        backgroundColor: "red",
        color: "#FFFFFF",
    },
    button: {
        backgroundColor: "#E96E6E",
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        // marginTop: 30,
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
    }
});

export default CartModalContent;



