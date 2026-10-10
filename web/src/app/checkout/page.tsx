import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/commerce/checkout-form";
import { Container } from "@/components/content/section";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Container className="pt-10 pb-16 sm:pt-14">
      <h1 className="mb-10 text-4xl sm:text-5xl">Checkout</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-sm bg-muted" />}>
        <CheckoutForm />
      </Suspense>
    </Container>
  );
}
