import { useContext, useRef, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import ListaHelados from './ListaHelados';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Editor from '../components/Editor';
import { DbaseContext } from '../context/DbaseContext'

const StackEdit = () => {
    const [editItem, setEditItem] =useState(true)
    const bottomSheetModalRef = useRef(null);
    const sharedBottomSheetRef = useRef(null);
    const snapPoints = ["25%", "48%", "75%"];
    const snapPointsShared = ["90%"];
    const {cambios} = useContext(DbaseContext);
    const [elCambio, setElCambio] = useState();

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


    return (
        // <SafeAreaView style={styles.container}>
            <BottomSheetModalProvider>
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