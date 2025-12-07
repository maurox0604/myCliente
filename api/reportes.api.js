// api/reportes.api.js
export const getTopSaboresRequest = async (query = "") => {
  const url = `${process.env.EXPO_PUBLIC_API_URL || ""}/reportes/top-sabores${query}`;
  console.log("Fetching:", url);
  const response = await fetch(url);
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`HTTP ${response.status} - ${txt}`);
  }
  const json = await response.json();
  return json.data || [];
};
