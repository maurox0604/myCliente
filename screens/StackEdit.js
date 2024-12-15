import { useContext, useRef, useState, useCallback, useEffect  } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import ListaHelados from './ListaHelados';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Editor from '../components/Editor';
import { DbaseContext } from '../context/DbaseContext'
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { HeladosContext } from '../context/HeladosContext';


const StackEdit = () => {
    const [editItem, setEditItem] =useState(true)
    const bottomSheetModalRef = useRef(null);
    const sharedBottomSheetRef = useRef(null);
    const snapPoints = ["25%", "48%", "75%"];
    const snapPointsShared = ["90%"];
    const {cambios} = useContext(DbaseContext);
    const [elCambio, setElCambio] = useState();
    const navigation = useNavigation();

    const { handleSearch, updateHeladoCantidad } = useContext(HeladosContext); // Llamando a handleSearch para actualizar la lista de helados

    // function handlePresentModal() {
    //     bottomSheetModalRef.current?.present();
    // }

    // function handlePresentShared() {
    //     sharedBottomSheetRef.current?.present();
    // }    

    // const [isVisible, setIsVisible] = useState(false);
    const [isModalClosed, setIsModalClosed] = useState(true);
    // 

    useEffect(() => {
        // Actualiza `filteredHelados` automáticamente cuando `helados` cambia
        handleSearch("");
        updateHeladoCantidad();
    }, [""]);
    
    return (
        // <SafeAreaView style={styles.container}>
        <BottomSheetModalProvider
            onDismiss={() => {setIsModalClosed(true); }}
        >
                <View style={styles.container}>
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