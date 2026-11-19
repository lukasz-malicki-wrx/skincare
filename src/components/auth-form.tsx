"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { AuthFormState } from "@/app/actions/auth";

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
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ""])),
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      {fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1 text-sm">
          {field.label}
          <input
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            value={values[field.name] ?? ""}
            required
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [field.name]: event.target.value,
              }))
            }
            className="rounded-xl border border-line bg-white px-3 py-3 text-base text-ink"
          />
        </label>
      ))}
      {state?.error ? (
        <p className="text-sm text-red-800">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-paper disabled:opacity-60"
      >
        {submitLabel}
      </button>
      <Link href={alternate.href} className="text-center text-sm text-accent">
        {alternate.label}
      </Link>
    </form>
  );
}
