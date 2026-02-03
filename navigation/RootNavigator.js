import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PublicStack from "./PublicStack";
import MainStack from "./MainStack";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Public" component={PublicStack} />
      <Stack.Screen name="Main" component={MainStack} />
    </Stack.Navigator>
  );
}
