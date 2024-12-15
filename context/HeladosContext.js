import React, { createContext, useState, useEffect, useCallback } from 'react';
// import { set } from 'react-datepicker/dist/date_utils';

export const HeladosContext = createContext();

export const HeladosProvider = ({ children }) => {
    const [helados, setHelados] = useState([]);
    const [filteredHelados, setFilteredHelados] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [seActualiza, setSeActualiza] = useState(false);


    useEffect(() => {
        // Actualiza `filteredHelados` automáticamente cuando `helados` cambia
        setFilteredHelados(helados);
    }, [helados]);


    // Función para obtener los datos de los helados
    const fetchHelados = async () => {
        try {
            console.log("Fetching helados...");
            const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            console.log("Helados obtenidos: ", data);
            setHelados(data);
            setFilteredHelados(data); // Inicialmente, filtrados son iguales
        } catch (error) {
            console.error("Error al obtener los helados:", error);
        }
    };

    // Función para actualizar la cantidad de un helado en la lista
    const updateHeladoCantidad = (id, nuevaCantidad) => {
        if (nuevaCantidad === undefined || nuevaCantidad < 0) {
            console.log("RECARGANDO LA LISTA DE HELADOS");
            setFilteredHelados(helados);
            return;
        }else{
            console.log("Actualizando helado:", id, "nueva cantidad:", nuevaCantidad);
            setHelados(prevHelados =>
                prevHelados.map(helado =>
                    helado.id === id ? { ...helado, cantidad: nuevaCantidad } : helado
                )
            );
    }
        
    
   // setSeActualiza(true);
    // setFilteredHelados(helados);
};

    // Función para sincronizar múltiples helados (ej., después de una compra)
const syncHelados = (updatedItems) => {
    setHelados(prevHelados =>
        prevHelados.map(helado => {
            const updatedItem = updatedItems.find(item => item.id === helado.id);
            return updatedItem ? { ...helado, cantidad: updatedItem.cantidad } : helado;
        })
    );
};

    // Función para eliminar un helado
    const deleteHelado = (id) => {
        console.log("Eliminando helado con ID:", id);
        setHelados(prevHelados => prevHelados.filter(helado => helado.id !== id));
    };

    // Función para buscar helados por texto
    const handleSearch = (text) => {
        setSearchText(text);
        if (text === '') {
            setFilteredHelados(helados);
        } else {
            const heladosFiltrados = helados.filter(helado =>
                helado.sabor.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredHelados(heladosFiltrados);
        }
    };

    // Función para ordenar los helados por nombre
    const ordenarPorNombre = () => {
        const listaOrdenada = [...filteredHelados].sort((a, b) => a.sabor.localeCompare(b.sabor));
        setFilteredHelados(listaOrdenada);
    };

    // Función para ordenar los helados por cantidad
    const ordenarPorCantidad = () => {
        const listaOrdenada = [...filteredHelados].sort((a, b) => a.cantidad - b.cantidad);
        setFilteredHelados(listaOrdenada);
    };

    // Obtener los helados al montar el contexto
    useEffect(() => {
        fetchHelados();
    }, []);

    return (
        <HeladosContext.Provider
            value={{
                helados,
                filteredHelados,
                fetchHelados,
                updateHeladoCantidad,
                deleteHelado,
                handleSearch,
                ordenarPorNombre,
                ordenarPorCantidad,
                seActualiza,
                setSeActualiza,
                syncHelados,
            }}>
            {children}
        </HeladosContext.Provider>
    );
};
