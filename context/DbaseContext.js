import { createContext, useState, useEffect } from "react";


export const DbaseContext = createContext();

export const  DbaseProvider = ({children}) => {

    const [cambios, setCambios] = useState(false);

    const regCambios = (val) => {
        setCambios(val);
    }
    

    const value = {
        cambios,
        regCambios,
    };
    return <DbaseContext.Provider value={value}>
                {children}
            </DbaseContext.Provider>;
}