import type { Metadata } from "next";
import { AdminOrders } from "@/components/admin/admin-orders";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <>
      <h1 className="mb-8 text-4xl">Orders</h1>
      <AdminOrders />
    </>
  );
}
