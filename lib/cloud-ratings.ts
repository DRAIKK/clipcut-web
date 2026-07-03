export const CREATE_RATING_URL = process.env.NEXT_PUBLIC_CREATE_RATING_URL;

export type CreateRatingPayload = {
  barberId: string;
  clientId: string;
  rating: number;
};

export type CreateRatingResponse = {
  ratingAvg: number;
  ratingCount: number;
};

function assertRating(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("La calificación debe ser un número entero entre 1 y 5.");
  }
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return undefined;
}

function getErrorMessage(body: unknown) {
  if (typeof body === "string") return body;
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const message = record.message ?? record.error ?? record.detail;
    if (typeof message === "string") return message;
  }

  return "";
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json() as Promise<unknown>;
  return response.text();
}

export async function createRatingFromWeb(payload: CreateRatingPayload): Promise<CreateRatingResponse> {
  const createRatingUrl = process.env.NEXT_PUBLIC_CREATE_RATING_URL;

  if (!createRatingUrl) {
    throw new Error("No está configurado NEXT_PUBLIC_CREATE_RATING_URL para enviar calificaciones.");
  }

  assertRating(payload.rating);

  const response = await fetch(createRatingUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(body);
    throw new Error(message || "No se pudo enviar la calificación. Probá nuevamente.");
  }

  if (!body || typeof body !== "object") {
    throw new Error("El backend no devolvió los datos actualizados de la calificación.");
  }

  const data = body as Record<string, unknown>;
  const ratingAvg = readNumber(data.ratingAvg ?? data.ratingAverage ?? data.rating);
  const ratingCount = readNumber(data.ratingCount ?? data.reviewsCount ?? data.reviewCount);

  if (ratingAvg === undefined || ratingCount === undefined) {
    throw new Error("El backend no devolvió ratingAvg y ratingCount actualizados.");
  }

  return { ratingAvg, ratingCount };
}
