const API_URL = "https://backend-de-prueba-delta.vercel.app/api/public";

export const getProductosPublicos = async () => {
  const response = await fetch(`${API_URL}/productos`);

  if (!response.ok) {
    throw new Error("Error cargando productos públicos");
  }

  return response.json();
};
