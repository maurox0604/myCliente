import { createContext, useContext, useState, useEffect } from "react";


const SedeContext = createContext();

export function SedeProvider({ children }) {
    const [sedes, setSedes] = useState([]);
    const [sedeActiva, setSedeActiva] = useState(null);

    useEffect(() => {
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/sedes`)
        .then(res => res.json())
        .then(data => {
            setSedes(data);
            setSedeActiva(data[0]); // default
        });
    }, []);

    const cambiarSede = (sede) => {
        setSedeActiva(sede);
        console.log("SEDE activa: ", sede)
    };

    return (
        <SedeContext.Provider value={{
            sedes,
            sedeActiva,
            cambiarSede
        }}>
        {children}
        </SedeContext.Provider>
    );
}

export const useSede = () => useContext(SedeContext);
