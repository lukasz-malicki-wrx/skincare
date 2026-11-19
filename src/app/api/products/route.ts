import { fill } from "@/i18n/format";
import { aiErrorResponse, errorResponse, readAiRequest } from "@/lib/ai/http";
import { findRoutineProducts, isStepRef } from "@/lib/ai/product-search";
import { MAX_STEPS, type RoutineProductsRequest, type RoutineProductsResponse } from "@/lib/products";

export const maxDuration = 60;

export async function POST(req: Request) {
  const request = await readAiRequest<Partial<RoutineProductsRequest>>(req);
  if (request instanceof Response) return request;
  const { body, locale, t } = request;

  const steps = body.steps?.filter(isStepRef) ?? [];
  if (steps.length === 0 || steps.length > MAX_STEPS) {
    return errorResponse(fill(t.stepsRequired, { max: MAX_STEPS }), 400);
  }

  try {
    const products = await findRoutineProducts(steps, body, locale);
    return Response.json({ products } satisfies RoutineProductsResponse);
  } catch (err) {
    return aiErrorResponse(err, t);
  }
}
