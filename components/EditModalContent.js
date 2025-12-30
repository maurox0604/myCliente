import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Keyboard, View, Text, StyleSheet, Button, Alert, Pressable, TouchableOpacity } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';
import { HeladosContext } from "../context/HeladosContext";

export default function EditModalContent({ id, _icon, _sabor, _precio, _cantidad,   _id_categoria, closeEditModal }) {
  const [focus, setFocus] = useState(false);
  const [sabor, setSabor] = useState(_sabor);// Campo input
  const [precio, setPrecio] = useState(_precio);// Campo input
  const [cantidad, setCantidad] = useState(_cantidad);// Campo input
  const { updateHeladoCantidad, handleSearch } = useContext(HeladosContext);
  const [categoria, setCategoria] = useState(_id_categoria);
  
  // const bottomSheetModalRef = useRef(null);
  const navigation = useNavigation();
  // const [foto, setFoto] = useState("../assets/images/helados/Icon_App.png");// Campo Uri Foto
  const [foto, setFoto] = useState(_icon);// Campo Uri Foto
  const [isSaving, setIsSaving] = useState(false);



  const actualizarHelado = async () => {
    if (isSaving) return; // 🛑 protección extra
    console.log(".......categoria, ", categoria)
    try {
      setIsSaving(true); // 🔒 bloquea el botón

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/productos/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: sabor,
            precio: Number(precio),
            cantidad: Number(cantidad),
            icon: foto,
            id_categoria: categoria, // 🔴 OBLIGATORIO
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Datos actualizados: ", data);

      updateHeladoCantidad(id, Number(cantidad));
      handleSearch("");
      closeEditModal();

    } catch (error) {
      console.error("Error al actualizar el helado:", error);
      Alert.alert("Error", "No se pudo actualizar el helado");
    } finally {
      setIsSaving(false); // 🔓 libera botón
    }
};



//   useFocusEffect(
//   useCallback(() => {
//     const timeout = setTimeout(() => {
//       if (bottomSheetModalRef?.current) {
//         bottomSheetModalRef.current.dismiss();
//       } else {
//         console.log("bottomSheetModalRef no está disponible aún.");
//       }
//     }, 100); // Retraso de 100ms, ajusta según sea necesario

//     return () => {
//       clearTimeout(timeout);
//     };
//   }, [])
// );



  return (
    <View style={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={[styles.title, { marginBottom: 20 }]}>Ingrese los nuevos datos del helado "SABOR, PRECIO, CANTIDAD"</Text>
        <Button style={styles.closeButton} title="Close" onPress={closeEditModal} />
        <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    
      <ScrollView automaticallyAdjustKeyboardInsets={true}>
      {/* ..............................sabor */}
      <View style={styles.inputContainer}>
        <View style={styles.campos}>
          <FontAwesome5 style={styles.iconos} name="ice-cream" />
          <TextInput
            value={sabor}
            onChangeText={setSabor}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
           // style={styles.containerTextInput}
            style={[
              styles.containerTextInput,
              focus && { borderWidth: 3, borderColor: "gray" },
            ]}
            // placeholder={_sabor}
          />
        </View>

        {/* ..............................Precio */}
        <View style={styles.campos}>
          <FontAwesome5 style={styles.iconos} name="dollar-sign" />
          <TextInput
            value={""+precio}
            onChangeText={setPrecio}
            onFocus={() => setFocus(true)}
            onBlur={()  => setFocus(false)}
            style={[
              styles.containerTextInput,
              focus && { borderWidth: 3, borderColor: "black" },
            ]}
            // placeholder={_precio}
          />
        </View>

        {/* ..............................Cantidad */}
        <View style={styles.campos}>
          <FontAwesome5 style={styles.iconos} name="calculator" />
          <TextInput
            value={""+cantidad}
            onChangeText={setCantidad}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            style={[
              styles.containerTextInput,
              focus && { borderWidth: 3, borderColor: "black" },
            ]}
            // placeholder={_cantidad}
          />
        </View>
      </View>
        
      
      {/* <TextInput
        value={email}
        onChangeText={(text) => setEmail(text.toLowerCase())}
        // onFocus={() => setFocus(true)}
        // onBlur={() => setFocus(false)}
        keyboardType="email-address"
        style={[
          styles.input,
          focus && { borderWidth: 3, borderColor: "black" },
        ]}
        placeholder="Enter your contact email"
      /> */}
      <Button
        onPress={actualizarHelado}
        title={isSaving ? "GUARDANDO..." : "GUARDAR"}
        disabled={isSaving || sabor.length === 0}
      />
      </ScrollView>
    </View>
  );
}


const windowWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: "#00000020",
    padding: 15,
    borderRadius: 15,
    marginVertical: 15,
  },
  campos:{
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems:"center",
    height:60,
    padding: 10,
    // borderRadius: 15,
    marginBottom: 32,
    backgroundColor: "white",
    width:"100%",
},

iconos:{
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  color:"#e91e63", 
  borderWidth:1,
  borderColor:"#e91e63",
  borderRadius:20,
  padding:10,
  width:"21%",
  fontSize:24,

  // backgroundColor="red" 
},

containerTextInput: {
  width: windowWidth - 10,
  borderWidth: 1,
  borderRadius: 30,
  minHeight: 45,
  paddingHorizontal: 15,
  paddingTop: 8,
  fontSize: 16,
  paddingVertical: 5,
  borderColor: "lightgray",
  backgroundColor: "#fff",
  marginBottom: 5,
  marginLeft:8,
  fontWeight: "600",
},

  header: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
    marginRight: 40,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});