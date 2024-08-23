import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert, Button, TextInput, Image} from 'react-native';

//import logo from '../assets/images/LogoQueen.png'
const HomeScreen = () => {
    const navigation = useNavigation();
    // const [url, setUrl] = useState('/helados');
    // const [focus, setFocus] = useState(false);
    // const [respuesta, setRespuesta] = useState();


    return (
        
        <View  style={styles.container}>
            <Image source={require('../assets/images/LogoQueen.png')} style={{ width: 200, height: 100, resizeMode: "contain", }} />
            <Text
                style={{
                    fontSize:38,
                    textAlign: "Center",
                    marginTop: "20%"
                }}
            > 
                Postre hecho, helado...
            </Text>
            <View  style={styles.menu}>
                <TouchableOpacity
                onPress={() => navigation.navigate("ListaHelados")}
                style={[styles.boton, {
                    backgroundColor: "#e91e63",
                }]}
                >
                <Text
                    style={{
                        fontWeight: "800",
                        fontSize: 15,
                        textAlign:"center",
                        color:"white"
                    }}
                >
                    Sabores
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={() => navigation.navigate("Stack")}
                style={[styles.boton,{
                    backgroundColor: "purple",
                }]}
                >
                <Text
                    style={{
                        fontWeight: "800",
                        fontSize: 15,
                        textAlign:"center",
                        color:"white"
                    }}
                >
                    Edit helados
                </Text>
            </TouchableOpacity>
            </View>
            

            {/* <Button title="☻.: TEST3 :..♥♥" onPress={request} /> */}
            
        </View>
        )
}
export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flexWrap: 'wrap',
        flex: 1,
        backgroundColor: "#11eeff",
        alignItems: "center",
        justifyContent : "center",
        fontWeight: "400",
        fontSize: 29,
        width:"100%",
        marginTop:40,
    },
    menu: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        columnGap:10,
        // borderCurve:10,
        borderRadius: 10,
        
    

        flex: 1,
        backgroundColor: "#dee9eb",
        alignItems: "center",
        justifyContent : "center",
        fontWeight: "400",
        fontSize: 29,
        width:"100%",
        marginTop:40,
    },
    boton:{
        padding:10,
        alignSelf:"center",
        alignItems: "center",
        justifyContent : "center",
        borderRadius:10,
        marginBottom:10,
        width: "25%",
        height: "40%",

        shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowOpacity: 0.8,
        elevation: 6,
        shadowRadius: 7 ,
        shadowOffset : { width: 1, height: 7},
    },
    contentContainerStyle: {
        padding: 18,
    },
    input: {
        borderWidth: 2,
        borderColor: "#00000020",
        padding: 15,
        borderRadius: 15,
        marginVertical: 15,
        backgroundColor: "gray"
    },
    
    title: {
        fontWeight: "800",
        fontSize: 28,
        marginBottom: 15,
    },
});
