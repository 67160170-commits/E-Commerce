import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getCurrentUser } from "@/lib/auth";
import { getPopulatedCart } from "@/lib/cart";
import { getUserAddresses } from "@/lib/addresses";
import { cartIssue } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ยืนยันการสั่งซื้อและชำระเงิน",
  description: "กรอกข้อมูลจัดส่งและยืนยันคำสั่งซื้อ My YaDom",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const { items, total } = await getPopulatedCart();
  if (items.length === 0) {
    redirect("/cart");
  }
  if (items.some(item => cartIssue(item.product, item.quantity))) redirect("/cart");

  const savedAddresses = getUserAddresses(user.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="border-b border-line pb-4 mb-6">
        <h1 className="text-2xl font-bold text-ink">ชำระเงินและยืนยันการสั่งซื้อ</h1>
        <p className="mt-1 text-sm text-ink-soft">
          สั่งซื้อในนาม: <span className="font-semibold text-ink">{user.name}</span> ({user.email})
        </p>
      </div>

      <CheckoutForm
        cartItems={items}
        cartTotal={total}
        savedAddresses={savedAddresses}
        userName={user.name}
      />
    </main>
  );
}
