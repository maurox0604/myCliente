import { createContext, useContext, useState } from "react";
import {
    deleteTaskRequest,
    getTasksRequest,
    createTaskRequest,
    getOnlyTaskRequest,
    updateTaskRequest,
    toggleTaskDoneRequest,
    getVentasAll,
    cargarVentas,
} from "../api/ventas.api";

/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
export const VentaContext = createContext();

//.......................................... Creando mi propio Hook, se puede llamar en cualquier modulo 
//para acceder a las funciones
export const useVentas = () => {
    const context = useContext(VentaContext);
    if (!context) {
        throw new Error("useVentas must be used within a VentasContextProvider");
    }
    return context;
};

export const VentasContextProvider = ({ children }) => {
    const [ventas, setVentas] = useState([]);
    //..................................... Cargar tareas All()
    const loadVentas = async () => {
    try {
        //const ventasData = await getVentasAll();
        const ventasData = await cargarVentas();
        console.log("Ventas recibidas en el contexto:", ventasData);

        // Verifica si ventasData existe y tiene datos
        if (!ventasData || ventasData.length === 0) {
            console.log("No se encontraron ventas.");
            return; // O manejar la situación donde no hay datos
        }

        // Aquí es donde accedes a ventasData
        setVentas(ventasData);  // Asumiendo que usas algún state para guardar ventas
    } catch (error) {
        console.error("Error al cargar las ventas:", error);
    }
};

    
    return (
        <VentaContext.Provider
            value={{
                ventas,
                loadVentas,
                setVentas,

            }}>
            {children}
        </VentaContext.Provider>
    );
};