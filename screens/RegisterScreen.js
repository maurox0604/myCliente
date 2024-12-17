import { BlurView } from 'expo-blur';
import React from 'react';
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
    Alert,
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase-config.js';
// import MyBlur from '../../components/MyBlur';

const uri = '../assets/images/fondLogin.png';
const RegisterScreen = ({ navigation, route }) => {

    // params.userId
    const { height } = Dimensions.get('window');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const  handleCreateAccount = () => {
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("cuenta creada: ", userCredential);
            // Signed in
            const user = userCredential.user;
            console.log("usuario creado: ", user);
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("Error al crear la cuenta: ", errorMessage)
            Alert.alert("Error al crear la cuenta: ", errorMessage)
            alert("Error al crear la cuenta: "+ errorMessage)
            // ..
        });
    }

    // const handleSignIn = () => {
    //     signInWithEmailAndPassword(auth, email, password)
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
                            <Text style={styles.title}>Hello Nuevo Usuario!</Text>
                            <Text style={styles.body}>Vamos a crear una cuenta!</Text>

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
                            
                            <TouchableOpacity onPress={handleCreateAccount} style={styles.signInButton}>
                                <Text style={{color: 'white', fontWeight: 'bold'}}>Crear cuenta</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('LoginScreen', { userId: 2 })}
                                // navigation.navigate('Profile', { userId: 1 });
                                style={styles.button2}>
                                <Text style={styles.buttonsText}>Loguearse</Text>
                            </TouchableOpacity>

                        </View>
                    </BlurView>
            
            </ScrollView>
        </SafeAreaView>
        </>
    );
};

export default RegisterScreen;

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