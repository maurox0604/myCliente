export const getTopSaboresRequest = async () => {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reportes/top-sabores`);
    return await response.json();
};

