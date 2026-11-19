"use client";

import { ErrorScreen } from "@/components/error-screen";

/** Inside the tabs: this boundary sits below the shell layout, so the bottom navigation stays. */
export default function SegmentError(props: Readonly<{ error: Error & { digest?: string }; retry: () => void }>) {
  return <ErrorScreen {...props} />;
}
