"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createAddress, deleteAddress, setDefaultAddress } from "@/lib/addresses";

export type AddressActionState = {
  error?: string;
  success?: boolean;
};

export async function addAddressAction(
  prevState: AddressActionState | null,
  formData: FormData
): Promise<AddressActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบก่อน" };

  const recipientName = ((formData.get("recipient_name") as string) || "").trim();
  const phone = ((formData.get("phone") as string) || "").trim();
  const addressLine = ((formData.get("address_line") as string) || "").trim();
  const isDefault = formData.get("is_default") === "on";

  if (!recipientName || !phone || !addressLine) {
    return { error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" };
  }

  try {
    createAddress(user.id, recipientName, phone, addressLine, isDefault);
    revalidatePath("/profile");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "ไม่สามารถบันทึกที่อยู่ได้",
    };
  }
}

export async function deleteAddressAction(addressId: number) {
  const user = await getCurrentUser();
  if (!user) return;

  deleteAddress(addressId, user.id);
  revalidatePath("/profile");
  revalidatePath("/checkout");
}

export async function setDefaultAddressAction(addressId: number) {
  const user = await getCurrentUser();
  if (!user) return;

  setDefaultAddress(addressId, user.id);
  revalidatePath("/profile");
  revalidatePath("/checkout");
}
