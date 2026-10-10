import type { Metadata } from "next";
import { CartPageContent } from "@/components/commerce/cart-page-content";
import { Container } from "@/components/content/section";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <Container className="max-w-4xl pt-10 pb-16 sm:pt-14">
      <h1 className="mb-8 text-4xl sm:text-5xl">Your bag</h1>
      <CartPageContent />
    </Container>
  );
}
