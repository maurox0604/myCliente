import * as React from "react";
import { View, Text, StyleSheet, Pressable, TouchableOpacity, useWindowDimensions, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import "react-native-gesture-handler";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRef } from "react";
import Calculadora from "./Calculadora";
import Editor from "./Editor";
import EditModalContent from "./EditModalContent";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useState } from "react";



// function CheckMark({ id, completed, toggleTodo }) {
//     async function toggle() {
//         const response = await fetch(`http://192.168.1.11:8000/todos/${id}`, {
//             headers: {
//             "x-api-key": "abcdef123456",
//             "Content-Type": "application/json",
//             },
//             method: "PUT",
//             body: JSON.stringify({
//             value: completed ? false : true,
//             }),
//         });

//         const data = await response.json();
//         toggleTodo(id);
//         console.log(data);
//     }

    // return (
    // <Pressable
    //     onPress={toggle}
    //     style={[
    //     styles.checkMark,
    //     { backgroundColor: completed === 0 ? "#E9E9EF" : "#0EA5E9" },
    //     ]}
    // ></Pressable>
    // );
    // }

    export default function Helado({
        id,
        sabor,
        precio,
        icon,
        cantidad,
        shared_with_id,
        editItem,
        completed,
        reloadListDB,
        toggleTodo,
        activaDeleteItem,
        updateHeladoCantidad 
        }) 
    {
        const datosPaCalc = { id, sabor, cantidad, icon,precio, closeCartModal }

        // const item = { id, sabor, cantCompra, icon, precio };
        // console.log('♦♦ activaDeleteItem : ',activaDeleteItem, '  ☻☻ editItem♣○• : ',editItem)
        // console.log("Id: ", id, "   sabor: ",sabor, '   icon: ',icon)
    const [isDeleteActive, setIsDeleteActive] = React.useState(false);

    const bottomSheetModalRef = useRef(null);
    const addItemCardModalRef = useRef(null);
    const snapPointsEditar = ["25%", "50%", "100%"];
    const snapPointsCalculadora = ["80%"];

    function handlePresentModal() {
        bottomSheetModalRef.current?.present();
    }

    function closeCartModal () {
        addItemCardModalRef.current?.dismiss();
    };
    

    function handleEditModal() {
        addItemCardModalRef.current?.present();
    }

    // Función para cerrar el modal
    const closeModal = () => {
        bottomSheetModalRef.current?.close();
    };

    function activaDelete(){
        if (activaDeleteItem) {
            setIsDeleteActive(true);
        }
    }

    async function deleteTodo() {
        // const response = await fetch(`http://192.168.1.11:8000/helados/${id}`, {
            const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados/${id}`, {
            headers: {
            "x-api-key": "abcdef123456",
            },
            method: "DELETE",
        });
        reloadListDB(id);
        console.log(response.status);
}

async function updateHelado() {
    // const response = await fetch(`http://192.168.1.11:8000/helados/${id}`, {
        const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados/${id}`, {
        headers: {
        "x-api-key": "abcdef123456",
        },
        method: "PUT",
        body: JSON.stringify({
            sabor: sabor,
            precio: precio,
            icon: foto,
            cantidad: cantidad,
        }),
    });
    reloadListDB(id);
    console.log(response.status);
}

// async function selectHelado() {
//     const response = await fetch(`http://192.168.1.11:8000/helados/${id}`, {
//         headers: {
//         "x-api-key": "abcdef123456",
//         },
//     method: "GET",
// });
// reloadListDB(id);
// console.log(response.status);
// }


return (
    <GestureHandlerRootView>
    <TouchableOpacity
        onLongPress={() => activaDelete()}// Activa el boton BORRAR Item
        onPress={() => setIsDeleteActive(false)}
        activeOpacity={0.8}
        style={cantidad === 0 ? [styles.container, styles.containerVacio, styles.shadowProp] : [styles.container, styles.shadowProp] }
            // & cantidad === 1 && [styles.containerCasiVacio] }
        >
        {/* ............................................................................ Icono */}
        <View style={styles.contImg}>
            <Image style={styles.iconImg}
                source={{ uri: icon }}
            />
        </View>

        {/* ............................................................................ Nombre */}
        <View style={styles.containerDatos}>
            {/* <CheckMark id={id} completed={completed} toggleTodo={toggleTodo} /> */}
            <Text style={styles.title}>{sabor}</Text>
            <View style={styles.cantPrecio}>
                {/* .................................................................... Precio */}
                <Text style={styles.description}>${precio} </Text>

                
            </View>
           
        </View>

        {/* ......................... EDITAR Items o CALCULADORA en MODAL  <Feather> is a collection of simply beautiful open source icons for React Nativ*/}
        <View style={styles.contBotMas}>
       
        
            {/* {shared_with_id !== null ? ( */}
            {editItem === false ? (  
                <Feather
                    onPress={handleEditModal}
                    name="plus-circle"
                    size={30}
                    color="#fff"
                />
                ) : (
            
                <Feather
                    onPress={handlePresentModal}
                    name="book-open"
                    size={20}
                    color="#fff"

                />)
            }

             {/* .................................................................... Cantidad */}
        <Text style={styles.textCantidad}>{cantidad}</Text>
        </View>
        
        
        {/* // Opcion de BORRAR un item al dejar presionado sobre el item */}
        {isDeleteActive && (
            <Pressable onPress={deleteTodo} style={styles.deleteButton}>
                <Text style={{ color: "white", fontWeight: "bold" }}>x</Text>
            </Pressable>
        )}

            {/* 🛒 Modal Calcuadora  */}
            <BottomSheetModal
                ref={addItemCardModalRef}
                snapPoints={snapPointsCalculadora}
                backgroundStyle={{ borderRadius: 50, borderWidth: 4 }}
                >
                <Calculadora
                    completed={completed}
                    // closeCartModal={closeCartModal}
                    datosPaCalc = {datosPaCalc}
                    reloadListDB={reloadListDB}
                    updateHeladoCantidad={updateHeladoCantidad}
                />
            </BottomSheetModal> 

            {/* ✏️ Modal Editar helados  */}
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={2}
                snapPoints={snapPointsEditar}
                backgroundStyle={{ borderRadius: 30, borderWidth: 4 }}
                >
                <EditModalContent id={id} _sabor={sabor} _precio={precio} _cantidad={cantidad} reloadListDB={reloadListDB} closeModal={closeModal}/>
            </BottomSheetModal>
    </TouchableOpacity>
    </GestureHandlerRootView>
);
}// Close APP


const styles = StyleSheet.create({
container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems:"center",
    padding: 5,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: "white",

    // borderBlockColor:"green",
    // borderWidth:2,
    width:"100%",
    
},
containerDatos: {
    flex: 11,
    flexDirection: "colum",
    justifyContent: "center",
    // padding: 5,
    // paddingHorizontal: 5,
    marginHorizontal: 8,
    // backgroundColor: "green",
    // width:"60%",
    alignItems:"stretch",
    // borderBlockColor:"green",
    // borderWidth:2,
},
contImg:{
    flex:3,
    // borderBlockColor:"red",
    // borderWidth:2,
},
contBotMas:{
    flex:2,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:'#e91e63',
    // alignSelf:"stretch",
    borderRadius:30,
    height:40,
    position:"relative"
    // borderBlockColor:"blue",
    // borderWidth:2,
},
cantPrecio: {
    // flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    // padding: 5,
    // paddingHorizontal: 5,
    // marginHorizontal: 10,
    // backgroundColor: "red",
    // width:"100%",
    // alignItems:"stretch",
    position:"relative"
},

containerCasiVacio:{
    backgroundColor: "#aaf",
    borderColor:"#cc2",
    borderWidth:2,
    // color:"#ff0000"
},

containerVacio:{
    backgroundColor: "#fee",
    borderColor:"red",
    borderWidth:2,
    color:"#ff0000"
},

textCantidad:{
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
    width:22,
    height:22,
    textAlign: "center",
    backgroundColor:"#00b0e4",
    borderRadius:20,
    position:"absolute",
    top:35,
    right:-5,
    alignContent:"center",
    justifyContent:"center",

    // textAlign: "right",
},

deleteButton: {
    position: "absolute",
    right: 0,
    top: -6,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 10,
},

title: {
    fontWeight: "bold",
    letterSpacing: 0.5,
    fontSize: 20,
    // width: "100%",
},
description: {
    color: "#56636F",
    fontSize: 13,
    fontWeight: "normal",
    // width: "100%",
},
iconImg:{
    height: 60,
    // width: 60,
    resizeMode: "contain",
    borderRadius: 15,
    borderColor:"#ccc",
    borderWidth:2,
},

elevation: {
    elevation: 20,
    shadowColor: '#52006A',
},

shadowProp: {
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOpacity: 0.8,
    elevation: 4,
    shadowRadius: 7 ,
    shadowOffset : { width: 1, height: 7},
},

});