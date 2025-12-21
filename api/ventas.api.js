




export const cargarVentas = async (startDate = null, endDate = null) => {
    console.log("Cargar VENTAS ☻☻")
    try {
        // Convertir las fechas a formato `YYYY-MM-DD`
        const start = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
        const end = endDate ? new Date(endDate).toISOString().split('T')[0] : null;

        let url = `https://backend-de-prueba-delta.vercel.app/ventas`;
        // let url = `http://localhost:3001/ventas`;
        console.log("Fecha ini y fin: ", start, end)

        if (start && end) {
            url += `?startDate=${start}&endDate=${end}`;
        }

        console.log("startDate:", start, "endDate:", end);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos de ventas obtenidos:", data);

        if (!data || data.length === 0) {
            throw new Error("No se encontraron datos de ventas");
        }

        return data;
    } catch (error) {
        console.error("Error cargando ventas:", error);
        throw error;
    }
};

