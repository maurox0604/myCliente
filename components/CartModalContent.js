import { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, FlatList, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View, , SafeAreaView } from "react-native"; 
// import Helado from './Helado';

import ItemCart from './ItemCart';
import { CartContext } from '../context/CartContext';
//import { useNavigation } from '@react-navigation/native';


// const [helados, setHelados] = useState([]);

const CartModalContent = ({ closeModal, carrito }) => {

   // const navigation = useNavigation();

    console.log("CartModalContent   carrito::::::: ",carrito)

    const {carts, totalPrice, clearCart, calculateTotalPrice} = useContext(CartContext);

    console.log("CartModalContent ......Carts: ",carts);

    calculateTotalPrice(carts);

    const actualizarHelado = async () => {

        try {
                // const response = await fetch(`http://192.168.1.11:8000/multicompra`, { //web
                    const response = await fetch(`https://backend-de-prueba-delta.vercel.app/multicompra`, {
                    headers: {
                    "Content-Type": "application/json",
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
                    const response = await fetch(`https://backend-de-prueba-delta.vercel.app/ventas`, {
                    headers: {
                    "Content-Type": "application/json",
                },

                method: "POST",
                body: JSON.stringify({ items: carts }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
           // alert('Éxito', 'Helado actualizado correctamente');
            console.log("Datos actualizados: ", data);
        
        } catch (error) {
            console.error('Error al actualizar el helado:', error);
            alert('Error', `No se pudo actualizar el helado: ${error.message}`);
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

        const lowQuantityCount = data.filter(helado => helado.cantidad === 1).length;
            setBadgeCount(lowQuantityCount);
        //  setHelados(data);
        console.log('LOS DATOS: '+helados.length);
    }

    const clearModal = () => {
        clearCart();
        fetchHelados();
    }

    return (

        <SafeAreaView style={styles.contentContainer}> 
            <View>
                <Button title="Close" onPress={closeModal} />
                <Text style={styles.title}> Este es CartModalContent Cart</Text>
                {carts.length == 0 &&
                    <Text>
                        NO hay nada en el carrito
                    </Text>
                } 

            </View>
                    <FlatList
                        data={carts}
                        keyExtractor={(todo) => todo.id}
                        renderItem={({ item }) => (
                            <>
                            <ItemCart {...item} />

                            {/* {console.log("item: ", item)} */}
                            {/* {console.log("data: ", {helados})} */}
                            </>
                            )}
                        ListHeaderComponent={() => <Text style={styles.title}>Queen - Hoy </Text>}
                        contentContainerStyle={styles.contentContainerStyle}
                    /> 

                    <View>
                        <View style={styles.priceText}> 
                            <Text>TOTAL COMPRA </Text>
                            <Text style={styles.priceText}> ${totalPrice}</Text>
                        </View>
                    
                    </View>
                    
                    <View>
                        <Pressable  style={styles.button} onPress={() => actualizarHelado() } disabled={carts.length === 0}>
                            <Text style={styles.buttonText}> Compra </Text>
                        </Pressable>
                    </View>


                    {/* <View>
                
                    {helados.map((person) => {
                        return (
                            <Text>{person.sabor}</Text>
                        );
                    })}
                </View> */}
                    <StatusBar style="auto" />
                </SafeAreaView>

                
                
        
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        marginTop: 30,
      },
      buttonText: {
        fontSize: 24,
        color: "#FFFFFF",
        fontWeight: "700",
      },
});

export default CartModalContent;



