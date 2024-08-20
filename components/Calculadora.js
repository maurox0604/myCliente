import { useContext, useEffect, useState, alert } from "react";
import { View, Text, StyleSheet, Pressable, Image, Button, Alert } from "react-native";
import { CartContext } from "../context/CartContext";
import { Feather } from "@expo/vector-icons";


export default function Calculadora({
  // id,
  // sabor,
  // cantidad,
  // icon,
  // precio,
  // shared_with_id,
  completed,
  // closeCartModal,
  datosPaCalc,
  updateHeladoCantidad
}) {
  
  const { addToCart, existCart } = useContext(CartContext);
  
  
  const [activMensaje, setActivMensaje] = useState(false);
  const [cantCompra, setCantCompra] = useState(0);
  const [cantQueda, setCantQueda] = useState(datosPaCalc.cantidad);
  const [ventaPorHelado, setVentaPorHelado] = useState(0);

  

  const ventaXhelado = () => {
     let tot = datosPaCalc.precio * cantCompra;
      return tot
  }
  const totVentaXhelado = ventaXhelado();
  const item = { id:datosPaCalc.id, sabor:datosPaCalc.sabor, cantCompra, cantQueda,  totVentaXhelado, icon:datosPaCalc.icon, precio:datosPaCalc.precio };
 
  useEffect(() => {
    revisarItem();
  },[])
  

  // function revisarItem(){
  //   const { itemObj, itemExiste } = existCart(item);
  //   if (itemExiste === -1) {
      
  //   }else{
  //     console.log("SI EXISTE.y vamos a actualizarlo........");
  //     console.log("itemObj: ", itemObj)
  //     // datosPaCalc.sabor = "CARNE"
  //     setCantCompra(itemObj.cantCompra);
  //     setCantQueda(itemObj.cantQueda);
  //   }
    
  //   console.log("revisarItem() itemObj: ", itemObj, "   itemExiste:", itemExiste)
  // };

  const revisarItem = () => {
    console.log("Dentro de Revisaritem()")
    const { itemObj, itemExiste } = existCart(item);
    if (itemExiste !== -1) {
      console.log("Dentro de Revisaritem() ... si existe: ", itemExiste)
      setCantCompra(itemObj.cantCompra);
      setCantQueda(itemObj.cantQueda);
    }
  }


  //console.log("[[[[[[ datosPaCalc: ]]]]]]", datosPaCalc)

  // const existe = existCart(item);
  // console.log("Si exite y es ESTE: ", existe)



  const handleAddToCart = (item) =>{
    console.log("Dentro de HANDLE ADD TO CART")
    if (cantCompra > 0) {
      addToCart(item);
      updateHeladoCantidad(datosPaCalc.id, cantQueda); // Actualiza la cantidad en ListaHelados no en DB
      
      datosPaCalc.closeCartModal();

    }else
      setActivMensaje(true);
      console.log('♥ Debes tener al menos 1 helado ');
  }

  

  // useEffect(() => {
  //   fetchInfo();
  // }, []);

  const cantComprar = (band) =>{
      console.log(band, '    cantQueda: ', cantQueda, "    cantCompra: ", cantCompra)
      // setCantCompra()
      if( band === 1 && cantQueda > 0 ) {
        setCantCompra(cantCompra + band);
        let queda = cantQueda - band;
        setCantQueda(queda);
        console.log('**cantQueda: ', cantQueda, "    cantCompra: ", cantCompra)
      }else if (band === -1 && cantCompra >= 1 ) {
        console.log("cantQueda es menor a cero...", cantQueda)
        setCantCompra(cantCompra - 1);
        let queda = cantQueda + 1;
        setCantQueda(queda);
      }
  }


  return (
    <View style={styles.contentContainer}>
          { activMensaje &&
            <View >
              <Text>
                ♥ Debes tener al menos 1 helado 
              </Text>
              {/* { setActivMensaje(false) } */}
            </View>
          }

      <View style={styles.header}>
          { cantQueda == 0 ?  
            (<View style={styles.msj}>
              <Text> No quedan helados de {datosPaCalc.sabor}</Text>
            </View>
            ) : (
              <Text>Shopping Cart</Text>
            )
          }
        
        <Feather
                onPress={datosPaCalc.closeCartModal}
                name="x-circle"
                size={20}
                color="#3800ff"
        />
      </View>
      {/* <Text style={[styles.header, { marginBottom: 20 }]}>CALCULADORA</Text> */}
      

        {/* CALCULADORA */}
      
        <View style={styles.contentProd}>
            <View style={styles.disponible}>
              <Text style={styles.titleQueda}>{cantQueda}</Text>
              {/* .......................................................Nombre de SABOR */}
              <Text style={styles.title}>{datosPaCalc.sabor}</Text>
            </View>

            <View style={styles.producto}>
              <View style={styles.contImagen} >
                <Image
                    style={styles.iconImg}
                    source={{ uri: datosPaCalc.icon }}
                />
                <Text style={styles.titlePrecio}>${(datosPaCalc.precio).toLocaleString('es-CO')}</Text>
              </View>
              
              <View style={styles.contCalc}>
                <Text style={styles.titleTotal}> ${(datosPaCalc.precio * cantCompra ).toLocaleString('es-CO')}</Text>
                <View style={styles.sumadora}>
                    {/* <Pressable onPress={() => cantCompra > 1 ? setCantCompra(cantCompra - 1) : setCantCompra(1)} style={styles.sumaButton}> */}
                    <Pressable style={styles.sumaButton} onPress={ () => cantComprar(-1) }>
                        <Text style={{ color: "white", fontWeight: "bold" }}>-</Text>
                    </Pressable>
                    <Text style={styles.cantCompraText}> {cantCompra}</Text>
                    {/* <Pressable onPress={() => setCantCompra(cantCompra + 1) } style={styles.sumaButton}> */}
                    <Pressable style={styles.sumaButton} onPress={ () => cantComprar(1) }>
                        <Text style={{ color: "white", fontWeight: "bold" }}>+</Text>
                    </Pressable>
                </View>
              </View>
            </View>
          </View>
      
        
        <View style={styles.contButton}>
              <Pressable style={styles.button} onPress={() => handleAddToCart(item)} disabled={cantQueda < 0}>
                  <Text style={{ color: "blue", fontWeight: "bold" }}>Adicionar</Text>
              </Pressable>
        </View>
        
      {/* <Text style={[styles.title]}>Status</Text> */}
      <View
        style={[
          styles.status,
          { backgroundColor: completed === 1 ? "#4ade80" : "#f87171" },
        ]}
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
    // flexDirection:"column",
    // alignItems: "center",
    paddingHorizontal: 15,
  },
  contImagen:{
    flex:2,
    flexDirection:"column",
    backgroundColor:"#85c1e9",
    alignContent:"flex-start",
    paddingHorizontal: 10,
  },
  contCalc:{
    flex:5,
    flexDirection:"column",
    backgroundColor:"#aaa",
    paddingHorizontal:10
  },
  title: {
    fontWeight: "900",
    letterSpacing: 0.5,
    fontSize: 20,
    textAlign: "center",
  },
  titlePrecio:{
    fontSize: 15,
  },
  description: {
    color: "#56636F",
    fontSize: 13,
    fontWeight: "900",
    color: "black",
  },

  titleTotal:{
    padding:15,
    textAlign:"right",
    fontWeight:"bold",
    backgroundColor:"#ccc",
    fontSize:24,
    borderRadius: 15,
  },
  titleQueda:{
    padding:5,
    alignContent:"center",
    textAlign:"center",
    justifyContent:"center",
    fontSize:20,
    fontWeight:"bold",
    borderRadius: 50,
    backgroundColor:"#2ecc71",
    width: 40,
    height: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 12,
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
  contButton:{
    height:40,
  },
  button: {
    alignSelf: 'stretch',
    // width: "80%",
    height:40,
    alignItems: 'center',
    alignContent:'center',
    justifyContent:"center",
    color:"red",
    backgroundColor:"pink",
    borderRadius: 10,
  },


  sumaButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 30,
  },
  disponible:{
    // flex: 1,
      flexDirection: "row",
      alignItems: "center",
      alignContent:"center",
      justifyContent: "space-between",
      paddingHorizontal:10,
      width:"100%",
      backgroundColor:"#d1f2eb",
      marginBottom:10,
      paddingVertical:5,
  },
  sumadora:{
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
      borderRadius: 15,
      marginBottom: 5,
      // width:"55%",
      backgroundColor: "#ffff11",
  },
  contentProd:{
      flexDirection: "column",
      backgroundColor: "#ff1188",
      borderRadius: 15,
      marginBottom: 5,
      width:"100%",
      padding: 10,
  },
  msj:{
    backgroundColor:"white",
    color:"red",
    borderWidth:2,
    borderColor:"red",
    borderRadius: 15,
    marginBottom: 5,
    padding: 10,
  },
    producto:{
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      alignContent:"center",
    },
  iconImg:{
    height:90,
    resizeMode: "contain",
    borderRadius: 20,
  },
  cantCompraText:{
      fontWeight: "900",
      fontSize: 24,
      textAlign: "center",
      padding:10,
  }

});