import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Keyboard, View, Text, StyleSheet, Button, Alert, Pressable, TouchableOpacity } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native';
import { HeladosContext } from "../context/HeladosContext";

export default function EditModalContent({ id, _icon, _sabor, _precio, _cantidad, closeModal, bottomSheetModalRef }) {
  const [focus, setFocus] = useState(false);
  const [sabor, setSabor] = useState(_sabor);// Campo input
  const [precio, setPrecio] = useState(_precio);// Campo input
  const [cantidad, setCantidad] = useState(_cantidad);// Campo input
  const { updateHeladoCantidad, handleSearch } = useContext(HeladosContext);

  // const bottomSheetModalRef = useRef(null);
  const navigation = useNavigation();
  // const [foto, setFoto] = useState("../assets/images/helados/Icon_App.png");// Campo Uri Foto
  const [foto, setFoto] = useState(_icon);// Campo Uri Foto


  const actualizarHelado = async () => {
    console.log("☻ sabor: ",sabor, "- precio: ",precio)
    try {
        // const response = await fetch(`http://192.168.1.11:8000/helados/${id}`, {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/productos/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify({
            sabor: sabor,
            precio: precio,
            icon: foto,
            cantidad: cantidad,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }

      const data = await response.json();
      console.log("Datos actualizados: ", data);
      // alert('Éxito', 'Helado actualizado correctamente');
      updateHeladoCantidad(id, cantidad); //  updateHeladoCantidad se encarga de limpiar o recargar datos
      handleSearch("")
      closeModal(); // Cerrar el modal después de la actualización exitosa
    } catch (error) {
      console.error('Error al actualizar el helado:', error);
      alert('Error', `No se pudo actualizar el helado: ${error.message}`);
    }
  }

  useFocusEffect(
  useCallback(() => {
    const timeout = setTimeout(() => {
      if (bottomSheetModalRef.current) {
        bottomSheetModalRef.current.dismiss();
      } else {
        console.log("bottomSheetModalRef no está disponible aún.");
      }
    }, 100); // Retraso de 100ms, ajusta según sea necesario

    return () => {
      clearTimeout(timeout);
    };
  }, [])
);



  return (
    <View style={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={[styles.title, { marginBottom: 20 }]}>Ingrese los nuevos datos del helado "SABOR, PRECIO, CANTIDAD"</Text>
        {/* <Button style={styles.closeButton} title="Close" onPress={closeModal} /> */}
        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
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
        title="GUARDAR"
        disabled={sabor.length === 0}
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