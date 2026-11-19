import { Eyebrow } from "@/components/brand";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex max-w-2xl flex-col gap-2">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="text-4xl leading-tight font-bold text-balance text-pink sm:text-5xl">{title}</h1>
      {children && <p className="text-base text-pretty text-muted-foreground sm:text-lg">{children}</p>}
    </header>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:py-12">{children}</div>;
}
