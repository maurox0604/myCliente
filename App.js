import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LogBox } from "react-native";

import Navigation from "./Navigation";
import { AuthProvider } from "./context/AuthContext";
import { BootstrapProvider } from "./context/BootstrapContext";
import { SedeProvider } from "./context/SedeContext";
import { CategoriasProvider } from "./context/CategoriasContext";
import { HeladosProvider } from "./context/HeladosContext";
import { VentasContextProvider } from "./context/VentasContext";
import { ReportesProvider } from "./context/ReportesContext";
import { DbaseProvider } from "./context/DbaseContext";
import { CartModalProvider } from "./context/CartModalContext";

LogBox.ignoreAllLogs();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        {/*
          BootstrapProvider hace UN solo fetch con productos + categorías + sedes.
          Los tres providers de abajo leen de ese resultado — no disparan
          fetches propios al arrancar, lo que evita saturar Clever Cloud.
        */}
        <BootstrapProvider>
          <SedeProvider>
            <ReportesProvider>
              <CategoriasProvider>
                <HeladosProvider>
                  <VentasContextProvider>
                    <DbaseProvider>
                      <CartModalProvider>
                        <Navigation style={styles.container} />
                      </CartModalProvider>
                    </DbaseProvider>
                  </VentasContextProvider>
                </HeladosProvider>
              </CategoriasProvider>
            </ReportesProvider>
          </SedeProvider>
        </BootstrapProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
