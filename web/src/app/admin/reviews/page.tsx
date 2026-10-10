import type { Metadata } from "next";
import { AdminReviews } from "@/components/admin/admin-reviews";

export const metadata: Metadata = { title: "Reviews" };

export default function AdminReviewsPage() {
  return (
    <>
      <h1 className="mb-8 text-4xl">Reviews</h1>
      <AdminReviews />
    </>
  );
}
