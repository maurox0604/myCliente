// context/ReportesContext.js
import { createContext, useContext, useState } from "react";
import { getTopSaboresRequest } from "../api/reportes.api";

export const ReportesContext = createContext();

export const useReportes = () => useContext(ReportesContext);

export const ReportesProvider = ({ children }) => {
    const [topSabores, setTopSabores] = useState([]);

    const loadTopSabores = async (startDate = null, endDate = null) => {
        try {
            let url = "";

            if (startDate && endDate) {
                const start = startDate.toISOString().split("T")[0];
                const end = endDate.toISOString().split("T")[0];
                url = `?start=${start}&end=${end}`;
            }

            const data = await getTopSaboresRequest(url);
            setTopSabores(data);
        } catch (error) {
            console.log("Error cargando top sabores", error);
        }
    };

    return (
        <ReportesContext.Provider value={{ topSabores, loadTopSabores }}>
            {children}
        </ReportesContext.Provider>
    );
};
