export type Coordinates = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_KM = 6371;

export function hasValidCoordinates(coordinates?: Coordinates | null): coordinates is Coordinates {
  return Boolean(
    coordinates &&
      Number.isFinite(coordinates.latitude) &&
      Number.isFinite(coordinates.longitude) &&
      Math.abs(coordinates.latitude) <= 90 &&
      Math.abs(coordinates.longitude) <= 180
  );
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculateDistanceKm(origin?: Coordinates | null, destination?: Coordinates | null) {
  if (!hasValidCoordinates(origin) || !hasValidCoordinates(destination)) return undefined;

  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function formatDistanceKm(distanceKm?: number) {
  if (!Number.isFinite(distanceKm)) return "";
  return `${Math.max(distanceKm, 0).toFixed(1)} km`;
}

export function parseDistanceKm(distance?: string) {
  if (!distance) return undefined;

  const normalized = distance.trim().toLowerCase().replace(",", ".");
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value)) return undefined;

  if (normalized.includes(" m") && !normalized.includes("km")) return value / 1000;
  if (normalized.includes("km")) return value;

  return undefined;
}
