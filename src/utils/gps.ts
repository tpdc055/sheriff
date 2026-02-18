export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const getCurrentPosition = (): Promise<GPSCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

export const formatCoordinates = (coords: GPSCoordinates): string => {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
};

export const getGoogleMapsLink = (coords: string): string => {
  return `https://www.google.com/maps?q=${coords}`;
};
