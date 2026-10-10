import type { Metadata } from "next";
import { AdminOrderDetail } from "@/components/admin/admin-order-detail";

export const metadata: Metadata = { title: "Order" };

// The order id is read on the client (useParams), so this page prerenders as a shell.
export default function AdminOrderPage() {
  return <AdminOrderDetail />;
}
