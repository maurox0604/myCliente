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
    const {carts, handleRemoveItem} = useContext(CartContext);
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

        {/* ......................... cantCompra */}
        <View style={styles.containerTextCheckBox}>
            <Text style={styles.textCantidad}>{cantCompra}</Text>
        </View>

        {/* ......................... total item */}
        <View style={styles.containerTextCheckBox}>
            <Text style={styles.textCantidad}> ${ cantCompra * precio}</Text>
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
        alignItems: "center",
        justifyContent: "space-between",
        padding: 5,
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