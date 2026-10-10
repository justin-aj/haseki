import Link from "next/link";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-10", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-xs tracking-[0.18em] text-muted-foreground uppercase", className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
  className,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-6 lg:mb-10", className)}>
      <div>
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h2 className="text-3xl leading-tight text-balance sm:text-4xl lg:text-5xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 border-b border-foreground/40 pb-0.5 text-xs tracking-[0.14em] uppercase hover:border-gold hover:text-gold"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <Container className="pt-12 pb-10 sm:pt-16 lg:pt-24 lg:pb-14">
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h1 className="max-w-4xl text-4xl leading-[1.05] text-balance sm:text-5xl lg:text-7xl">{title}</h1>
      {intro && <p className="mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">{intro}</p>}
    </Container>
  );
}
