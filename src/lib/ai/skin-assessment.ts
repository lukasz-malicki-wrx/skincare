import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { modelLanguageInstruction } from "@/i18n/model-language";
import type { Locale } from "@/i18n/translations";
import {
  anthropic,
  ASSESSMENT_MODEL,
  largeModelOptions,
  outcomeOf,
  withParseRetry,
  type AiOutcome,
} from "@/lib/ai/client";
import { skinAssessmentSchema, type SkinAssessment } from "@/lib/skin-analysis";

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export function isMediaType(value: unknown): value is MediaType {
  return MEDIA_TYPES.includes(value as MediaType);
}

function systemPrompt(locale: Locale) {
  return `You are a cosmetologist's assistant in a skincare app. The user sends a photo of their face, neck or hands.

Rules:
- Describe how the skin looks: type, visible concerns and ingredients worth avoiding. Do not propose a routine; it is built in the next step from the profile the user confirms. Never give a medical diagnosis.
- If you see changes a dermatologist should assess (unusual moles, pus-filled lesions, widespread inflammation, ulcers), set see_a_doctor=true and briefly say why.
- If the photo is blurry, too dark, too far away or does not show skin, set photo_quality.ok=false and say what to fix. Do not guess results from a bad photo.
- Respect the user profile (allergies, ingredients to skip) when provided.
- ${modelLanguageInstruction(locale)}`;
}

export type SkinAssessmentInput = {
  imageBase64: string;
  mediaType: MediaType;
  profile?: unknown;
  locale: Locale;
};

/** Stage 1: what the skin in the photo looks like. */
export async function assessSkin({
  imageBase64,
  mediaType,
  profile,
  locale,
}: SkinAssessmentInput): Promise<AiOutcome<SkinAssessment>> {
  const options = largeModelOptions(ASSESSMENT_MODEL, "high");
  const profileText = profile ? `User profile: ${JSON.stringify(profile)}.` : "No user profile.";

  const res = await withParseRetry(() =>
    anthropic.beta.messages.parse({
      model: ASSESSMENT_MODEL,
      max_tokens: 8000,
      ...options.request,
      output_config: { ...options.output, format: betaZodOutputFormat(skinAssessmentSchema(locale)) },
      system: [{ type: "text", text: systemPrompt(locale), cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: `${profileText} Assess the skin in the photo. ${modelLanguageInstruction(locale)}` },
          ],
        },
      ],
    }),
  );

  return outcomeOf(res);
}
