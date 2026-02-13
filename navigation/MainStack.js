import React, { useRef } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

// =======================
// Screens
// =======================
import Welcome from "../screens/Welcome";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import CrearProducto from "../screens/CreaHeladoScreen";
import CrearCategoria from "../screens/CrearCategoria";
import MenuCrear from "../screens/MenuCrear";
import HeladosAdminScreen from "../screens/HeladosAdminScreen";

// =======================
// Tabs
// =======================
import HomeTabs from "./HomeTabs";

// =======================
// Components
// =======================
import CartModalContent from "../components/CartModalContent";
import MenuVenta from "../components/MenuVenta";
import SedeSelectorSheet from "../components/SedeSelectorSheet";

// =======================
// Navigator
// =======================
const Stack = createNativeStackNavigator();

export default function MainStack() {
  // =======================
  // Refs para BottomSheets
  // =======================
  const cartModalRef = useRef(null);
  const menuVentaRef = useRef(null);
  const sedeModalRef = useRef(null);

  // =======================
  // Backdrop común
  // =======================
  const renderBackdrop = (props) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      pressBehavior="close"
    />
  );

  // =======================
  // Handlers
  // =======================
  const openCartModal = () => cartModalRef.current?.present();
  const closeCartModal = () => cartModalRef.current?.dismiss();

  const openMenuVenta = () => menuVentaRef.current?.present();
  const closeMenuVenta = () => menuVentaRef.current?.dismiss();

  const openSedeModal = () => sedeModalRef.current?.present();
  const closeSedeModal = () => sedeModalRef.current?.dismiss();

  return (
    <>
      {/* ======================= */}
      {/* Stack principal */}
      {/* ======================= */}
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="HomeTabs"
          options={{ headerShown: false }}
        >
          {() => (
            <HomeTabs
              openCartModal={openCartModal}
              openMenuVenta={openMenuVenta}
              openSedeModal={openSedeModal}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="MenuCrear"
          component={MenuCrear}
          options={{ title: "Agregar" }}
        />

        <Stack.Screen
          name="CrearCategoria"
          component={CrearCategoria}
          options={{ title: "Nueva Categoría" }}
        />

        <Stack.Screen
          name="CrearProducto"
          component={CrearProducto}
          options={{ title: "Nuevo Producto" }}
        />

        <Stack.Screen
          name="HeladosAdmin"
          component={HeladosAdminScreen}
          options={{ title: "Administrar Productos" }}
        />

      </Stack.Navigator>

      {/* ======================= */}
      {/* Modal Carrito */}
      {/* ======================= */}
      <BottomSheetModal
        ref={cartModalRef}
        snapPoints={["80%"]}
        backdropComponent={renderBackdrop}
        handleComponent={null}
        enableContentPanningGesture={false}
      >
        <CartModalContent closeModal={closeCartModal} />
      </BottomSheetModal>

      {/* ======================= */}
      {/* Modal menú venta */}
      {/* ======================= */}
      <BottomSheetModal
        ref={menuVentaRef}
        snapPoints={["35%"]}
        backdropComponent={renderBackdrop}
        handleComponent={null}
      >
        <MenuVenta closeModal={closeMenuVenta} />
      </BottomSheetModal>

      {/* ======================= */}
      {/* Modal selector sede */}
      {/* ======================= */}
      <BottomSheetModal
        ref={sedeModalRef}
        snapPoints={["40%"]}
        backdropComponent={renderBackdrop}
        handleComponent={null}
      >
        <SedeSelectorSheet closeModal={closeSedeModal} />
      </BottomSheetModal>
    </>
  );
}
