import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PublicProductosScreen from "../public/PublicProductosScreen";
import { PublicProductosProvider } from "../context/PublicProductosContext";
import { PublicCartProvider } from "../context/PublicCartContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

const Stack = createNativeStackNavigator();

export default function PublicStack() {
  return (
    <PublicProductosProvider>
      <PublicCartProvider>
        <BottomSheetModalProvider>
          <PublicProductosScreen />
        </BottomSheetModalProvider>
      </PublicCartProvider>
    </PublicProductosProvider>
  );
}

