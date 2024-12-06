import { useContext, useRef, useState, useCallback, useEffect  } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import ListaHelados from './ListaHelados';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Editor from '../components/Editor';
import { DbaseContext } from '../context/DbaseContext'
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';


const StackEdit = () => {
    const [editItem, setEditItem] =useState(true)
    const bottomSheetModalRef = useRef(null);
    const sharedBottomSheetRef = useRef(null);
    const snapPoints = ["25%", "48%", "75%"];
    const snapPointsShared = ["90%"];
    const {cambios} = useContext(DbaseContext);
    const [elCambio, setElCambio] = useState();
    const navigation = useNavigation();

    // 
    // console.log("El Cambio es: ", elCambio)
    console.log("El Cambiossses: ", cambios)
    // if (cambios) {
    //     setElCambio(cambios);
    // }
    

    function handlePresentModal() {
        bottomSheetModalRef.current?.present();
        }

    function handlePresentShared() {
        sharedBottomSheetRef.current?.present();
    }    

// Cierra el BottomSheetModal cuando la pantalla pierde el foco
// useFocusEffect(
//     useCallback(() => {
//     // Esta función se ejecuta cuando la pantalla tiene el foco
//     return () => {
//         // Esta función se ejecuta cuando la pantalla pierde el foco
//         bottomSheetModalRef.current?.dismiss();
//         // sharedBottomSheetRef.current?.dismiss();
//         bottomSheetModalRef.current?.close();
//     };
//     }, [])
    // );


    // Cierra el BottomSheetModal justo antes de que la pantalla se elimine


const [isVisible, setIsVisible] = useState(false);
const [isModalClosed, setIsModalClosed] = useState(true);

// useFocusEffect(
//     useCallback(() => {
//       console.log(".... Esato de la MODAL: ",bottomSheetModalRef.current?._isMounted);
//     const handleBlur = () => {
//       setIsVisible(false);
//       setTimeout(() => {
//         //   bottomSheetModalRef.current?.dismiss();
//           bottomSheetModalRef.current?.close();
//       }, 200); // agregar un retraso de 200ms
//         console.log("Modal CERRADO..."+bottomSheetModalRef.current)
//     };

//     return handleBlur;
//   }, [isVisible, bottomSheetModalRef])
// );
    
    return (
        // <SafeAreaView style={styles.container}>
        <BottomSheetModalProvider
            
            onDismiss={() => setIsModalClosed(true)}
        >
                <View style={styles.container}>
                    <Text
                        style={{
                            fontSize:20,
                            textAlign: "Center",
                            marginTop: "5%"
                        }}
                    > EDITAR helados </Text>

                    <ListaHelados deletItem={true} editItem></ListaHelados>
                    {/* cambios ? <ListaHelados deletItem={true} editItem></ListaHelados> : null */}

                    {/* <BottomSheetModal
                        ref={sharedBottomSheetRef}
                        snapPoints={snapPointsShared}
                        backgroundStyle={{ borderRadius: 50, borderWidth: 4 }}
                        >
                    </BottomSheetModal> */}
                </View>
            </BottomSheetModalProvider>
        // </SafeAreaView>
        
        
        )
}
export default StackEdit;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E9E9EF",
    },
    innerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    listContainer: {
        flex: 1,
        width: "100%",
    }
});