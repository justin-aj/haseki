import type { Metadata } from "next";
import { AdminProducts } from "@/components/admin/admin-products";

export const metadata: Metadata = { title: "Products & stock" };

export default function AdminProductsPage() {
  return (
    <>
      <h1 className="mb-2 text-4xl">Products & stock</h1>
      <p className="mb-8 text-muted-foreground">Edit stock per size, market prices and visibility. Changes go live on the storefront within seconds.</p>
      <AdminProducts />
    </>
  );
}
