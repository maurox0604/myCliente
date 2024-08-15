import React, { useState, useEffect } from 'react';
import ListaHelados from './ListaHelados';
import Calculadora from './Calculadora';

export default function GetListHelados() {
    const [helados, setHelados] = useState([]);

    useEffect(() => {
        fetchHelados();
    }, []);

    async function fetchHelados() {
        const response = await fetch('https://backend-de-prueba-delta.vercel.app/helados');
        const data = await response.json();
        setHelados(data);
    }

    function updateHelado(id, cantidadComprada) {
        setHelados(prevHelados => 
        prevHelados.map(helado => 
            helado.id === id 
            ? { ...helado, cantidad: helado.cantidad - cantidadComprada } 
            : helado
        )
        );
    }

    return (
        <View style={{ flex: 1 }}>
        <ListaHelados helados={helados} />
        <Calculadora helados={helados} updateHelado={updateHelado} />
        </View>
    );
}
