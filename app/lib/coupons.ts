import { getJsonFromR2, putJsonToR2, deleteFromR2, listR2Keys } from "./r2";

const PREFIX = "json/coupons/";

export type Coupon = {
  code: string;
  type: "percent" | "fixed";
  discount: number;
  maxUses: number | null;
  uses: number;
  active: boolean;
  createdAt: number;
};

export async function saveCoupon(coupon: Coupon): Promise<void> {
  await putJsonToR2(`${PREFIX}${coupon.code.toUpperCase()}.json`, coupon);
}

export async function getCoupon(code: string): Promise<Coupon | null> {
  return getJsonFromR2<Coupon>(`${PREFIX}${code.toUpperCase()}.json`);
}

export async function listCoupons(): Promise<Coupon[]> {
  const keys = await listR2Keys(PREFIX);
  const results = await Promise.all(keys.map(key => getJsonFromR2<Coupon>(key)));
  return results.filter((c): c is Coupon => c !== null);
}

export async function deleteCoupon(code: string): Promise<void> {
  await deleteFromR2(`${PREFIX}${code.toUpperCase()}.json`);
}

export async function applyCoupon(code: string, amount: number): Promise<{ valid: boolean; newAmount: number; message?: string }> {
  const coupon = await getCoupon(code);
  if (!coupon) return { valid: false, newAmount: amount, message: "Cupom não encontrado." };
  if (!coupon.active) return { valid: false, newAmount: amount, message: "Cupom inativo." };
  if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses)
    return { valid: false, newAmount: amount, message: "Cupom esgotado." };

  const discount = coupon.type === "percent"
    ? amount * (coupon.discount / 100)
    : coupon.discount;

  const newAmount = Math.max(0, parseFloat((amount - discount).toFixed(2)));
  return { valid: true, newAmount };
}

export async function incrementCouponUse(code: string): Promise<void> {
  const coupon = await getCoupon(code);
  if (coupon) await saveCoupon({ ...coupon, uses: coupon.uses + 1 });
}
