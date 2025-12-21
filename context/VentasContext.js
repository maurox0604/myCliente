import { createContext, useContext, useState } from "react";
import { cargarVentas } from "../api/ventas.api";

export const VentaContext = createContext();

// Hook personalizado
export const useVentas = () => {
  const context = useContext(VentaContext);
  if (!context) {
    throw new Error("useVentas must be used within a VentasContextProvider");
  }
  return context;
};

export const VentasContextProvider = ({ children }) => {

  // 🔹 ESTADOS GLOBALES (AQUÍ SÍ)
  const [ventas, setVentas] = useState([]);
  const [modoVenta, setModoVenta] = useState("normal"); // normal | manual
  const [fechaManual, setFechaManual] = useState(null);

  // 🔹 FUNCIONES DE VENTA MANUAL
  const activarVentaManual = (fecha) => {
    setModoVenta("manual");
    setFechaManual(fecha);
  };

  const activarVentaNormal = () => {
    setModoVenta("normal");
    setFechaManual(null);
  };

  // 🔹 CARGAR VENTAS
    const loadVentas = async () => {
      console.log("Cargando ventas...");
    try {
      const ventasData = await cargarVentas();
      if (!ventasData) return;
      setVentas(ventasData);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    }
    };
    

    const loadVentasByDateRange = async (startDate, endDate) => {
        console.log("cargando ventas por rango.....")
    try {
        const start = startDate.toISOString().split("T")[0];
        const end = endDate.toISOString().split("T")[0];

        console.log(`cargando /ventas?start=${start}&end=${end}).....`)

        const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/ventas?start=${start}&end=${end}`
        );

        const data = await response.json();
        setVentas(data.ventas);
    } catch (error) {
        console.error("Error al cargar ventas por rango:", error);
    }
    }
    

    
     // Ordenar ventas
  const sortVentas = (criterion) => {
    const sortedVentas = [...ventas]; // Crear una copia de las ventas
    console.log("Ventas antes de ordenar:", sortedVentas);
    if (criterion === "fecha") {
        sortedVentas.sort((a, b) => {
            // Convertir las fechas a objetos Date
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);

            // Imprimir para depuración
            console.log("Comparando fechas:");
            console.log(a+". Fecha A:", fechaA);
            console.log(b+". Fecha B:", fechaB);

            // Restar las fechas para ordenarlas
            // return fechaB - fechaA; // De más reciente a más antiguo
            return fechaA - fechaB; // De más reciente a más antiguo
        });
    } else if (criterion === "producto") {
        sortedVentas.sort((a, b) => {
            // Ordenar por cantidad vendida (descendente)
            return b.cantidad - a.cantidad;
        });
    }

    // Actualizar el estado
    console.log("Ventas ordenadas:", sortedVentas);
    setVentas(sortedVentas);
};



  return (
    <VentaContext.Provider
      value={{
        // lo existente
        ventas,
        setVentas,
        loadVentas,
        loadVentasByDateRange,
        sortVentas,

        // venta manual
        modoVenta,
        fechaManual,
        activarVentaManual,
        activarVentaNormal,
      }}
    >
      {children}
    </VentaContext.Provider>
  );
};
