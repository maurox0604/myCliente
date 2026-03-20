import { useRef, useEffect, useState } from "react";
import {
  Animated, View, Text, StyleSheet, Pressable,
  TouchableOpacity, Image, Alert,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import Calculadora from "./Calculadora";
import EditModalContent from "./EditModalContent";

export default function Helado({
  id, sabor, precio, icon, cantidad,
  editItem, activaDeleteItem, columnas,
  onDeleteSuccess, id_categoria,
}) {
  const [isDeleteActive, setIsDeleteActive] = useState(false);
  const [imageSource, setImageSource] = useState({ uri: icon });

  const editModalRef = useRef(null);
  const calcModalRef = useRef(null);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: isDeleteActive ? 80 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isDeleteActive]);

  const openEditModal = () => editModalRef.current?.present();
  const closeEditModal = () => editModalRef.current?.dismiss();
  const openCalcModal = () => calcModalRef.current?.present();
  const closeCalcModal = () => calcModalRef.current?.dismiss();

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

  const datosPaCalc = { id, sabor, cantidad, icon, precio, closeCartModal: closeCalcModal };
  const isEmpty = cantidad === 0;

  // ✅ MODO COLUMNA — tarjeta compacta horizontal
if (columnas) {
  return (
    <TouchableOpacity
      onLongPress={() => activaDeleteItem && setIsDeleteActive(true)}
      onPress={() => setIsDeleteActive(false)}
      activeOpacity={0.9}
      style={[styles.cardCompact, isEmpty && styles.cardEmpty]}
    >
      {/* Imagen pequeña */}
      <Image
        style={styles.imgCompact}
        source={imageSource}
        onError={handleImageError}
      />

      {/* Badge cantidad sobre imagen */}
      <View style={styles.badgeCompact}>
        <Text style={styles.badgeTextCompact}>{cantidad}</Text>
      </View>

      {/* Nombre + precio */}
      <View style={styles.dataCompact}>
        <Text style={styles.titleCompact} numberOfLines={1}>{sabor}</Text>
        <Text style={styles.priceCompact}>${precio.toLocaleString('es-CO')}</Text>
      </View>

      {/* Botón + */}
      {editItem ? (
        <Pressable onPress={openEditModal} style={styles.btnEditCompact}>
          <Feather name="edit" size={13} color="#fff" />
        </Pressable>
      ) : (
        <Pressable onPress={openCalcModal} style={styles.btnAddCompact}>
          <Feather name="plus" size={16} color="#fff" />
        </Pressable>
      )}

      {/* Delete overlay */}
      {isDeleteActive && (
        <Pressable onPress={handleDelete} style={styles.deleteOverlayCompact}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color="white" />
        </Pressable>
      )}

      {/* Modales */}
      <BottomSheetModal ref={calcModalRef} snapPoints={["80%"]}>
        <Calculadora datosPaCalc={datosPaCalc} />
      </BottomSheetModal>
      <BottomSheetModal ref={editModalRef} snapPoints={["95%", "90%"]}>
        <EditModalContent
          id={id} _icon={icon} _sabor={sabor} _precio={precio}
          _cantidad={cantidad} _id_categoria={id_categoria}
          closeEditModal={closeEditModal}
        />
      </BottomSheetModal>
    </TouchableOpacity>
  );
}

  // ✅ MODO LISTA — fila horizontal (igual que antes pero limpio)
  return (
    <TouchableOpacity
      onLongPress={() => activaDeleteItem && setIsDeleteActive(true)}
      onPress={() => setIsDeleteActive(false)}
      activeOpacity={0.9}
      style={[styles.cardRow, isEmpty && styles.cardEmpty, styles.shadow]}
    >
      {/* Imagen + badge */}
      <View style={styles.imgWrapper}>
        <Image
          style={styles.imgRow}
          source={imageSource}
          onError={handleImageError}
        />
        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>{cantidad}</Text>
        </View>
      </View>

      {/* Datos */}
      <View style={styles.dataRow}>
        <Text style={styles.titleRow} numberOfLines={1}>{sabor}</Text>
        <Text style={styles.priceRow}>${precio.toLocaleString('es-CO')}</Text>
      </View>

      {/* Botón */}
      {editItem ? (
        <Pressable onPress={openEditModal} style={styles.btnEdit}>
          <Feather name="edit" size={16} color="#fff" />
        </Pressable>
      ) : (
        <Pressable onPress={openCalcModal} style={styles.btnAdd}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      )}

      {/* Delete */}
      {isDeleteActive && (
        <Animated.View style={[styles.deleteBtn, { width: widthAnim }]}>
          <Pressable onPress={handleDelete} style={styles.deletePressable}>
            <MaterialCommunityIcons name="trash-can-outline" size={24} color="white" />
          </Pressable>
        </Animated.View>
      )}

      {/* Modales */}
      <BottomSheetModal ref={calcModalRef} snapPoints={["80%"]}>
        <Calculadora datosPaCalc={datosPaCalc} />
      </BottomSheetModal>
      <BottomSheetModal ref={editModalRef} snapPoints={["95%", "90%"]}>
        <EditModalContent
          id={id} _icon={icon} _sabor={sabor} _precio={precio}
          _cantidad={cantidad} _id_categoria={id_categoria}
          closeEditModal={closeEditModal}
        />
      </BottomSheetModal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ============ MODO LISTA ============
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    padding: 10,
    width: "100%",
  },
  imgWrapper: {
    position: "relative",
    width: 80,
    height: 80,
  },
  imgRow: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 12,
  },
  badgeRow: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#09aef5",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  dataRow: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  titleRow: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  priceRow: {
    fontSize: 14,
    color: "#56636F",
    fontWeight: "500",
  },

  // ============ MODO COLUMNA COMPACTO ============
cardCompact: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: 12,
  margin: 4,
  padding: 6,
  height: 64,          // ✅ altura fija pequeña — caben ~8 por pantalla
  position: "relative",
  overflow: "hidden",
  shadowColor: "rgba(38,43,48,0.3)",
  shadowOpacity: 0.6,
  elevation: 4,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
},
imgCompact: {
  width: 48,
  height: 48,
  resizeMode: "contain",
  borderRadius: 8,
  flexShrink: 0,
},
badgeCompact: {
  position: "absolute",
  top: 4,
  left: 4,
  backgroundColor: "#09aef5",
  borderRadius: 10,
  width: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2,
},
badgeTextCompact: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "700",
},
dataCompact: {
  flex: 1,
  paddingHorizontal: 6,
  justifyContent: "center",
},
titleCompact: {
  fontSize: 12,
  fontWeight: "700",
  color: "#222",
  marginBottom: 2,
},
priceCompact: {
  fontSize: 11,
  color: "#56636F",
  fontWeight: "600",
},
btnAddCompact: {
  backgroundColor: "#e91e63",
  width: 30,
  height: 30,
  borderRadius: 15,
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 0,
},
btnEditCompact: {
  backgroundColor: "#352dc9",
  width: 28,
  height: 28,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 0,
},
deleteOverlayCompact: {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(229,57,53,0.9)",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 12,
  zIndex: 10,
},

  // ============ COMPARTIDOS ============
  btnAdd: {
    backgroundColor: "#e91e63",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  btnEdit: {
    backgroundColor: "#352dc9",
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardEmpty: {
    backgroundColor: "#fff0f0",
    borderColor: "#ffcccc",
    borderWidth: 1.5,
  },
  shadow: {
    shadowColor: "rgba(38,43,48,0.4)",
    shadowOpacity: 0.8,
    elevation: 8,
    shadowRadius: 12,
    shadowOffset: { width: 1, height: 4 },
  },
  deleteBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#e53935",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
  },
  deletePressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  deleteOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(229,57,53,0.92)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    zIndex: 10,
  },
});