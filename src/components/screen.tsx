export function Screen({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h1 className="heading-md">{title}</h1>
      <p className="body-md text-ink/70">{text}</p>
    </section>
  );
}
