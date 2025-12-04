// api/reportes.api.js
export const getTopSaboresRequest = async (query = "") => {
    const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/reportes/top-sabores${query}`
    );

    const json = await response.json();
    return json.data || [];
};
