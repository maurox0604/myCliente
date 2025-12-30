import { useRef, useEffect, useState } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import Calculadora from "./Calculadora";
import EditModalContent from "./EditModalContent";

export default function Helado({
  id,
  sabor,
  precio,
  icon,
  cantidad,
  editItem,
  activaDeleteItem,
  columnas,
  onDeleteSuccess,
  id_categoria,
}) {
  const [isDeleteActive, setIsDeleteActive] = useState(false);
  const [imageSource, setImageSource] = useState({ uri: icon });

  const editModalRef = useRef(null);
  const calcModalRef = useRef(null);

  const widthAnim = useRef(new Animated.Value(0)).current;

  /* ------------------ animación delete ------------------ */
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: isDeleteActive ? 150 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDeleteActive]);

  /* ------------------ handlers ------------------ */
    const openEditModal = () => editModalRef.current?.present();
    const closeEditModal = () => editModalRef.current?.dismiss();
    const openCalcModal = () => calcModalRef.current?.present();
    const closeCalcModal = () => calcModalRef.current?.dismiss();
    
    
    const snapPointsEditar = ["25%", "50%", "90%"];// el ultimo es la altura

  const handleDelete = async () => {
    try {
      await onDeleteSuccess(id);
      setIsDeleteActive(false);
    } catch (err) {
      Alert.alert("Error", "No se pudo eliminar");
    }
  };


  const handleImageError = () =>
    setImageSource(require("../assets/images/productoDefault.png"));

  const datosPaCalc = {
    id,
    sabor,
    cantidad,
    icon,
    precio,
    closeCartModal: closeCalcModal,
  };

  /* ------------------ render ------------------ */
  return (
    <TouchableOpacity
        onLongPress={() => activaDeleteItem && setIsDeleteActive(true)}
        onPress={() => setIsDeleteActive(false)}
        activeOpacity={0.9}
            style={cantidad !== 0 ? [styles.shadowProp, styles.container]
                :
                [styles.container, styles.containerVacio, styles.shadowProp]}
    >
      {/* imagen */}
      <View>
        <Image
          style={columnas ? styles.iconImgCol : styles.iconImg}
          source={imageSource}
          onError={handleImageError}
        />
        <Text style={styles.textCantidad}>{cantidad}</Text>
      </View>

      {/* datos */}
      <View style={styles.containerDatos}>
        <Text style={styles.title} numberOfLines={1}>
          {sabor}
        </Text>
        <Text style={styles.description}>${precio}</Text>
      </View>

      {/* botón */}
      <View>
        {editItem ? (
          <Feather name="edit" style={styles.iconEdit} onPress={openEditModal} />
        ) : (
          <Feather
            name="plus-circle"
            style={styles.iconMas}
            onPress={openCalcModal}
          />
        )}
      </View>

      {/* delete */}
      {isDeleteActive && (
        <Animated.View style={[styles.deleteButton, { width: widthAnim }]}>
          <Pressable onPress={handleDelete}>
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={24}
              color="white"
            />
          </Pressable>
        </Animated.View>
      )}

      {/* modales */}
      <BottomSheetModal ref={calcModalRef} snapPoints={["80%"]}>
        <Calculadora datosPaCalc={datosPaCalc} />
      </BottomSheetModal>

          <BottomSheetModal
              ref={editModalRef}
              snapPoints={["95%", "90%"]}>
        <EditModalContent
                  id={id}
                  _icon={icon}
                  _sabor={sabor}
                  _precio={precio}
                  _cantidad={cantidad}
                  _id_categoria={id_categoria}
                  closeEditModal={closeEditModal}
        />
      </BottomSheetModal>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems:"center",
    height:80,
    padding: 10,
    borderRadius: 15,
    marginBottom: 32,
    backgroundColor: "white",

    // borderBlockColor:"green",
    // borderWidth:2,
    width:"100%",
    
    },
    containerCol: {//    .......................en caso de COLUNMAS
    flex: 1,
    flexDirection: "column",
    minHeight: 100,

    justifyContent: "space-between",
    // alignItems:"center",
    padding: 5,
    borderRadius: 15,
    marginBottom: 32,
    backgroundColor: "#ffdf00",
    width:"100%",
},
containerDatos: {
    flex: 8,
    flexDirection: "colum",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginHorizontal: 8,
    alignItems:"stretch",
},
containerDatosCol: { //.......................en caso de COLUNMAS
    flex: 4,
    display: "flex",
    // width: "50%",
    alignSelf: "end",
},
contImg:{
    position:"absolute",
    top:-54,
    },
contImgCol:{// ......................en caso de COLUNMAS
    position:"absolute",
    top: -56,
    left: -36,
    // right: 6,
    height: "75%"
},
contImgAndCant:{
    flex:4,
    position:"relative",
},
contBotMas:{
    flex:2,
    flexDirection:"row",
    justifyContent:"flex-end",
    position:"relative"
},

contBotMasCol: {// .........................en caso de COLUNMAS
    position: "absolute",
    top: 2,
    right: 3,
},

iconMas:{
    display: "flex",
    alignItems: "right",
    size:40,
    fontSize:40,
    color:"#fff",
    alignSelf:"stretch",
    justifyContent: "center",
    backgroundColor: '#e91e63',
    width: 45,
    height: 45,
    maxWidth: 45,
    borderRadius:30,
},

contBorrar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // Asegúrate de que el botón esté al frente
},
iconEdit:{
    display:"flex",
    size:40,
    fontSize:25,
    color:"#fff",
    alignSelf:"stretch",
    justifyContent:"center", 
    backgroundColor:"#352dc9",
    borderRadius:10,
    padding:6,
},

cantPrecio: {
    // flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    // padding: 5,
    // paddingHorizontal: 5,
    // marginHorizontal: 10,
    // backgroundColor: "red",
    // width:"100%",
    // alignItems:"stretch",
    position: "relative",
    marginTop: 10,
},

containerCasiVacio:{
    backgroundColor: "#aaf",
    // borderColor:"#cc2",
    borderWidth:2,
    // color:"#ff0000"
},

containerVacio:{
    backgroundColor: "#fee",
    borderColor:"red",
    borderWidth:2,
    color: "#ff0000",
    minHeight: 100,
    // marginLeft:10,
},

textCantidad:{
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    width:25,
    height:25,
    textAlign: "center",
    backgroundColor:"#09aef5",
    borderRadius:20,
    position:"absolute",
    top: 15,
    right:72,
    alignContent:"center",
    justifyContent:"center",
},
textCantidadCol:{
    top: 24,
    left: 24,
},

deleteButton: {
    height: 80, // Altura fija de 80
    // flex: 1, 
    backgroundColor: "red",
    flexDirection:"row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginLeft:10,
    overflow: "hidden", // Para asegurar que el botón mantenga su forma
    zIndex: 1000, // Asegúrate de que el botón esté al frente
},
pressableButton: {
    flex: 1, // Ocupa todo el espacio del botón
    justifyContent: "center",
    alignItems: "center",
},

title: {
    fontWeight: "bold",
    letterSpacing: 0.5,
    fontSize: 20,
    // lineHeight: 14,
    marginTop: 9,
    // width: "100%",
},
description: {
    color: "#56636F",
    fontSize: 13,
    fontWeight: "normal",
    // width: "100%",
},
iconImg:{
    height: 90,
    width: 90,
    resizeMode: "contain",
    borderRadius: 15,
    // borderColor:"#ccc",
    // borderWidth:2,
    },
iconImgCol:{
    height: 135,
    width: 140,
    resizeMode: "contain",
    borderRadius: 15,
    // borderColor:"#ccc",
    // borderWidth:2,
},

elevation: {
    elevation: 20,
    shadowColor: '#52006A',
},

shadowProp: {
    shadowColor: 'rgba(38, 43, 48, 0.4)',
    shadowOpacity: 0.8,
    elevation: 11,
    shadowRadius: 21 ,
    shadowOffset : { width: 1, height: 7},
},

});


// Creo que eliminaste muchas funciones de HeladosContext que se usaban en  varios modulos como (updateHeladoCantidad(id, cantidad),  el buscador(handleSearch) ) y ahora no se como reemplazarlos donde los usaba antes y estan generando error