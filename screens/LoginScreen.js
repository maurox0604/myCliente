import { BlurView } from 'expo-blur';
import React, { useContext } from 'react';
import {
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StyleSheet,
    Text,
    Image,
    View,
    Dimensions,
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase-config.js';
import { AuthContext } from '../context/AuthContext.js';
// import MyBlur from '../../components/MyBlur';



const uri = '../assets/images/fondLogin.png';


const LoginScreen = ({ navigation, route }) => {
    console.log("------------Navegación: ", navigation);
    console.log("------------Route: ", route);
    console.log("------------Route.params: ", route.params);
    console.log("------------Route.params: ", route.params.userId);
    // params.userId
    const { height } = Dimensions.get('window');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const { login } = useContext(AuthContext);

    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // const  handleCreateAccount = () => {
    //     createUserWithEmailAndPassword(auth, email, password)
    //     .then((userCredential) => {
    //         // Signed in
    //         const user = userCredential.user;
    //         console.log("usuario creado: ", user);
    //         // ...
    //     })
    //     .catch((error) => {
    //         const errorCode = error.code;
    //         const errorMessage = error.message;
    //         // ..
    //     });
    // }

    const handleSignIn = () => {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("usuario logeado: ", user);
            navigation.navigate('HomeTabs')
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("Error al iniciar sesión: "+ errorMessage)
            // ..
        });
    }
    

    const handleLogin = async () => {
        try {
            await login(email, password);
            navigation.navigate('HomeTabs')
        } catch (error) {
            console.error(error);
            alert("Error al iniciar sesión: "+ errorMessage)
        }
    };

    return (
        <>
            
      {/* <MyBlur /> */}
            <SafeAreaView style={styles.container}>
                <View style={{flex: 1, alignContent: 'center', justifyContent: 'center', backgroundColor: 'purple', position: 'static'}}>
                    <Image source={{uri}} style={[styles.image, StyleSheet.absoluteFill]} />
                </View>
                <View style={{width:100, height: 100, backgroundColor: 'red', position: 'absolute'}}>
                    
                </View>

                <ScrollView contentContainerStyle={{flex: 1, alignItems: 'center' ,width: '100%', height: '100%'}}>
                    <BlurView intensity={100} >
                        <View style={styles.contentContainer}>
                            <Text style={styles.title}>Hola Nuevamente!</Text>
                            <Text style={styles.body}>Bienvenido al maravilloso mundo del placer!</Text>

                            <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            onChangeText={(text) => setEmail(text)}
                            autoCorrect={false}
                            />
                            <TextInput
                            style={styles.input}
                            placeholder="Password"
                            onChangeText={(text) => setPassword(text)}
                            autoCorrect={false}
                            secureTextEntry={true}
                            />
                            <TouchableOpacity>
                                <Text
                                    style={[
                                    styles.buttonsText,
                                    {fontWeight: 'bold', lineHeight: 30, textAlign: 'right'},
                                    ]}>
                                    Recovery Password
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleLogin} style={styles.signInButton}>
                                <Text style={{color: 'white', fontWeight: 'bold'}}>Login</Text>
                            </TouchableOpacity>
                            
                            <Text style={{textAlign: 'center'}}>Or continue with</Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.button1}>
                                    <Image
                                    source={{
                                        uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/1024px-Google_%22G%22_Logo.svg.png',
                                    }}
                                    style={{width: 40, height: 40}}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Welcome')}
                                    style={styles.button1}>
                                    <Image
                                    source={{
                                        uri: 'https://www.freepnglogos.com/uploads/apple-logo-png/apple-logo-png-dallas-shootings-don-add-are-speech-zones-used-4.png',
                                    }}
                                    style={{width: 40, height: 40}}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Welcome')}
                                    style={styles.button1}>
                                    <Image
                                    source={{
                                        uri: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
                                    }}
                                    style={{width: 40, height: 40, borderRadius: 50}}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>
            
            </ScrollView>
        </SafeAreaView>
        </>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        // position: 'relative',
    },
    contentContainer: {
        paddingHorizontal: 30,
        width: 350,
        height: '100%',
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 35,
        textAlign: 'center',
        color: '#353147',
    },
    body: {
        padding: 20,
        fontSize: 30,
        lineHeight: 35,
        marginBottom: 20,
        fontWeight: '400',
        textAlign: 'center',
        color: '#353147',
    },
    buttonsText: {
        fontWeight: '500',
        color: '#353147',
    },
    button1: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#ffffff70',
        padding: 16,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 16,
        marginHorizontal: 10,
    },
    button2: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',

        backgroundColor: '#DFE3E630',
        marginTop: 40,
    },
    input: {
        backgroundColor: '#F7F7F7',
        padding: 10,
        borderColor: '#fff',
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
        height: 50,
        backgroundColor: '#ffffff90',
    },
    signInButton: {
        backgroundColor: '#FD6D6A',
        width: '100%',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginVertical: 30,
        shadowColor: '#FD6D6A',
        shadowOffset: {
        width: 250,
        height: 40,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
    },
    image: {
        width: '100%',
        height: '100%',	
        resizeMode: 'cover',
        position: 'absolute',
    },
});