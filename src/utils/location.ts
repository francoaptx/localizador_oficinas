export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

export const getCurrentLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada por este navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Error desconocido';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  });
};

export const getDirectionsUrl = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  officeName: string
): string => {
  // URL para Google Maps
  return `https://www.google.com/maps/dir/${fromLat},${fromLon}/${toLat},${toLon}/@${toLat},${toLon},15z/data=!3m1!4b1!4m2!4m1!3e0`;
};

export const shareOfficeLocation = async (
  officeName: string,
  address: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  const shareData = {
    title: `Oficina: ${officeName}`,
    text: `${officeName} - ${address}`,
    url: `https://www.google.com/maps?q=${latitude},${longitude}`
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      // Fallback a copiar al portapapeles
      await navigator.clipboard.writeText(
        `${officeName}\n${address}\nhttps://www.google.com/maps?q=${latitude},${longitude}`
      );
    }
  } else {
    // Fallback a copiar al portapapeles
    await navigator.clipboard.writeText(
      `${officeName}\n${address}\nhttps://www.google.com/maps?q=${latitude},${longitude}`
    );
  }
};