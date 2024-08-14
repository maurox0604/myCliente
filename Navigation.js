import React, { useContext, useRef, length } from 'react';
import { View, StyleSheet, TouchableOpacity,Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// Screens
import HomeScreen from './screens/HomeScreens';
import CreaHeladoScreen from './screens/CreaHeladoScreen';
import StackEdit from './screens/StackEdit';
import ListaHelados from './screens/ListaHelados';
import CartModalContent from './components/CartModalContent';
import { HeladoContext } from './context/HeladoContext';
import { CartContext, CartProvider } from './context/CartContext';

const CreateNew = () => { <View style={{ flex:1, backgroundColor: 'red'}}>
    <Text>Nuevo place CreateNew</Text>
</View>
}
const HomeStackNavigator = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
// const carrito = useContext(CartContext);



function MyStak() {
    return (
        <HomeStackNavigator.Navigator 
        initialRouteName="HomeScreen"
        mode="modal"
        >
            <HomeStackNavigator.Screen 
                name="Home Screen"
                component={HomeScreen}
            />
            <HomeStackNavigator.Screen 
                name="Stack"
                component={StackEdit}
            />
            <HomeStackNavigator.Screen 
                name="ListaHelados"
                component={ListaHelados}
            />
             <HomeStackNavigator.Screen 
                name="CreateNew"
                component={CreateNew}
                options={{animation:true}}
            />
        </HomeStackNavigator.Navigator>
    );
}

const CreateNewPlaceholder = () => { <View style={{ flex:1, backgroundColor: 'blue'}}>
    <Text>Nuevo place holder</Text>
</View>

}

function MyTabs({ openCartModal }) {
    //const {carts} = useContext(CartContext);
    // const { badgeCount } = carts?.length;
    //const { badgeCount } = 2;
    

    
    return (
        
            <Tab.Navigator 
            initialRouteName="home"
            screenOptions={{
                tabBarActiveTintColor: "#e91e63",
            }}
        >
            <Tab.Screen 
                name="Home" 
                component={MyStak}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen 
                name="Crear" 
                component={CreaHeladoScreen} 
                options={{
                    tabBarLabel: 'Crear',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="dots-triangle" color={color} size={size} />
                    ),
                    tabBarBadge: 2,
                }}
            />
            <Tab.Screen 
                name='Create'
                component={CreateNewPlaceholder}
                options={{
                    tabBarLabel: 'CARRITO',
                    tabBarIcon: ({ color, size }) => {
                    const {carts} = useContext(CartContext);
                    // console.log("♠♠ cart: ", carts);
                    // console.log("♠♠ cart: ", carts[0]);
                    // console.log("♠♠ cart: ", carts.title);
                    //console.log("♠♠ cart: ", carts[0].title)
                    console.log("cart: ", carts?.length);
                        
                        return(
                            <View style={{top: -15 }}>
                                <View onPress={openCartModal} style={styles.cartButton} >
                                    <MaterialCommunityIcons name={"cart"} color={"#00f" }size={30} 
                                    />
                                    <View style={{height:14, width:14, borderRadius:7, backgroundColor:"#0ff", justifyContent:"center", alignItems:"center", position:"absolute", top:10, right:40, color:"black"}}>
                                        <Text>{carts.cantCompra}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    },
                    tabBarBadge: 2,
                }}

                listeners={({ navigation }) => ({
                tabPress: (e) => {
                    e.preventDefault();
                    openCartModal();
                    },
                })} 
            />
             {/* <Tab.Screen 
                name='Create'
                component={CreateNewPlaceholder}
                options={{
                    tabBarLabel: 'CREATE',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cart" color={color} size={size} />
                    ),
                }}
                listeners={({ navigation }) => ({
                tabPress: (e) => {
                    e.preventDefault();
                    navigation.navigate()
                    //navigation.Navigator("CreateNew")
                    // navigation.naviagte("CreateNew")
                    },
                })} 
            /> */}
            <Tab.Screen 
                name="StackEdit" 
                component={StackEdit}
                options={{
                    tabBarLabel: 'EDITAR',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="ice-pop" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen 
                name="ListaHeladitos" 
                component={ListaHelados}
                options={{
                    tabBarLabel: 'SABORES',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="flip-vertical" color={color} size={size} />
                    ),
                }}
            />

        
        </Tab.Navigator>
        
    );

    const RootStak = createNativeStackNavigator
}

export default function Navigation() {
    const cartModalRef = useRef(null);

    const openCartModal = () => {
        console.log("Opening Cart Modal", cartModalRef.current);
        cartModalRef.current?.present();
    };

    const closeCartModal = () => {
        console.log("Closing Cart Modal", cartModalRef.current);
        cartModalRef.current?.dismiss();
    };

    return (
        <CartProvider>
            <BottomSheetModalProvider>
            <NavigationContainer>
                
                <MyTabs openCartModal={openCartModal} />
                    <BottomSheetModal 
                        ref={cartModalRef} 
                        snapPoints={['60%']}
                        onDismiss={() => console.log("Cart Modal Dismissed")}
                        // enabledGestureInteraction={false}
                        // enableHeaderGestures={false}
                        // enableContentGestures={false}
                        enableContentPanningGesture={false}
                        
                        >
                        <CartModalContent closeModal={closeCartModal } />
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
        backgroundColor: '#e91e63',
        justifyContent: 'center',
        alignItems: 'center',

        position:"relative",
    },
});
