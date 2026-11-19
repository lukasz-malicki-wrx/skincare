import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export function Screen({
  title,
  text,
}: Readonly<{
  title: string;
  text: string;
}>) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level={1} variant="heading-md">{title}</Heading>
      <Text tone="muted">{text}</Text>
    </section>
  );
}
