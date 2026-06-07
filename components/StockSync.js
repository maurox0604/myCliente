// components/StockSync.js
// ─────────────────────────────────────────────────────────────────
// Componente "invisible" — no renderiza nada, solo escucha cuando
// PublicProductosContext actualiza los productos y notifica al
// PublicCartContext para recortar cantidades si el stock bajó.
//
// CÓMO USARLO:
//   Colócalo dentro de ambos providers, por ejemplo en PublicStack.js:
//
//   <PublicCartProvider>
//     <PublicProductosProvider>
//       <StockSync />          ← aquí
//       <Stack.Navigator>
//         ...
//       </Stack.Navigator>
//     </PublicProductosProvider>
//   </PublicCartProvider>
// ─────────────────────────────────────────────────────────────────

import { useEffect, useContext } from "react";
import { PublicProductosContext } from "../context/PublicProductosContext";
import { usePublicCart } from "../context/PublicCartContext";

export default function StockSync() {
  const { productos } = useContext(PublicProductosContext);
  const { syncStock } = usePublicCart();

  useEffect(() => {
    if (productos?.length) {
      syncStock(productos);
    }
  }, [productos]); // se ejecuta cada vez que el polling actualiza productos

  return null; // no renderiza nada
}
