export function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

type CountForms = { one: string; few: string; many: string };

/** Cardinal plural for English (few and many can share a string) and Polish. */
export function countLabel(count: number, forms: CountForms): string {
  return fill(forms[pluralCategory(count)], { count });
}

function pluralCategory(count: number): keyof CountForms {
  const abs = Math.abs(count);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (abs === 1) return "one";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
  return "many";
}
