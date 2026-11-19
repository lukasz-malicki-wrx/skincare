import { suggestDiet, toDietRequest } from "@/lib/ai/diet";
import { aiErrorResponse, errorResponse, readAiRequest } from "@/lib/ai/http";
import type { DietRequest } from "@/lib/diet";

export const maxDuration = 30;

export async function POST(req: Request) {
  const request = await readAiRequest<Partial<DietRequest>>(req);
  if (request instanceof Response) return request;
  const { body, locale, t } = request;

  try {
    const outcome = await suggestDiet(toDietRequest(body), locale);
    if (outcome.status !== "ok") return errorResponse(t.dietFailed, 502);
    return Response.json({ plan: outcome.data });
  } catch (err) {
    return aiErrorResponse(err, t);
  }
}
