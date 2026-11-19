"use client";

import { useActionState, useId, useState } from "react";
import type { AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Text } from "@/components/text";
import { TextLink } from "@/components/text-link";

type Field = {
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  defaultValue?: string;
};

export function AuthForm({
  action,
  submitLabel,
  fields,
  alternate,
}: {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  fields: Field[];
  alternate: { href: string; label: string };
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const errorId = useId();
  // Controlled on purpose: React resets a form after its action runs, and a failed sign-in
  // should keep what the user typed.
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ""])),
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      {fields.map((field) => (
        <Text as="label" key={field.name} variant="body-sm" className="flex flex-col gap-1">
          {field.label}
          <Input
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            value={values[field.name] ?? ""}
            required
            aria-invalid={state?.error ? true : undefined}
            aria-describedby={state?.error ? errorId : undefined}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [field.name]: event.target.value,
              }))
            }
          />
        </Text>
      ))}
      {state?.error ? (
        <Text id={errorId} role="alert" variant="body-sm" tone="danger">
          {state.error}
        </Text>
      ) : null}
      <Button type="submit" disabled={pending} aria-busy={pending} variant="accent">
        {submitLabel}
      </Button>
      <Text variant="body-sm" className="text-center">
        <TextLink href={alternate.href} variant="standalone">
          {alternate.label}
        </TextLink>
      </Text>
    </form>
  );
}
