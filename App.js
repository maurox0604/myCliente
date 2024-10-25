
import { StyleSheet, Text, View, FlatList, SafeAreaView } from "react-native"; 
import React from "react";
import Navigation from "./Navigation";
import { CartModalProvider } from "./context/CartModalContext";
import { DbaseProvider } from "./context/DbaseContext";

import {LogBox} from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { VentaContext, VentasContextProvider } from "./context/VentasContext";

// Ignore log notification by message
LogBox.ignoreLogs([
  // Exact message
  'Warning: componentWillReceiveProps has been renamed',

  // Substring or regex match
  /GraphQL error: .*/,
]);

// Ignore all log notifications
LogBox.ignoreAllLogs();

export default function App(){

    const funMsg = function FunciMSG (){
        return (console.log("Esat es una prueba"));
    }

    return(
        <GestureHandlerRootView style={{ flex: 1 }}>
            <VentasContextProvider>
                <DbaseProvider>
                    <CartModalProvider>
                        <Navigation />
                    </CartModalProvider>
                </DbaseProvider>
            </VentasContextProvider>
        
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexWrap: 'wrap',
        flex: 1,
        backgroundColor: "#E9E9EF",
        alignItems: "center",
        justifyContent : "center",
        fontWeight: "400",
        fontSize: 29,
        width:"100%",
        marginTop:40,
    },
    contentContainerStyle: {
        padding: 18,
    },
    title: {
        fontWeight: "800",
        fontSize: 28,
        marginBottom: 15,
    },
});