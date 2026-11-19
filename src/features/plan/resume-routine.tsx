"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/spinner";
import { routes } from "@/config/routes";
import { useMessages } from "@/i18n/locale-provider";
import { Text } from "@/components/text";

/** A confirmed photo whose routine is not built yet. The plan screen builds it. */
export function ResumeRoutine() {
  const router = useRouter();
  const copy = useMessages().result;

  useEffect(() => {
    router.replace(routes.app.onboarding.plan);
  }, [router]);

  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Spinner size="lg" />
      <Text tone="muted">{copy.buildingRoutine}</Text>
    </div>
  );
}
