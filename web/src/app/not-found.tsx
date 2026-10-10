import Link from "next/link";
import { Container } from "@/components/content/section";

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">This page wandered off.</h1>
      <p className="mt-4 text-muted-foreground">It may have sold out, or moved.</p>
      <Link
        href="/shop"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm text-primary-foreground"
      >
        Back to the shop
      </Link>
    </Container>
  );
}
