import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// =======================
// Contexts
// =======================
import { CartProvider } from "./context/CartContext";
import { AuthContext } from "./context/AuthContext";
import { SedeProvider } from "./context/SedeContext";

// =======================
// Navigation
// =======================
import RootNavigator from "./navigation/RootNavigator";

// =======================
// Screens
// =======================
import LoadingScreen from "./screens/LoadingScreen";

// =======================
// Deep Linking config
// =======================
// const linking = {
//   prefixes: ["http://localhost:8081", "https://my-cliente.vercel.app"],
//   config: {
//     screens: {
//       // ✅ Solo Public tiene ruta especial para el QR/URL
//       Public: {
//         path: "public",
//         screens: {
//           PublicProductos: "productos",
//         },
//       },
//       // ✅ Login y Main no tienen ruta deep link — son privados
//       LoginScreen: "login",
//       Main: "home",
//     },
//   },
// };


/**
 * Navigation
 * ----------
 * Punto ÚNICO de entrada a React Navigation.
 *
 * Reglas que cumple:
 * - Un solo NavigationContainer
 * - Un solo RootNavigator
 * - Nada de stacks o tabs aquí
 * - Providers envuelven la navegación
 */
export default function Navigation() {
  const { loading, role, user } = useContext(AuthContext);

  // 🔍 LOG TEMPORAL
  console.log("🧭 Navigation — loading:", loading, "| user:", !!user, "| role:", role);


   // ✅ Espera tanto el loading de Firebase como que el rol esté disponible
  if (loading || (user && role === null)) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <SedeProvider>
          <BottomSheetModalProvider>
            {/* <NavigationContainer linking={linking}> */}
              <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </BottomSheetModalProvider>
        </SedeProvider>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
