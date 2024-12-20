// import * as React from "react";
import { useRef, useEffect, useContext, useState } from "react";
import { Animated, View, Text, StyleSheet, Pressable, TouchableOpacity, useWindowDimensions, Image, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import "react-native-gesture-handler";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Calculadora from "./Calculadora";
import Editor from "./Editor";
import EditModalContent from "./EditModalContent";
import { CartContext } from "../context/CartContext";
import { Alertas }from "./Alertas"
import { DbaseContext } from '../context/DbaseContext'

//const {regCambios} = useContext(DbaseContext);





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
        updateHeladoCantidad, 
        columnas,
        }) 
    {
        const datosPaCalc = { id, sabor, cantidad, icon,precio, closeCartModal }
        const [isDeleteActive, setIsDeleteActive] = useState(false);
        const [imageSource, setImageSource] = useState({ uri: icon });

        const bottomSheetModalRef = useRef(null);
        const addItemCardModalRef = useRef(null);
        const snapPointsEditar = ["25%", "50%", "90%"];// el ultimo es la altura
        const snapPointsCalculadora = ["80%"];

    function handlePresentModal() {
        console.log("Vamos a editarrrrrrr")
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

    const widthAnim = useRef(new Animated.Value(0)).current; // Valor inicial de ancho 0

    // ........................Animar el boton borar que esta oculto
    useEffect(() => {
        if (isDeleteActive) {
        Animated.timing(widthAnim, {
            toValue: 150, // El valor final del ancho
            duration: 500, // Duración de la animación (0.5 segundos)
            useNativeDriver: false, // Se debe deshabilitar el uso del NativeDriver para animar width
        }).start();
        } else {
        // Si se oculta el botón, animar de vuelta a 0
        Animated.timing(widthAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
        }).start();
        }
    }, [isDeleteActive]);

    
    async function deleteTodo() {
        try{
            console.log("Borrando un heloadoooo")
            // const response = await fetch(`http://192.168.1.11:8000/desactivar/${id}`, {
                const response = await fetch(`https://backend-de-prueba-delta.vercel.app/desactivar/${id}`, {
                headers: {
                "x-api-key": "abcdef123456",
                },
                    method: "PUT",
                //mode: "no cors",
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error desconocido');
                } else {
                    const errorText = await response.text();
                    throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
                }
            }
    
            const data = await response.json();
            alert('Éxito'+ '...Helado Borrado correctamente');
          //  regCambios(true); //... Avisa a DbaseContext que se cambio algo en la DB 
            //regCambios(true); // Registra que se hizo un cambio en la DB

        }catch (error) {
            alert('Error', `No se pudo Borrar el helado: ${error.message}` + id);
        }
        //alert("hello ID: "+id)
        
        // reloadListDB(id);
        // console.log(response.status);
}

    const handleImageError = () => {
        setImageSource(require('../assets/images/productoDefault.png')); // Imagen por defecto
    };

return (
    
    <GestureHandlerRootView>
    <TouchableOpacity
        onLongPress={() => activaDelete()}// Activa el boton BORRAR Item
        onPress={() => setIsDeleteActive(false)}
        activeOpacity={0.8}
        style={cantidad !== 0 ? [styles.shadowProp, styles.container] : [styles.container, styles.containerVacio, styles.shadowProp] 
            // && columnas === true ? [styles.containerCol] : [styles.container]
        } 
            // & cantidad === 1 && [styles.containerCasiVacio] }
        >
        <View style={styles.contImgAndCant}>
            <View style={columnas === true ? [styles.contImgCol] : [styles.contImg]}>
                {/* ............................................................................ Icono */}
                <Image 
                    style= {columnas === true ? [styles.iconImgCol] : styles.iconImg} 
                    source={imageSource}
                    onError={handleImageError}
                />
                {/* ........................................................................... Cantidad */}
                <Text style={styles.textCantidad}>{cantidad}</Text>
            </View>
        </View>
        

        {/* .................................................................................... Nombre */}
        <View style={columnas === true ? [styles.containerDatosCol] : [styles.containerDatos]}>
            {/* <CheckMark id={id} completed={completed} toggleTodo={toggleTodo} /> */}
            <Text style={styles.title} adjustsFontSizeToFit={true} numberOfLines={1}>{sabor}</Text>
            <View style={styles.cantPrecio}>
                {/* .................................................................... Precio */}
                <Text style={styles.description}>${precio} </Text>
            </View>
        </View>

        {/* ......................... EDITAR Items o CALCULADORA en MODAL  <Feather> is a collection of simply beautiful open source icons for React Nativ*/}
        <View
                style={ columnas === true ?  [styles.contBotMasCol] : [styles.contBotMas] }>
        
            {/* {shared_with_id !== null ? ( */}
            {editItem === false ? (  
                <Feather
                // .............................................boton MAS +
                    style={styles.iconMas}
                    onPress={handleEditModal}
                    name="plus-circle"
                />
                ) : (
            
                <Feather
                //............................................boton EDIT
                    style={styles.iconEdit}
                    onPress={handlePresentModal}
                    name="edit"
                />)
            }
        </View>
        
        
        {/* // Opcion de BORRAR un item al dejar presionado sobre el item */}
        {isDeleteActive && (
            <View style={styles.contBorrar}>
                <Animated.View style={[styles.deleteButton, { width: widthAnim }]}>
                    <Pressable
                        style={styles.pressableButton} // Aseguramos el área de toque
                        onPressIn={deleteTodo}
                        hitSlop={20}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color="white" />
                        {/* <Text style={{ color: "white", fontWeight: "bold" }}>x</Text> */}
                    </Pressable>

                    <TouchableOpacity
                        style={styles.pressableButton}
                        onPressIn={deleteTodo }
                        //   onPressOut={() => setIsDeleteActive(false)}

                        delayPressIn={100}  // Añadir un pequeño retraso al toque
                                    hitSlop={20}  // Ajustar el área de toque
                                    pointerEvents="auto"  // Asegurar que el botón reciba eventos táctiles
                        >
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color="#0ff" />
                        {/* <Text style={{width:50, height:60 }}>borrar</Text> */}
                    </TouchableOpacity>
                </Animated.View>
            </View>
            
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
                    updateHeladoCantidad={updateHeladoCantidad}
                    addItemCardModalRef={addItemCardModalRef}
                />
            </BottomSheetModal> 

            {/* ✏️ Modal Editar helados  */}
            <BottomSheetModal
                ref={bottomSheetModalRef}
                enableDismissOnClose={true}
                index={2}
                snapPoints={snapPointsEditar}
                backgroundStyle={{ borderRadius: 30, borderWidth: 4 }}
                >
                <EditModalContent id={id} _icon={icon} _sabor={sabor} _precio={precio} _cantidad={cantidad} closeModal={closeModal} bottomSheetModalRef={bottomSheetModalRef}/>
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
    height:80,
    padding: 10,
    borderRadius: 15,
    marginBottom: 32,
    backgroundColor: "white",

    // borderBlockColor:"green",
    // borderWidth:2,
    width:"100%",
    
    },
    containerCol: {//    .......................en caso de COLUNMAS
    flex: 1,
    flexDirection: "column",
    minHeight: 100,

    justifyContent: "space-between",
    // alignItems:"center",
    padding: 5,
    borderRadius: 15,
    marginBottom: 32,
    backgroundColor: "#ffdf00",
    width:"100%",
},
containerDatos: {
    flex: 8,
    flexDirection: "colum",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginHorizontal: 8,
    alignItems:"stretch",
},
containerDatosCol: { //.......................en caso de COLUNMAS
    flex: 4,
    display: "flex",
    // width: "50%",
    alignSelf: "end",
},
contImg:{
    position:"absolute",
    top:-54,
    },
contImgCol:{// ......................en caso de COLUNMAS
    position:"absolute",
    top: -56,
    left: -36,
    // right: 6,
    height: "75%"
},
contImgAndCant:{
    flex:4,
    position:"relative",
},
contBotMas:{
    flex:2,
    flexDirection:"row",
    justifyContent:"flex-end",
    position:"relative"
},

contBotMasCol: {// .........................en caso de COLUNMAS
    position: "absolute",
    top: 2,
    right: 3,
},

iconMas:{
    display: "flex",
    alignItems: "right",
    size:40,
    fontSize:40,
    color:"#fff",
    alignSelf:"stretch",
    justifyContent: "center",
    backgroundColor: '#e91e63',
    width: 45,
    height: 45,
    maxWidth: 45,
    borderRadius:30,
},

contBorrar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // Asegúrate de que el botón esté al frente
},
iconEdit:{
    display:"flex",
    size:40,
    fontSize:25,
    color:"#fff",
    alignSelf:"stretch",
    justifyContent:"center", 
    backgroundColor:"#352dc9",
    borderRadius:10,
    padding:6,
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
    position: "relative",
    marginTop: 10,
},

containerCasiVacio:{
    backgroundColor: "#aaf",
    // borderColor:"#cc2",
    borderWidth:2,
    // color:"#ff0000"
},

containerVacio:{
    backgroundColor: "#fee",
    borderColor:"red",
    borderWidth:2,
    color: "#ff0000",
    minHeight: 100,
    // marginLeft:10,
},

textCantidad:{
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    width:25,
    height:25,
    textAlign: "center",
    backgroundColor:"#09aef5",
    borderRadius:20,
    position:"absolute",
    top: 15,
    right:72,
    alignContent:"center",
    justifyContent:"center",
},
textCantidadCol:{
    top: 24,
    left: 24,
},

deleteButton: {
    height: 80, // Altura fija de 80
    // flex: 1, 
    backgroundColor: "red",
    flexDirection:"row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginLeft:10,
    overflow: "hidden", // Para asegurar que el botón mantenga su forma
    zIndex: 1000, // Asegúrate de que el botón esté al frente
},
pressableButton: {
    flex: 1, // Ocupa todo el espacio del botón
    justifyContent: "center",
    alignItems: "center",
},

title: {
    fontWeight: "bold",
    letterSpacing: 0.5,
    fontSize: 20,
    // lineHeight: 14,
    marginTop: 9,
    // width: "100%",
},
description: {
    color: "#56636F",
    fontSize: 13,
    fontWeight: "normal",
    // width: "100%",
},
iconImg:{
    height: 90,
    width: 90,
    resizeMode: "contain",
    borderRadius: 15,
    // borderColor:"#ccc",
    // borderWidth:2,
    },
iconImgCol:{
    height: 135,
    width: 140,
    resizeMode: "contain",
    borderRadius: 15,
    // borderColor:"#ccc",
    // borderWidth:2,
},

elevation: {
    elevation: 20,
    shadowColor: '#52006A',
},

shadowProp: {
    shadowColor: 'rgba(38, 43, 48, 0.4)',
    shadowOpacity: 0.8,
    elevation: 11,
    shadowRadius: 21 ,
    shadowOffset : { width: 1, height: 7},
},

});