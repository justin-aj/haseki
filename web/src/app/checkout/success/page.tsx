import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/commerce/order-confirmation";
import { Container } from "@/components/content/section";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default function SuccessPage() {
  return (
    <Container className="max-w-2xl py-16 sm:py-24">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-muted" />}>
        <OrderConfirmation />
      </Suspense>
    </Container>
  );
}
