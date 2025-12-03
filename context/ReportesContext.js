import { createContext, useContext, useState } from "react";
import { getTopSaboresRequest } from "../api/reportes.api";

const ReportesContext = createContext();

export const useReportes = () => useContext(ReportesContext);

export const ReportesProvider = ({ children }) => {
    const [topSabores, setTopSabores] = useState([]);

    const loadTopSabores = async () => {
        try {
            const data = await getTopSaboresRequest();
            setTopSabores(data);
        } catch (error) {
            console.error("Error cargando top sabores:", error);
        }
    };

    return (
        <ReportesContext.Provider value={{ topSabores, loadTopSabores }}>
            {children}
        </ReportesContext.Provider>
    );
};
