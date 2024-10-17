import { StatusBar } from 'expo-status-bar';
import { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, Button, Pressable } from "react-native"; 
import Helado from '../components/Helado'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { CartContext } from '../context/CartContext';
import { DbaseContext } from '../context/DbaseContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


// import Navigation from '../Navigation';


export default function ListaHelados({deletItem=false, editItem=false}){
    const [helados, setHelados] = useState([]);
    const { updateHeladoCantidadContext } = useContext(CartContext); // Obtener la función del contexto
    const {cambios, regCambios} = useContext(DbaseContext);
    const [activaDeleteItem, setActivaDeleteItem] = useState(false);
    const [isThreeColumns, setIsThreeColumns] = useState(false);
    const [searchText, setSearchText] = useState(''); 
    // const [selectedHelado, setSelectedHelado] = useState(null);
    const [filteredHelados, setFilteredHelados] = useState(helados); 

        if (cambios) {
            fetchHelados();
            
        }


    useEffect(() => {
       // fetchData();
        fetchHelados();
    },  
    [] );



    async function fetchHelados() {

        console.log("Esta es fethcData")
        const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados`, {
         //   const response = await fetch(`http://192.168.1.11:3001/helados`, {
            // 
            method: "GET",
            mode: "cors",
            headers: {
                // "x-api-key": "abcdef123456",
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        });
        const data = await response.json();
        console.log("Los datos:  ", data)
        console.log("//Los datos:  ", data[0].sabor)

        // const lowQuantityCount = data.filter(helado => helado.cantidad === 1).length;
        //     setBadgeCount(lowQuantityCount);
        setHelados(data);
        setFilteredHelados(data);
        console.log('LOS DATOS: '+helados.length);
        regCambios(false);//... pone en false el contextDB para que no se actualice mas
        
    }

    function reloadListDB(id){
        // setHelados(helados.filter((helado) => helado.id !== id ));
        fetchHelados();
        console.log(             "--"                 )
        console.log(             "- LIMOPAINDOA LA LISTA -"                 )
        setHelados();
       // setSelectedHelado(null);
    }

    
    // function updateHeladoCantidad(id, nuevaCantidad) {
    //     setHelados(prevHelados =>
    //         prevHelados.map(helado =>
    //             helado.id === id ? { ...helado, cantidad: nuevaCantidad } : helado
    //         )
    //     );
    // }
    const updateHeladoCantidad = useCallback((id, nuevaCantidad) => {

        console.log('Actualizando helado con ID:', id, 'a nueva cantidad:', nuevaCantidad);     
    setHelados(prevHelados =>
            prevHelados.map(helado =>
                helado.id === id ? { ...helado, cantidad: nuevaCantidad } : helado
            )
        );
    }, [setHelados]);

    useEffect(() => {
        // Pasar la función a través del contexto para que pueda ser usada en cualquier parte
        updateHeladoCantidadContext(updateHeladoCantidad);
    }, [updateHeladoCantidadContext]);

    function toggleTodo(id){
        setHelados(
            helados.map((todo) => todo.id === id ? {...todo, completed: todo.completed === 1 ? 0 : 1} 
            : todo )
        )
    }
    //.................................. Ordenar por sabor
    const ordenarPorNombre = () => {
        const listaOrdenada = [...helados].sort((a, b) => a.sabor.localeCompare(b.sabor));
        setFilteredHelados(listaOrdenada);
    };
    //.................................. Ordenar por cantidad
    const ordenarPorCantidad = () => {
        const listaOrdenada = [...helados].sort((a, b) => a.cantidad - b.cantidad);
        setFilteredHelados(listaOrdenada);
    };

     const toggleColumns = () => {
        setIsThreeColumns(prev => !prev);
    };

    // ................................................ Buscamos por letra
const handleSearch = (text) => {
    // Actualizar el texto de búsqueda
    setSearchText(text);

    // Verificar si el campo de búsqueda está vacío
    if (text === "") {
        // Si está vacío, mostrar todos los helados
        setFilteredHelados(helados);
    } else {
        // Si no está vacío, aplicar el filtro
        const heladosFiltrados = helados.filter(helado => 
            helado.sabor.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredHelados(heladosFiltrados);
    }
};
    return(

        // todo el contenido se debe encerrar dentro de <GestureHandlerRootView> para que funcione la ventana modal
    <GestureHandlerRootView style={{flex: 1}}>
        <BottomSheetModalProvider>
                <SafeAreaView style={styles.container}> 
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Buscar helado por sabor..."
                        value={searchText}
                        onChangeText={handleSearch} // Manejar el texto ingresado
                    />
                    <View style={styles.header}>
                        {/* <Pressable style={styles.botOrder} 
                            <MaterialCommunityIcons name="order-alphabetical-ascending" size={24} color="black" />
                            onPress={ordenarPorNombre} 
                        </Pressable>
                     */}
                    <Pressable style={styles.button} onPress={ordenarPorNombre}>
                            <MaterialCommunityIcons name="order-alphabetical-ascending" size={24} color="black" />
                            <Text style={styles.text}>ordenar</Text>
                        </Pressable>
                        <Button style={styles.botOrder} title=<MaterialCommunityIcons name="order-numeric-descending" size={24} color="black" />
                            onPress={ordenarPorCantidad} />
                        <Button style={styles.botOrder} title={isThreeColumns ?
                            <MaterialCommunityIcons name="drag-horizontal-variant" size={24} color="black" />
                            : <MaterialCommunityIcons name="view-split-vertical" size={24} color="black" />}
                            onPress={toggleColumns} 
                            />
                    </View>
                    
                    <FlatList 
                        style={isThreeColumns === true ?[ styles.contFlatListCol] : [styles.contFlatList]}
                        data={filteredHelados} // Usar la lista filtrada
                        keyExtractor={(todo) => todo.id}
                        key={isThreeColumns ? 'two-columns' : 'one-column'} // Cambia el valor de la key
                        renderItem={({ item }) => (
                            
                            <Helado 
                                {...item}  
                                reloadListDB={reloadListDB} // Recarga los datos de la base de datos
                                toggleTodo={toggleTodo} 
                                activaDeleteItem={deletItem} 
                                editItem={editItem}
                                updateHeladoCantidad={updateHeladoCantidad}  // Actualiza los datos "cantidad" de la lista
                                columnas={isThreeColumns}

                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={() => <Text style={styles.title}>Ice Queen</Text>}
                        contentContainerStyle={styles.contentContainerStyle}
                        numColumns={isThreeColumns ? 2 : 1} // Cambia el número de columnas aquí
                        // numColumns={3}

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
        backgroundColor: "#ddd",
        alignItems: "center",
        justifyContent : "center",
        fontWeight: "400",
        fontSize: 29,

        // borderBlockColor:"red",
        // borderWidth:2,
    },
    header: {
        // flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        // alignItems: "right",
        paddingHorizontal: 10,
        width: "100%",
    },
    botOrder: {
        margin: 10,
        backgroundColor: "rose",
        borderRadius: 5,
        padding: 5,
        paddingHorizontal: 10,
    },
    searchInput: {
        width: "90%",
        height: 40,
        backgroundColor: "#fff",
        borderRadius: 5,
        paddingLeft: 10,
        marginVertical: 10,
        fontSize: 16,
    },
    contFlatList:{
        flex:1,
        // borderBlockColor:"blue",
        // borderWidth:2,
        width: "100%", // define el ancho de la fila
    },
    contFlatListCol:{
        flex:1,
        gap: 10,
        marginRight:10,
        borderBlockColor: "blue",
        backgroundColor: "yellow",
        width: "100%", // define el ancho de la fila
    },
    contentContainerStyle: {
        paddingHorizontal:10,
        // borderColor:"green",
        // borderWidth:2,
        backgroundColor: "#eeeeee"
    },
    
    title: {
        fontWeight: "800",
        fontSize: 28,
        marginBottom: 15,
    },
});

