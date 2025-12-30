import React, { useContext, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

import SedeSelectorHeader from './components/SedeSelectorHeader';



// Screens
import LoginScreen from './screens/LoginScreen'; // Asegúrate de importar tu pantalla de login
import RegisterScreen from './screens/RegisterScreen';
import Welcome from './screens/Welcome';
import HomeScreen from './screens/HomeScreen';
import CrearProducto from './screens/CreaHeladoScreen';
import StackEdit from './screens/StackEdit';
import ListaHelados from './screens/ListaHelados';
import GuardaFoto from './screens/GuardaFoto';
import VentasScreen from './screens/VentasScreen';
import CartModalContent from './components/CartModalContent';
import CrearCategoria from './screens/CrearCategoria';
import MenuCrear from './screens/MenuCrear';
// import VentaManualScreen from './screens/VentaManualScreen';
import MenuVenta from './components/MenuVenta';
// import CrearProducto from './screens/CreaHeladoScreen';
import ReportesScreen from './screens/ReportesScreen';


import { CartContext, CartProvider } from './context/CartContext';
import LoadingScreen from './screens/LoadingScreen';
import { AuthContext } from './context/AuthContext';
import { SedeProvider } from './context/SedeContext';
import  SedeSelectorSheet  from './components/SedeSelectorSheet';

const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();

const CreateNewPlaceholder = () => (
    <View style={{ flex: 1, backgroundColor: 'blue' }}>
        <Text>Nuevo place holder</Text>
    </View>
);

// ........................................................... configuracion de pestañas ...............................
function MyTabs({ openCartModal, openMenuVenta, role, openSedeModal }) {
    const { cartItemCount, cartItemCero } = useContext(CartContext);
    // const menuVentaRef = useRef(null);


    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{ tabBarActiveTintColor: "#e91e63" }}>
            <Tab.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            {/* {role === 'vendedor' && ( // Mostrar solo si el usuario es admin
                    <Tab.Screen 
                    name="Crear Helado" 
                    component={CrearProducto} 
                    options={{
                        tabBarLabel: 'Crear Helado',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="dots-triangle" color={color} size={size} />
                        ),
                    }}
                /> 
            )} */}
            
                <Tab.Screen
                    name="Crear Categoria"
                    component={() => null} // ⬅ la pantalla no se usa, se reemplaza con menú
                    options={{
                        tabBarLabel: 'Crear',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="dots-triangle" color={color} size={size} />
                        ),
                    }}
                    listeners={({ navigation }) => ({
                        tabPress: (e) => {
                            e.preventDefault(); // Evita que navegue a una pantalla
                            navigation.navigate("MenuCrear"); // ⬅ iremos a un menú que crearemos ahora
                        }
                    })}
                />
                
            
            
            <Tab.Screen 
                name="Editar" 
                component={StackEdit} 
                options={{
                    tabBarLabel: 'Editar',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="ice-pop" color={color} size={size} />
                    ),
                    tabBarBadge: cartItemCero > 0 ? cartItemCero : undefined,
                }}
            />
            
            <Tab.Screen 
                name="Carrito"
                component={CreateNewPlaceholder}
                options={{
                    tabBarLabel: 'Carrito',
                    tabBarIcon: ({ color, size }) => (
                        <View style={{ top: -15 }}>
                            <View style={[styles.cartButton, styles.shadowProp]} >
                                <MaterialCommunityIcons name="cart" color="#e91e63" size={30} />
                                {cartItemCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text>{cartItemCount}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ),
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        openCartModal();
                    },
                })}
            />

            <Tab.Screen
  name="Sabores"
  component={ListaHelados}
  options={{
    tabBarLabel: "Sabores",
    headerTitle: "Sabores",

    headerRight: () => (
        <SedeSelectorHeader
            onOpenMenu={openMenuVenta} 
            onOpenSede={openSedeModal}
            />
    ),

    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons
        name="flip-vertical"
        color={color}
        size={size}
      />
    ),
  }}
/>




            <Tab.Screen 
                name="Ventas" 
                component={VentasScreen} 
                options={{
                    tabBarLabel: 'Ventas',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="flip-vertical" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Reportes"
                component={ReportesScreen}
                options={{
                    tabBarLabel: "Reportes",
                    tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons name="chart-pie" color={color} size={24} />
                    )
                }}
            />

        </Tab.Navigator>
    );
}




//........................................................... control de navegacion principal ...............................
export default function Navigation() {
    const cartModalRef = useRef(null);// Referencia para el modal del carrito
    const menuVentaRef = useRef(null);// Referencia para el modal del menú de venta manual
    const sedeModalRef = useRef(null);

    const { user, role, loading } = useContext(AuthContext);
    if (loading) {
        return <LoadingScreen />; // Pantalla de carga
    }

    // Función para renderizar el fondo del modal del carrito
    const renderBackdrop = (props) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    pressBehavior="close" // 👈 cerrar al tocar fuera
  />
);

    
// Funciones para abrir y cerrar el modal del carrito
    const openCartModal = () => {
        cartModalRef.current?.present();
    };

    const closeCartModal = () => {
        cartModalRef.current?.dismiss();
    };

// Funciones para abrir y cerrar el menú de venta manual
        const openMenuVenta = () => {
        menuVentaRef.current?.present();
    };

    const closeMenuVenta = () => {
        menuVentaRef.current?.dismiss();
    };

 // Funciones para abrir y cerrar el selector de sede
    const openSedeModal = () => {
        sedeModalRef.current?.present();
    };

    const closeSedeModal = () => {
        sedeModalRef.current?.dismiss();
    };



    return (

        <CartProvider>
            <SedeProvider>
            <BottomSheetModalProvider>
                <NavigationContainer>
                    <MainStack.Navigator initialRouteName="Welcome">
                        <MainStack.Screen 
                            name="Welcome" 
                            component={Welcome} 
                            options={{ headerShown: false }} // Oculta el encabezado en la pantalla de Login
                        />
                        <MainStack.Screen 
                            name="RegisterScreen" 
                            component={RegisterScreen} 
                            options={{ headerShown: false }} // Oculta el encabezado en la pantalla de Login
                            getId={({ params }) => params.userId}
                        /> 
                        
                        <MainStack.Screen 
                            name="LoginScreen" 
                            component={LoginScreen} 
                            options={{ headerShown: false }} // Oculta el encabezado en la pantalla de Login
                            getId={({ params }) => params.userId}
                        />
                        <MainStack.Screen name="HomeTabs" options={{ headerShown: false }}>
                            {() => <MyTabs
                                openCartModal={openCartModal}
                                openMenuVenta={openMenuVenta}
                                role={role}

                            />}
                        </MainStack.Screen>

                            {/* component={() => <MyTabs openCartModal={openCartModal} />} 
                            options={{ headerShown: false }} // Oculta el encabezado en las pantallas de pestañas
                        /> */}
                        {/* <Stack.Screen
                            name="HomeTabs">
                            {() => <SomeComponent someProp={value} />}
                        </Stack.Screen> */}
{/*                         
                        <MainStack.Screen 
                            name="ListaHelados" 
                            component={ListaHelados} 
                                options={({ navigation }) => ({
                                title: "Sabores",
                                headerRight: () => (
                                <Pressable
                                    onPress={() => navigation.navigate("VentaManual")}
                                    style={{ marginRight: 15 }}
                                >
                                    <Text style={{ fontSize: 22 }}>☰</Text>
                                </Pressable>
                                ),
                            })}
                        /> */}
                        <MainStack.Screen 
                            name="MenuCrear" 
                            component={MenuCrear}
                            options={{ title: "Agregar" }}
                        />
{/* 
                        <MainStack.Screen
                            name="MenuVenta"
                            component={MenuVenta}
                            options={{ title: "Menú" }}
                            /> */}


                        <MainStack.Screen 
                            name="CrearCategoria" 
                            component={CrearCategoria} 
                            options={{ title: "Nueva Categoría" }} 
                        />

                        <MainStack.Screen
                            name="CrearProducto"
                            component={CrearProducto}
                            options={{ title: "Nuevo Producto" }}
                        />

                        {/* <MainStack.Screen
                            name="VentaManual"
                            component={VentaManualScreen}
                            options={{ title: "Venta manual" }}
                        /> */}



                    </MainStack.Navigator>

                    {/* Modal del carrito */}
                    <BottomSheetModal 
                        ref={cartModalRef} 
                        snapPoints={['80%']} 
                        backdropComponent={renderBackdrop}
                        onDismiss={() => console.log("Cart Modal Dismissed")}
                        handleComponent={null}
                        enableContentPanningGesture={false}
                    >
                        <CartModalContent closeModal={closeCartModal} />
                    </BottomSheetModal>

                    {/* Modal del menú de venta manual */}
                    {/* Modal menú venta */}
                    <BottomSheetModal
                        ref={menuVentaRef}
                        snapPoints={['35%']}
                        backdropComponent={renderBackdrop}
                        handleComponent={null}
                        >
                        <MenuVenta closeModal={closeMenuVenta} />
                    </BottomSheetModal>

                    {/* Modal selector sede */}
                    <BottomSheetModal
                        ref={sedeModalRef}
                        snapPoints={['40%']}
                        backdropComponent={renderBackdrop}
                        handleComponent={null}
                        >
                        <SedeSelectorSheet closeModal={closeSedeModal} />
                    </BottomSheetModal>

                </NavigationContainer>
                </BottomSheetModalProvider>
            </SedeProvider>
        </CartProvider>
    );
}

const styles = StyleSheet.create({
    cartButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 5,
        borderColor: "#e91e63",
        position: "relative",
        margin: 5,
    },
    shadowProp: {
        shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowOpacity: 0.8,
        elevation: 4,
        shadowRadius: 7,
        shadowOffset: { width: 1, height: 7 },
    },
    badge: {
        height: 20,
        width: 20,
        borderRadius: 20,
        backgroundColor: "#f00",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: -12,
        right: 14,
    },
});
