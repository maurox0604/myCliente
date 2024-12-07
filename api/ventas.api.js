




export const cargarVentas = async () => {
    try {
        const response = await fetch(`https://backend-de-prueba-delta.vercel.app/ventas`, {
        // const response = await fetch(`http://localhost:3001/ventas`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Asegúrate de que la respuesta sea válida y tenga un formato JSON
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos de ventas obtenidos:", data);

        // Aquí verifica que data no esté undefined o vacío antes de acceder
        if (!data || data.length === 0) {
            throw new Error("No se encontraron datos de ventas");
        }

        return data;  // Asegúrate de retornar los datos
    } catch (error) {
        console.error("Error cargando ventas:", error);
        throw error;  // Lanza el error para que pueda ser capturado donde se llame la función
    }
};

