import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Container } from "@/components/content/section";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Container className="pt-8 pb-16 sm:pt-12">
      {/* The shell reads the URL and session on the client; the static shell is just this fallback. */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-sm bg-muted" />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </Container>
  );
}
