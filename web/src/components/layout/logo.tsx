import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Haseki home"
      className={cn("font-heading text-[1.35rem] leading-none tracking-[0.32em] uppercase", className)}
    >
      Haseki
    </Link>
  );
}
