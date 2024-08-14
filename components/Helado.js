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
        clearTodo,
        toggleTodo,
        activaDeleteItem
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
        clearTodo(id);
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
    clearTodo(id);
    console.log(response.status);
}

// async function selectHelado() {
//     const response = await fetch(`http://192.168.1.11:8000/helados/${id}`, {
//         headers: {
//         "x-api-key": "abcdef123456",
//         },
//     method: "GET",
// });
// clearTodo(id);
// console.log(response.status);
// }


return (
    <GestureHandlerRootView>
    <TouchableOpacity
        onLongPress={() => activaDelete()}// Activa el boton BORRAR Item
        onPress={() => setIsDeleteActive(false)}
        activeOpacity={0.8}
        style={cantidad === 0 ? [styles.container, styles.containerVacio] : [styles.container] }
        >
        {/* ......................... Icono */}
        <View>
            <Image
                style={styles.iconImg}
                source={{ uri: icon }}
            />
        </View>

        {/* ......................... Nombre */}
        <View style={styles.containerTextCheckBox}>
            {/* <CheckMark id={id} completed={completed} toggleTodo={toggleTodo} /> */}
            <Text style={styles.text}>{sabor}</Text>
        </View>

        {/* ......................... Precio */}
        <View style={styles.containerTextCheckBox}>
            <Text style={styles.text}>{precio} </Text>
        </View>

        {/* ......................... Cantidad */}
        <View style={styles.containerTextCheckBox}>
            <Text style={styles.textCantidad}>{cantidad}</Text>
        </View>

        {/* ......................... EDITAR Items o CALCULADORA en MODAL  <Feather> is a collection of simply beautiful open source icons for React Nativ*/}
        {/* {shared_with_id !== null ? ( */}
        {editItem === false ? (  
            <Feather
                onPress={handleEditModal}
                name="plus-circle"
                size={30}
                color="#239B56"
            />
            ) : (
        
            <Feather
                onPress={handlePresentModal}
                name="book-open"
                size={20}
                color="#3800ff"

            />)
        }
        
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
                    clearTodo={clearTodo} 
                />
            </BottomSheetModal> 

            {/* ✏️ Modal Editar helados  */}
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={2}
                snapPoints={snapPointsEditar}
                backgroundStyle={{ borderRadius: 30, borderWidth: 4 }}
                >
                <EditModalContent id={id} _sabor={sabor} _precio={precio} _cantidad={cantidad} clearTodo={clearTodo} closeModal={closeModal}/>
            </BottomSheetModal>
    </TouchableOpacity>
    </GestureHandlerRootView>
);
}// Close APP


const styles = StyleSheet.create({
container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 45,
    marginBottom: 5,
    backgroundColor: "white",
    width:"100%",
},
containerVacio:{
    backgroundColor: "red",
},
containerTextCheckBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
},
text: {
    fontSize: 17,
    fontWeight: "600",
    color: "#383839",
    letterSpacing: -0.011 * 16, // 16 = baseFontSize
    flexShrink: 1,
    marginHorizontal: 8,
},
textCantidad:{
    fontSize: 17,
    fontWeight: "600",
    color: "#383839",
    textAlign: "right",
},
checkMark: {
    width: 20,
    height: 20,
    borderRadius: 7,
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
contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 15,
},
row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
},
title: {
    fontWeight: "900",
    letterSpacing: 0.5,
    fontSize: 16,
},
subtitle: {
    color: "#101318",
    fontSize: 14,
    fontWeight: "bold",
},
description: {
    color: "#56636F",
    fontSize: 13,
    fontWeight: "normal",
    width: "100%",
},
iconImg:{
    width: 30,
    height:30,
}
});