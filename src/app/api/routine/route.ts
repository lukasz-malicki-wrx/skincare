import { aiErrorResponse, errorResponse, readAiRequest } from "@/lib/ai/http";
import { buildRoutine, isRoutineAssessment, type RoutineRequest } from "@/lib/ai/routine";

export const maxDuration = 60;

export async function POST(req: Request) {
  const request = await readAiRequest<RoutineRequest>(req);
  if (request instanceof Response) return request;
  const { body, locale, t } = request;

  const { assessment, profile } = body;
  if (!isRoutineAssessment(assessment)) return errorResponse(t.invalidBody, 400);

  try {
    const outcome = await buildRoutine(assessment, profile, locale);
    if (outcome.status === "refused") return errorResponse(t.refused, 422);
    if (outcome.status === "empty") return errorResponse(t.parseFailed, 502);
    return Response.json(outcome.data);
  } catch (err) {
    return aiErrorResponse(err, t);
  }
}
