import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import PublicStack from "./PublicStack";
import MainStack from "./MainStack";
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, role } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user && role ? (
        // ✅ Logueado con rol → zona privada
        <Stack.Screen name="Main" component={MainStack} />
      ) : (
        // ✅ Sin sesión → Login
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          initialParams={{ userId: 2 }}
        />
      )}
      {/* ✅ Público siempre disponible por URL/QR, no es la pantalla inicial */}
      <Stack.Screen name="Public" component={PublicStack} />
    </Stack.Navigator>
  );
}