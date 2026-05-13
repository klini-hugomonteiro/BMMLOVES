import fs from "fs";
import path from "path";

const COUPONS_DIR = path.join(process.cwd(), "data", "coupons");

export type Coupon = {
  code: string;
  type: "percent" | "fixed";
  discount: number;
  maxUses: number | null;
  uses: number;
  active: boolean;
  createdAt: number;
};

function ensureDir() {
  if (!fs.existsSync(COUPONS_DIR)) fs.mkdirSync(COUPONS_DIR, { recursive: true });
}

export function saveCoupon(coupon: Coupon): void {
  ensureDir();
  fs.writeFileSync(path.join(COUPONS_DIR, `${coupon.code.toUpperCase()}.json`), JSON.stringify(coupon));
}

export function getCoupon(code: string): Coupon | null {
  ensureDir();
  const filePath = path.join(COUPONS_DIR, `${code.toUpperCase()}.json`);
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return null; }
}

export function listCoupons(): Coupon[] {
  ensureDir();
  return fs.readdirSync(COUPONS_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(COUPONS_DIR, f), "utf-8")); } catch { return null; }
    })
    .filter(Boolean) as Coupon[];
}

export function deleteCoupon(code: string): void {
  const filePath = path.join(COUPONS_DIR, `${code.toUpperCase()}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function applyCoupon(code: string, amount: number): { valid: boolean; newAmount: number; message?: string } {
  const coupon = getCoupon(code);
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

export function incrementCouponUse(code: string): void {
  const coupon = getCoupon(code);
  if (coupon) saveCoupon({ ...coupon, uses: coupon.uses + 1 });
}
