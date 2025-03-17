import * as React from "react";
import { View, Text, Button, StyleSheet, SafeAreaView, FlatList, Pressable, TouchableOpacity, Image} from 'react-native';
import { Feather } from "@expo/vector-icons";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";



export default function ItemCart ({
    id,
    sabor,
    precio,
    icon,
    cantCompra,

    shared_with_id,
    editItem,
    completed,
    clearTodo,
    })
{

        const { handleRemoveItem } = useContext(CartContext);
        const [isDeleteActive, setIsDeleteActive] = React.useState(false);

        function activaDelete(){
            setIsDeleteActive(true);
        }

        function deleteItemCart () {
            console.log("Vamos a borrarrrrrrrr");
            handleRemoveItem(id);
        }
        

        return(
            <TouchableOpacity
                onLongPress={() => activaDelete()}// Activa el boton BORRAR Item
                onPress={() => setIsDeleteActive(false)}
                activeOpacity={0.8}
                style={cantCompra === 0 ? [styles.container, styles.containerVacio] : [styles.container] }
            >
        {/* ......................... Icono */}
        <View style={styles.contImg}>
            <Image 
                style={styles.iconImg}
                source={{ uri: icon }}
            />
        </View>
        <View style={styles.containerDatos}>
            {/* ......................... Nombre */}
            <Text style={styles.text}>{sabor}</Text>

            {/* ......................... Precio */}
            <Text style={styles.text}>{precio} </Text>
            {/* <Text style={styles.textCantidad}>{cantCompra}</Text> */}
        </View>
        
        
        <View style={styles.contTotalItem}>
            {/* ......................... cantCompra por item */}
            <Text style={styles.textCantidad}>{cantCompra}</Text>
             {/* ......................... total item */}
            <Text style={styles.textTotItem}> ${ (cantCompra * precio).toLocaleString('es-CO') }</Text>
        </View>

        {/* ......................... EDITAR Items en MODAL  <Feather> is a collection of simply beautiful open source icons for React Nativ*/}
        {/* {shared_with_id !== null ? ( */}
        
        {/* {editItem === false ? (  
            <Feather
                onPress={handlePresentShared}
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
        } */}
        
        {/* // Opcion de BORRAR un item al dejar presionado sobre el item */}
        {isDeleteActive && (
            <Pressable onPress={deleteItemCart} style={styles.deleteButton}>
                <Text style={{ color: "white", fontWeight: "bold" }}>x</Text>
            </Pressable>
        )}

        {/* shared todos info */}
    </TouchableOpacity>
        )

}


const styles = StyleSheet.create({
    container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems:"center",
    padding: 5,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal:10,
    backgroundColor: "white",

    // borderBlockColor:"green",
    // borderWidth:2,
    width:"100%",
    
},
    containerDatos: {
    flex: 8,
    flexDirection: "colum",
    justifyContent: "space-between",
    // padding: 5,
    // paddingHorizontal: 5,
    marginHorizontal: 8,
    // backgroundColor: "#ccc",
    // width:"60%",
    alignItems:"stretch",
    // borderRightBlockColor: "#ccc",
    // borderRightWidth:2,
},
contImg:{
    flex:3,
    // borderBlockColor:"red",
    // borderWidth:2,
},
contTotalItem:{
    flex:6,
    flexDirection:"row",
    justifyContent:"between",
    // borderBlockColor:"blue",
    // borderWidth:2,
},
text: {
        fontSize: 17,
        fontWeight: "600",
        color: "#383839",
        letterSpacing: -0.011 * 16, // 16 = baseFontSize
        flexShrink: 1,
        marginHorizontal: 8,
    },
    textCantidad: {
        display: "flex",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: "600",

    color: "#ffffff",
    width:22,
    height:22,
    textAlign: "center",
    backgroundColor:"#09aef5",
    borderRadius:20,
    alignItems:"center",
    },
    textTotItem:{
        fontSize: 18,
        fontWeight: "bold",
        color: "#383839",
        textAlign: "right",
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
    iconImg:{
    height: 60,
    // width: 60,
    resizeMode: "contain",
    borderRadius: 20,
},
    });