"use client";

import { useEffect } from "react";
import { Button } from "@/components/button";
import { MessageScreen } from "@/components/message-screen";
import "./globals.css";

/**
 * Last-resort boundary when the root layout itself fails. It replaces the whole document, so it
 * has no locale or providers: the copy is plain English and the styles come from globals.css.
 */
export default function GlobalError({ error, retry }: Readonly<{ error: Error & { digest?: string }; retry: () => void }>) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">
        <title>Something went wrong</title>
        <main>
          <MessageScreen
            alert
            fullPage
            title="Something went wrong"
            body="The app could not load. Your data is safe on this device."
            actions={
              <Button onClick={retry} size="lg">
                Try again
              </Button>
            }
          />
        </main>
      </body>
    </html>
  );
}
