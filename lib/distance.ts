export type Coordinates = {
  latitude: number;
  longitude: number;
};

type CoordinateInput =
  | Coordinates
  | {
      latitude?: number | string;
      longitude?: number | string;
      lat?: number | string;
      lng?: number | string;
      lon?: number | string;
    }
  | null
  | undefined;

const EARTH_RADIUS_KM = 6371;

function readCoordinateNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return Number.NaN;
}

export function normalizeCoordinates(coordinates?: CoordinateInput): Coordinates | undefined {
  if (!coordinates) return undefined;

  const record = coordinates as Record<string, unknown>;
  const latitude = readCoordinateNumber(record.latitude ?? record.lat);
  const longitude = readCoordinateNumber(record.longitude ?? record.lng ?? record.lon);

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  ) {
    return { latitude, longitude };
  }

  return undefined;
}

export function hasValidCoordinates(coordinates?: CoordinateInput): coordinates is Coordinates {
  return normalizeCoordinates(coordinates) !== undefined;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculateDistanceKm(origin?: CoordinateInput, destination?: CoordinateInput): number | undefined;
export function calculateDistanceKm(
  originLatitude?: number,
  originLongitude?: number,
  destinationLatitude?: number,
  destinationLongitude?: number
): number | undefined;
export function calculateDistanceKm(
  originOrLatitude?: CoordinateInput | number,
  destinationOrLongitude?: CoordinateInput | number,
  destinationLatitude?: number,
  destinationLongitude?: number
) {
  const usesNumericArguments =
    typeof originOrLatitude === "number" ||
    typeof destinationOrLongitude === "number" ||
    typeof destinationLatitude === "number" ||
    typeof destinationLongitude === "number";
  const origin = usesNumericArguments
    ? normalizeCoordinates({
        latitude: originOrLatitude as number | undefined,
        longitude: destinationOrLongitude as number | undefined,
      })
    : normalizeCoordinates(originOrLatitude);
  const destination = usesNumericArguments
    ? normalizeCoordinates({ latitude: destinationLatitude, longitude: destinationLongitude })
    : normalizeCoordinates(destinationOrLongitude);

  if (!origin || !destination) return undefined;

  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitudeRadians = toRadians(destination.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitudeRadians) * Math.sin(longitudeDelta / 2) ** 2;
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
