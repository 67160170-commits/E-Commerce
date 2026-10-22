"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { clearCart, getCart } from "@/lib/cart";
import { createOrder, type PaymentMethod } from "@/lib/orders";
import { createAddress, getUserAddresses } from "@/lib/addresses";

export type OrderActionState = {
  error?: string;
};

export async function placeOrderAction(
  prevState: OrderActionState | null,
  formData: FormData
): Promise<OrderActionState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const paymentMethod = (formData.get("payment_method") as PaymentMethod) || "cod";
  if (!["cod", "bank_transfer"].includes(paymentMethod)) return { error: "วิธีชำระเงินไม่ถูกต้อง" };
  const addressOption = (formData.get("address_option") as string) || "saved";
  let shippingAddressText = "";

  if (addressOption === "saved") {
    const addressId = Number(formData.get("saved_address_id"));
    const addresses = getUserAddresses(user.id);
    const chosen = addresses.find((a) => a.id === addressId);
    if (!chosen) {
      return { error: "กรุณาเลือกที่อยู่จัดส่ง หรือเพิ่มที่อยู่ใหม่" };
    }
    shippingAddressText = `${chosen.recipient_name} (${chosen.phone}) ${chosen.address_line}`;
  } else {
    const recipientName = ((formData.get("recipient_name") as string) || "").trim();
    const phone = ((formData.get("phone") as string) || "").trim();
    const addressLine = ((formData.get("address_line") as string) || "").trim();
    const saveNewAddress = formData.get("save_address") === "on";

    if (!recipientName || !phone || !addressLine) {
      return { error: "กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน" };
    }

    shippingAddressText = `${recipientName} (${phone}) ${addressLine}`;

    if (saveNewAddress) {
      createAddress(user.id, recipientName, phone, addressLine, false);
    }
  }

  const cartItems = await getCart();
  if (cartItems.length === 0) {
    return { error: "ไม่มีสินค้าในตะกร้า" };
  }

  let newOrderId: number;
  try {
    newOrderId = createOrder({
      userId: user.id,
      shippingAddress: shippingAddressText,
      paymentMethod,
      items: cartItems,
    });
    await clearCart();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/orders/${newOrderId}`);
}
