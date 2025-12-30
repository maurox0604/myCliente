import { useContext, useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TextInput, Pressable, Button } from "react-native";
import Helado from '../components/Helado';
import { HeladosContext } from '../context/HeladosContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import MenuVenta from "../components/MenuVenta";
import { useNavigation } from '@react-navigation/native';
import { useCategorias } from "../context/CategoriasContext";
import { useSede } from '../context/SedeContext';




export default function ListaHelados({ deletItem = false, editItem = false }) {
    const {
        filteredHelados,
        handleSearch,
        ordenarPorNombre,
        ordenarPorCantidad,
        updateHeladoCantidad,
    } = useContext(HeladosContext);

    const {
        categorias,
        categoriaActiva,
        setCategoriaActiva,
    } = useCategorias();



    const [isThreeColumns, setIsThreeColumns] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [showMenuVenta, setShowMenuVenta] = useState(false);// Nuevo estado para mostrar/ocultar el menú
    const navigation = useNavigation();
    const [showFechaModal, setShowFechaModal] = useState(false);
    const { sedeActiva } = useSede();// Nuevo estado para manejar el modal de sede
    const [showSedeModal, setShowSedeModal] = useState(false);





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
        []);
    
    // Filtrar helados por categoría activa
    const heladosPorCategoria = categoriaActiva
        ? filteredHelados.filter(
            (h) => h.id_categoria === categoriaActiva
            )
        : filteredHelados;


    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaView style={styles.container}>
                

                {/* <TextInput
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
                   
            </View> */}
                
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
                            data={heladosPorCategoria}
                            keyExtractor={(item) => item.id.toString()}
                            ListHeaderComponent={
                                <>
                                    {/*............................................. barra de búsqueda */}
                                <View style={styles.searchContainer}>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Buscar producto..."
                                        placeholderTextColor="#999"
                                        onChangeText={handleSearch}
                                    />                            
                                    <MaterialCommunityIcons 
                                        name="magnify" 
                                        size={22} 
                                        color="#888" 
                                        style={styles.searchIcon} 
                                    />                                   
                                </View>

                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoriasBar}
                                >
                                    {categorias.map(cat => {
                                    const activa = categoriaActiva === cat.id;
                                    return (
                                        <Pressable
                                        key={cat.id}
                                        onPress={() => setCategoriaActiva(cat.id)}
                                        style={[
                                            styles.categoriaChip,
                                            activa && styles.categoriaChipActiva
                                        ]}
                                        >
                                        <Text
                                            style={[
                                            styles.categoriaText,
                                            activa && styles.categoriaTextActiva
                                            ]}
                                        >
                                            {cat.nombre}
                                        </Text>
                                        </Pressable>
                                    );
                                    })}
                                </ScrollView>

                                <View style={styles.header}>
                                    <Pressable style={styles.botOrder} onPress={ordenarPorNombre}>
                                    <MaterialCommunityIcons
                                        name="order-alphabetical-ascending"
                                        size={24}
                                        color="white"
                                    />
                                    </Pressable>

                                    <Pressable style={styles.botOrder} onPress={ordenarPorCantidad}>
                                    <MaterialCommunityIcons
                                        name="order-numeric-descending"
                                        size={24}
                                        color="white"
                                    />
                                    </Pressable>

                                    <Pressable style={styles.botOrder} onPress={toggleColumns}>
                                    <MaterialCommunityIcons
                                        name={isThreeColumns
                                        ? "drag-horizontal-variant"
                                        : "view-split-vertical"}
                                        size={24}
                                        color="white"
                                    />
                                    </Pressable>

                                    <Pressable style={styles.botOrder} onPress={onRefresh}>
                                    <MaterialCommunityIcons name="update" size={24} color="white" />
                                    </Pressable>
                                </View>
                                </>
                            }
                            renderItem={({ item }) => (
                                <Helado
                                {...item}
                                activaDeleteItem={deletItem}
                                onDeleteSuccess={fetchHelados}
                                editItem={editItem}
                                columnas={isThreeColumns}
                                />
                            )}
                            numColumns={isThreeColumns ? 2 : 1}
                            columnWrapperStyle={isThreeColumns ? styles.columnWrapper : null}
                            key={isThreeColumns ? "two-column" : "one-column"}
                            refreshing={isFetching}
                            onRefresh={onRefresh}
                />{/* end FlatList */}
                    
                        {/* ........................................................MODAL SEDE */}
                        {showSedeModal && (
                            <View style={styles.overlay}>
                                <Pressable
                                style={styles.backdrop}
                                onPress={() => setShowSedeModal(false)}
                                />
                                <View style={styles.modal}>
                                <SelectorSedeModal
                                    onClose={() => setShowSedeModal(false)}
                                />
                                </View>
                            </View>
                            )}

                
                    {/* ........................................................MENÚ VENTA */}

                    {showMenuVenta && (
                    <View style={styles.overlay}>
                        <Pressable
                        style={styles.backdrop}
                        onPress={() => setShowMenuVenta(false)}
                        />

                        <View style={styles.modal}>
                        <MenuVenta
                            onClose={() => setShowMenuVenta(false)}
                        />
                        </View>
                    </View>
                    )}

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
    paddingHorizontal: 8,
    height: 40,               // ✅ clave
    backgroundColor: "#00aeffff",
        marginBottom: 14,
    borderRadius: 5,
},

    botOrder: {
    marginHorizontal: 6,
    marginVertical: 4,
    padding: 4,
}
,
    searchInput: {
        width: "90%",
        height: 40,
        backgroundColor: "#fff",
        borderRadius: 5,
        paddingLeft: 10,
        marginVertical: 10,
        marginLeft: 10,
        fontSize: 16,
    },
    contFlatList: {
        flex: 1,
        width: "100%",
        // paddingTop: 28,
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
    overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "flex-start",
  alignItems: "flex-end",
  zIndex: 999,
},

backdrop: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
},

modal: {
  marginTop: 60,
  marginRight: 10,
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 10,
  width: 220,
  elevation: 6,
    },
categoriasBar: {
  paddingHorizontal: 10,
  paddingVertical: 6,
  backgroundColor: "#fff",
},

categoriaChip: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginRight: 8,
  borderRadius: 20,
  backgroundColor: "#eee",
},

categoriaChipActiva: {
  backgroundColor: "#e70071",
},

categoriaText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
},

categoriaTextActiva: {
  color: "#fff",
},


    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 5,
        marginHorizontal: 0,
        marginVertical: 10,
    },
    searchIcon: {
        marginRight: 5,
        marginLeft: 5,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#333',
    },
// BOTÓN SEDE
    sedeButton: {
        margin: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "#e70071",
        borderRadius: 20,
        },

        sedeText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
},


});






















