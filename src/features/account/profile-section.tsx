import { Heading } from "@/components/heading";



export function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level={2} variant="title-md">{title}</Heading>
      {children}
    </section>
  );
}
