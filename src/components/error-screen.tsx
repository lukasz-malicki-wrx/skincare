"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/button";
import { MessageScreen } from "@/components/message-screen";
import { routes } from "@/config/routes";
import { useMessages } from "@/i18n/locale-provider";

/**
 * Fallback for the app's error boundaries (`error.tsx`). The error goes to `reportError`, which
 * reaches the browser console and any `error` listener a monitoring script installs.
 */
export function ErrorScreen({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const copy = useMessages().errorPage;

  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <MessageScreen
      alert
      title={copy.title}
      body={copy.body}
      actions={
        <>
          <Button onClick={retry} size="lg">
            {copy.retry}
          </Button>
          <ButtonLink href={routes.app.today} variant="outline">
            {copy.home}
          </ButtonLink>
        </>
      }
    />
  );
}
