import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView } from "react-native"; 
import Helado from '../components/Helado'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


// import Navigation from '../Navigation';


export default function ListaHelados({deletItem=false, editItem=false}){
    const [helados, setHelados] = useState([]);
    const [activaDeleteItem, setActivaDeleteItem] = useState(false);


    useEffect(() => {
       // fetchData();
        fetchHelados();
    },  
    [] );



    async function fetchHelados() {

        console.log("Esta es fethcData")
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
            setHelados(data);
        console.log('LOS DATOS: '+helados.length);
    }

    function reloadListDB(id){
        // setHelados(helados.filter((helado) => helado.id !== id ));
        fetchHelados();
        console.log(             "--"                 )
        console.log(             "- LIMOPAINDOA LA LISTA -"                 )
        setHelados();
       // setSelectedHelado(null);
    }

    function updateHeladoCantidad(id, nuevaCantidad) {
        setHelados(prevHelados =>
            prevHelados.map(helado =>
                helado.id === id ? { ...helado, cantidad: nuevaCantidad } : helado
            )
        );
    }


    function toggleTodo(id){
        setHelados(
            helados.map((todo) => todo.id === id ? {...todo, completed: todo.completed === 1 ? 0 : 1} 
            : todo )
        )
    }


    return(
        
        // todo el contenido se debe encerrar dentro de <GestureHandlerRootView> para que funcione la ventana modal
    <GestureHandlerRootView style={{flex: 1}}>
        <BottomSheetModalProvider>
                <SafeAreaView style={styles.container}> 
                    <FlatList
                        data={helados}
                        keyExtractor={(todo) => todo.id}
                        renderItem={({ item }) => (
                            
                            <Helado 
                                {...item}  
                                reloadListDB={reloadListDB} // Recarga los datos de la base de datos
                                toggleTodo={toggleTodo} 
                                activaDeleteItem={deletItem} 
                                editItem={editItem}
                                updateHeladoCantidad={updateHeladoCantidad}  // Actualiza los datos "cantidad" de la lista
                            />
                        )}
                        ListHeaderComponent={() => <Text style={styles.title}>Queen - Hoy </Text>}
                        contentContainerStyle={styles.contentContainerStyle}
                    />
                    {/* <InputHelado helados={helados} setHelados={setHelados} /> */}
                </SafeAreaView>

                {/* <View>
                
                    {helados.map((person) => {
                        return (
                            <Text>{person.sabor}</Text>
                        );
                    })}
                </View> */}

                <StatusBar style="auto" />
        </BottomSheetModalProvider>
    </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
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