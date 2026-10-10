import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPanel } from "@/components/account/account-panel";
import { Container } from "@/components/content/section";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default function AccountPage() {
  return (
    <Container className="max-w-3xl pt-12 pb-16 sm:pt-16">
      <h1 className="mb-10 text-4xl sm:text-5xl">Your account</h1>
      <Suspense fallback={<div className="h-72 animate-pulse rounded-sm bg-muted" />}>
        <AccountPanel />
      </Suspense>
    </Container>
  );
}
