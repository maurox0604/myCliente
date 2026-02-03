import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PublicProductosScreen from "../public/PublicProductosScreen";
import { PublicProductosProvider } from "../context/PublicProductosContext";
// =======================
// Navigator
// =======================

const Stack = createNativeStackNavigator();

export default function PublicStack() {
  return (
    <PublicProductosProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="PublicProductos"
          component={PublicProductosScreen}
          options={{ title: "Catálogo" }}
        />
      </Stack.Navigator>
    </PublicProductosProvider>
  );
}
