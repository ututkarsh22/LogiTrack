export const getCoordinates = async (address) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`,
    {
      method: 'GET',
      headers: {
        "User-Agent": "LogiTrack-App/1.0",
        "Accept": "application/json"
      }
    }
  );

  const text = await response.text();

  try {
    const data = JSON.parse(text);

    if (!data || !data.length) {
      throw new Error("Address not found on Maps. Please try a more specific address.");
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

  } catch (err) {
    if(err.message === "Address not found on Maps. Please try a more specific address.") {
        throw err;
    }
    console.log("Geocoding API response:", text);
    throw new Error("Invalid response from geocoding API");
  }
};