import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, TextInput } from "react-native";


export default function Editor({
}) {
    const [sabor, setSabor] = useState("");// Campo input
    const [precio, setPrecio] = useState("");// Campo input
    const [cantidad, setCantidad] = useState("");// Campo input
    const [foto, setFoto] = useState("../assets/images/helados/Icon_App.png");// Campo Uri Foto

  useEffect(() => {
    fetchInfo();
  }, []);

  async function fetchInfo() {
    // const response = await fetch(`http://192.168.1.11:8000/helados/${id}`,{
      const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados/${id}`, {
        headers: {
          "x-api-key": "abcdef123456",
          'Access-Control-Allow-Origin': '*',
        },
        method: "GET",
      }
    );
    // const { author, shared_with } = await response.json();
    // setAuthor(author);
    // setSharedWith(shared_with);
  }

  return (
    <View style={styles.contentContainer}>
      <Text style={[styles.title, { marginBottom: 20 }]}>-- EDITOR --</Text>
      <View style={styles.disponible}>
          <Text style={styles.title}>{sabor}</Text>
          <Text style={styles.title}>{cantidad}</Text>
        </View>

        {/* EDITOR */}
        <View style={styles.producto}>
          {/* <Image
                style={styles.iconImg}
                source={{ uri: icon }}
            /> */}
            
          {/* <View style={styles.sumadora}>
              <Pressable onPress={() => setCantCompra(cantCompra - 1)} style={styles.sumaButton}>
                  <Text style={{ color: "white", fontWeight: "bold" }}>-</Text>
              </Pressable>
              <Text style={styles.cantCompraText}> {cantCompra}</Text>
              <Pressable onPress={() => setCantCompra(cantCompra + 1)} style={styles.sumaButton}>
                  <Text style={{ color: "white", fontWeight: "bold" }}>+</Text>
              </Pressable>
          </View> */}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.containerTextInput}
                        placeholder="Sabor"
                        scrollEnabled={true}
                        onChangeText={setSabor}
                        defaultValue={sabor}
                    />
                    <TextInput
                        style={styles.containerTextInput}
                        placeholder="Precio"
                        scrollEnabled={true}
                        onChangeText={setPrecio}
                        defaultValue={precio}
                    />
                    <TextInput
                        style={styles.containerTextInput}
                        placeholder="cantidad"
                        scrollEnabled={true}
                        onChangeText={setCantidad}
                        defaultValue={cantidad}
                    />
                </View>
        </View>
        
      {/* <Text style={[styles.title]}>Status</Text> */}
      <View
        // style={[
        //   styles.status,
        //   { backgroundColor: completed === 1 ? "#4ade80" : "#f87171" },
        // ]}
      >
        




        {/* <Text style={[styles.title, { color: "white" }]}>
          {completed === 1 ? "Completed" : "Incompleted"}
        </Text>
      </View>
      <Text style={[styles.description]}>PARTICIPANTS</Text>
      <View style={{ flexDirection: "row" }}>
        <View style={styles.participant}>
          <Text style={[styles.description, { color: "white" }]}>
            {author.name}
          </Text>
        </View>
        <View style={styles.participant}>
          <Text style={[styles.description, { color: "white" }]}>
            {sharedWith.name}
          </Text>
        </View>*/}

      </View> 
    </View>
  );
}
const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 15,
  },
  title: {
    fontWeight: "900",
    letterSpacing: 0.5,
    fontSize: 16,
    textAlign: "center",
  },
  description: {
    color: "#56636F",
    fontSize: 13,
    fontWeight: "900",
    color: "black",
  },
  participant: {
    backgroundColor: "#8b5cf6",
    padding: 5,
    paddingHorizontal: 10,
    margin: 5,
    borderRadius: 20,
    fontWeight: "900",
    color: "white",
  },
  input: {
    borderWidth: 2,
    borderColor: "#000020",
    padding: 15,
    borderRadius: 15,
    marginVertical: 15,
  },
  status: {
    padding: 5,
    paddingHorizontal: 10,
    marginTop: 5,
    marginBottom: 20,
    borderRadius: 20,
    fontWeight: "900",
    color: "white",
  },

  sumaButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 10,
},
disponible:{
  // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 15,
    marginBottom: 5,
    width:"100%",
  backgroundColor: "#dd00ff",
},
sumadora:{
  // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 15,
    marginBottom: 5,
    width:"55%",
  backgroundColor: "#ffff11",
},
  producto:{
    // flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
      borderRadius: 15,
      marginBottom: 5,
      width:"100%",
      backgroundColor: "#ff1188",
      borderColor:"#00ff00"
  },
  iconImg:{
    width: 50,
    height:50,
},
cantCompraText:{
    fontWeight: "900",
    fontSize: 24,
    textAlign: "center",
    padding:10,
}

});