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
    const { cartItemCount, cartItemCero } = useContext(CartContext);
    
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
                    // tabBarBadge: 2,
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
                                <View onPress={openCartModal} style={[styles.cartButton, styles.shadowProp]} >
                                    <MaterialCommunityIcons name={"cart"} color={"#e91e63" }size={30} 
                                    />
                                    {cartItemCount > 0 ? 
                                        <View style={{size:12, height:20, width:20, borderRadius:20, backgroundColor:"#f00", justifyContent:"center", alignItems:"center", position:"absolute", top:-12, right:14, color:"#ffffff"}}>
                                            <Text>{cartItemCount > 0 ? cartItemCount : undefined}</Text> 
                                        </View> : undefined
                                    }
                                </View>
                            </View>
                        );
                    },
                    // tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
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
                    tabBarBadge: cartItemCero > 0 ? cartItemCero : 0,
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
                        snapPoints={['80%']}
                        onDismiss={() => console.log("Cart Modal Dismissed")}
                        handleComponent={null}
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
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth:5,
        borderColor:"#e91e63",
        position:"relative",
        margin:5,
    },

    shadowProp: {
  shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowOpacity: 0.8,
        elevation: 4,
        shadowRadius: 7 ,
        shadowOffset : { width: 1, height: 7},
},
});
