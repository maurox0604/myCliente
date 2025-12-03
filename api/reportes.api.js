export const getTopSaboresRequest = async () => {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/reportes/top-sabores`);
    const json = await response.json();

    return json.data.map(item => ({
        sabor: item.sabor.trim(),
        total: Number(item.total)
    }));
};
