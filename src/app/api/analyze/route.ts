import { aiErrorResponse, errorResponse, readAiRequest } from "@/lib/ai/http";
import { assessSkin, isMediaType } from "@/lib/ai/skin-assessment";

export const maxDuration = 60;

type AnalyzeBody = { imageBase64?: string; mediaType?: string; profile?: unknown; locale?: unknown };

export async function POST(req: Request) {
  const request = await readAiRequest<AnalyzeBody>(req);
  if (request instanceof Response) return request;
  const { body, locale, t } = request;

  const { imageBase64, mediaType, profile } = body;
  if (!imageBase64 || !isMediaType(mediaType)) return errorResponse(t.imageRequired, 400);

  try {
    const outcome = await assessSkin({ imageBase64, mediaType, profile, locale });
    if (outcome.status === "refused") {
      return Response.json({ error: t.refused, category: outcome.category }, { status: 422 });
    }
    if (outcome.status === "empty") return errorResponse(t.parseFailed, 502);
    return Response.json(outcome.data);
  } catch (err) {
    return aiErrorResponse(err, t);
  }
}
