const axios = require('axios');

// Calculate distance between two points using Haversine formula
exports.calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2[1] - point1[1]);
  const dLon = toRad(point2[0] - point1[0]);
  const lat1 = toRad(point1[1]);
  const lat2 = toRad(point2[1]);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Convert degrees to radians
const toRad = (value) => {
  return value * Math.PI / 180;
};

// Get address details from coordinates using Google Maps Geocoding API
exports.getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('Failed to get address from coordinates');
    }

    const result = response.data.results[0];
    const addressComponents = result.address_components;
    
    // Extract address components
    const street = getAddressComponent(addressComponents, 'route');
    const city = getAddressComponent(addressComponents, 'locality') || 
                getAddressComponent(addressComponents, 'administrative_area_level_2');
    const state = getAddressComponent(addressComponents, 'administrative_area_level_1');
    const country = getAddressComponent(addressComponents, 'country');

    return {
      address: result.formatted_address,
      street,
      city,
      state,
      country,
      coordinates: [longitude, latitude]
    };
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    throw new Error('Failed to get address from coordinates');
  }
};

// Get coordinates from address using Google Maps Geocoding API
exports.getCoordinatesFromAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('Failed to get coordinates from address');
    }

    const result = response.data.results[0];
    const location = result.geometry.location;

    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address
    };
  } catch (error) {
    console.error('Error getting coordinates from address:', error);
    throw new Error('Failed to get coordinates from address');
  }
};

// Helper function to get specific address component
const getAddressComponent = (components, type) => {
  const component = components.find(comp => comp.types.includes(type));
  return component ? component.long_name : '';
};

// Calculate estimated time of arrival
exports.calculateETA = (distance, averageSpeed = 30) => {
  const timeInHours = distance / averageSpeed;
  return Math.ceil(timeInHours * 60); // Convert to minutes
};

// Check if a point is within a certain radius of another point
exports.isWithinRadius = (point1, point2, radius) => {
  const distance = exports.calculateDistance(point1, point2);
  return distance <= radius;
}; 