import { createContext, useContext, useEffect, useState } from "react";

const CategoriasContext = createContext();

export function CategoriasProvider({ children }) {
    const [categorias, setCategorias] = useState([]);
    const [categoriaActiva, setCategoriaActiva] = useState(null);
    const [loadingCategorias, setLoadingCategorias] = useState(false);

    const cargarCategorias = async () => {
        try {
        setLoadingCategorias(true);

        const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/categorias/all`
        );
        const data = await res.json();

        if (data.ok) {
            setCategorias(data.categorias);

            // 👉 default: primera categoría activa
            if (!categoriaActiva && data.categorias.length > 0) {
            setCategoriaActiva(data.categorias[0].id);
            }
        }
        } catch (error) {
        console.error("Error cargando categorías:", error);
        } finally {
        setLoadingCategorias(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    return (
        <CategoriasContext.Provider
        value={{
            categorias,
            categoriaActiva,
            setCategoriaActiva,
            loadingCategorias,
            recargarCategorias: cargarCategorias,
        }}
        >
        {children}
        </CategoriasContext.Provider>
    );
}

export const useCategorias = () => useContext(CategoriasContext);
