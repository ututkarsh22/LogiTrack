export const getCoordinates = async (address) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`,{
        
        headers: {
        "User-Agent": "delivery-app"
      }
    }
  );

  const text = await response.text();

  try {
    const data = JSON.parse(text);

    if (!data.length) {
      throw new Error("Location not found");
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

  } catch (err) {
    console.log("Geocoding API response:", text);
    throw new Error("Invalid response from geocoding API");
  }
};