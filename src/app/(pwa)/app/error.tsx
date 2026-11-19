"use client";

import { ErrorScreen } from "@/components/error-screen";

export default function SegmentError(props: Readonly<{ error: Error & { digest?: string }; retry: () => void }>) {
  return <ErrorScreen {...props} />;
}
