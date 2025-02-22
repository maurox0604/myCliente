import React, { useContext, useEffect } from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Image,
  View,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../context/AuthContext'; // Ajusta la ruta según tu estructura de carpetas


// import MyBlur from '../../components/MyBlur';

const Welcome = ({navigation}) => {
  const { height } = Dimensions.get('window');
  const { user, loading } = useContext(AuthContext); // Obtén el estado de autenticación
  // const screenWidth  = Dimensions.get("window").width;

  useEffect(() => {
    if (!loading && user) {
      // Si no está cargando y el usuario está autenticado, navega a HomeTabs
      navigation.replace('HomeTabs');
    }
  }, [user, loading, navigation]);
  

  return (
    <>
      {/* <MyBlur /> */}
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.container}>
          <Image
            source={{
              uri: 'https://i.pinimg.com/originals/56/b0/6e/56b06e432e33783e2bb7dd029b8984ed.png',
            }}
            style={{
              width: '85%',
              height: (height / 3) * 1.4,
              borderRadius: 16,
              marginBottom: 40,
            }}
          />
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Ice Queen</Text>
            <Text style={styles.title}>Postre hecho helado</Text>
            <Text style={styles.body}>
              Antojese del sabor de su preferencia
            </Text>
            <View style={styles.buttonContainer}>
              {/* <TouchableOpacity
                onPress={() => navigation.navigate('HomeTabs')}
                style={styles.button1}>
                <Text style={styles.buttonsText}>Register</Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterScreen', { userId: 1 })}
                // navigation.navigate('Profile', { userId: 1 });
                style={styles.button2}>
                <Text style={styles.buttonsText}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen', { userId: 2 })}
                // navigation.navigate('Profile', { userId: 1 });
                style={styles.button2}>
                <Text style={styles.buttonsText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '100%',
    borderColor: 'red',
  },
  contentContainer: {
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 35,
    textAlign: 'center',
    color: '#353147',
  },
  body: {
    paddingTop: 20,
    fontSize: 16,
    lineHeight: 23,
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
  },
  button2: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 16,
    backgroundColor: '#DFE3E630',
    marginTop: 40,
  },
});