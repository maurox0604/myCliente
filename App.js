
import { StyleSheet, Text, View, FlatList, SafeAreaView, Image } from "react-native"; 
import React from "react";
import Navigation from "./Navigation";
import { CartModalProvider } from "./context/CartModalContext";
import { DbaseProvider } from "./context/DbaseContext";
import { BlurView } from "expo-blur";

import {LogBox} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { VentaContext, VentasContextProvider } from "./context/VentasContext";
import { Dimensions } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import { HeladosProvider } from "./context/HeladosContext";
import { ReportesProvider } from "./context/ReportesContext";

const uri = 'https://my-cliente.vercel.app/assets/assets/images/LogoQueen.4b364def9b5acb1851859bc949d7163f.png';

// Ignore log notification by message
LogBox.ignoreLogs([
  // Exact message
  'Warning: componentWillReceiveProps has been renamed',

  // Substring or regex match
  /GraphQL error: .*/,
]);

// Ignore all log notifications
LogBox.ignoreAllLogs();
// const screenWidth = Dimensions.get("window").width;
export default function App(){
    
    const funMsg = function FunciMSG (){
        return (console.log("Esat es una prueba"));
    }

// function HomeScreen() {
//     return (
//     <View style={styles.container}>
//             <Image source={{uri}} style={[styles.image, StyleSheet.absoluteFill]} />
//     </View>
//     )
// }

    return (
        
        <GestureHandlerRootView >
                {/* <View>
                    <Image source={{ uri: uri }} style={styles.image}/>
                </View> */}
            <ReportesProvider>
            <HeladosProvider>
                <VentasContextProvider>
                    <AuthProvider>
                        <DbaseProvider>
                            <CartModalProvider>
                                <Navigation style={styles.container}/>
                            </CartModalProvider>
                        </DbaseProvider>
                    </AuthProvider>
                </VentasContextProvider>
            </HeladosProvider>
            </ReportesProvider>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        // flexWrap: 'wrap',
        flex: 1,
        backgroundColor: "#f00",
        alignItems: "center",
        justifyContent : "center",
        fontWeight: "400",
        fontSize: 29,
        // width:screenWidth,
        marginTop: 40,
        overflow: 'hidden',
        width: "80%",
    },
    contentContainerStyle: {
        padding: 18,
    },
    title: {
        fontWeight: "800",
        fontSize: 28,
        marginBottom: 15,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
});