import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TextInput, Pressable, Button } from "react-native";
import Helado from '../components/Helado';
import { HeladosContext } from '../context/HeladosContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';


export default function ListaHelados({ deletItem = false, editItem = false }) {
    const {
        filteredHelados,
        handleSearch,
        ordenarPorNombre,
        ordenarPorCantidad,
        updateHeladoCantidad,
    } = useContext(HeladosContext);

    const [isThreeColumns, setIsThreeColumns] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const toggleColumns = () => {
        setIsThreeColumns(prev => !prev);
    };

const { fetchHelados } = useContext(HeladosContext);

function onRefresh() {
    setIsFetching(true);
    fetchHelados();          // <--- ahora sí recarga los datos reales
    setTimeout(() => setIsFetching(false), 1200);
}


    useEffect(() => {
        updateHeladoCantidad();
    },  
    [] );

    return (
        <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaView style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar helado por sabor..."
                onChangeText={handleSearch}
            />
            <View style={styles.header}>
                <Pressable style={styles.botOrder} onPress={ordenarPorNombre}>
                    <MaterialCommunityIcons name="order-alphabetical-ascending" size={24} color="black" />
                </Pressable>
                <Pressable style={styles.botOrder} onPress={ordenarPorCantidad}>
                    <MaterialCommunityIcons name="order-numeric-descending" size={24} color="black" />
                </Pressable>
                <Pressable style={styles.botOrder} onPress={toggleColumns}>
                    {isThreeColumns ? (
                        <MaterialCommunityIcons name="drag-horizontal-variant" size={24} color="black" />
                    ) : (
                        <MaterialCommunityIcons name="view-split-vertical" size={24} color="black" />
                    )}
                    </Pressable>

                <Pressable style={styles.botOrder} onPress={onRefresh}>
                    <MaterialCommunityIcons name="update" size={24} color="black" />
                </Pressable>
                    {/* <Button title="Actualizar" onPress={onRefresh} /> */}
            </View>
                
            {/* <FlatList
                style={isThreeColumns ? styles.contFlatListCol : styles.contFlatList}
                data={filteredHelados}
                onRefresh={() => onRefresh()}
                refreshing={isFetching}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Helado
                        {...item}
                        activaDeleteItem={deletItem}
                        editItem={editItem}
                        columnas={isThreeColumns}
                    />
                )}
                numColumns={isThreeColumns ? 2 : 1}
                columnWrapperStyle={isThreeColumns ? { gap: 10 } : null}
            /> */}
                
                <FlatList
                    style={isThreeColumns ? styles.contFlatListCol : styles.contFlatList}
                    data={filteredHelados}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Helado
                            {...item}
                            activaDeleteItem={deletItem}
                            onDeleteSuccess={fetchHelados}
                            editItem={editItem}
                            columnas={isThreeColumns}
                        />
                        )}
                        numColumns={isThreeColumns ? 2 : 1} // Alterna entre una y dos columnas
                        columnWrapperStyle={isThreeColumns ? styles.columnWrapper : null} // Agrega espacio entre columnas
                        key={isThreeColumns ? 'two-column' : 'one-column'} // Fuerza el re-render para evitar bugs
                        onRefresh={onRefresh} // Implementa función de actualización
                        refreshing={isFetching}
                />

            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 10,
        width: "100%",
        backgroundColor: "#140663",
    },
    botOrder: {
        margin: 10,
        backgroundColor: "lightgray",
        borderRadius: 5,
        padding: 5,
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
    contFlatList: {
        flex: 1,
        width: "100%",
        paddingTop: 28,
        paddingHorizontal: 10,
    },
    contFlatListCol: {
        flex: 1 / 2,
        width: "100%",
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
});






















