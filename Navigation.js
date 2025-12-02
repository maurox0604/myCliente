import React, { useContext, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

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
// import CrearProducto from './screens/CreaHeladoScreen';
import ReportesScreen from './screens/ReportesScreen';


import { CartContext, CartProvider } from './context/CartContext';
import LoadingScreen from './screens/LoadingScreen';
import { AuthContext } from './context/AuthContext';

const Tab = createBottomTabNavigator();
const MainStack = createNativeStackNavigator();

const CreateNewPlaceholder = () => (
    <View style={{ flex: 1, backgroundColor: 'blue' }}>
        <Text>Nuevo place holder</Text>
    </View>
);

function MyTabs({ openCartModal, role }) {
    const { cartItemCount, cartItemCero } = useContext(CartContext);

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
                name="Sabores" //        ojo este es el nombre usado en la ruta
                component={ListaHelados} 
                options={{
                    tabBarLabel: 'Sabores',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="flip-vertical" color={color} size={size} />
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

export default function Navigation() {
    const cartModalRef = useRef(null);
    const { user, role, loading } = useContext(AuthContext);
    if (loading) {
        return <LoadingScreen />; // Pantalla de carga
    }
    

    const openCartModal = () => {
        cartModalRef.current?.present();
    };

    const closeCartModal = () => {
        cartModalRef.current?.dismiss();
    };

    return (
       
        <CartProvider>
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
                            {() => <MyTabs openCartModal={openCartModal} role={role}/>}
                        </MainStack.Screen>

                            {/* component={() => <MyTabs openCartModal={openCartModal} />} 
                            options={{ headerShown: false }} // Oculta el encabezado en las pantallas de pestañas
                        /> */}
                        {/* <Stack.Screen
                            name="HomeTabs">
                            {() => <SomeComponent someProp={value} />}
                        </Stack.Screen> */}
                        
                        <MainStack.Screen 
                            name="ListaHelados" 
                            component={ListaHelados} 
                        />
                        <MainStack.Screen 
                            name="MenuCrear" 
                            component={MenuCrear}
                            options={{ title: "Agregar" }}
                        />

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


                    </MainStack.Navigator>
                    <BottomSheetModal 
                        ref={cartModalRef} 
                        snapPoints={['80%']} 
                        onDismiss={() => console.log("Cart Modal Dismissed")}
                        handleComponent={null}
                        enableContentPanningGesture={false}
                    >
                        <CartModalContent closeModal={closeCartModal} />
                    </BottomSheetModal>
                </NavigationContainer>
            </BottomSheetModalProvider>
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
