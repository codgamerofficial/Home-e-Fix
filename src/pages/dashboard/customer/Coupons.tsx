import { useState } from "react";
import { CouponCard } from "@/components/ui/coupon-card";
import { Badge } from "@/components/ui/badge";
import { dbRepository } from "@/services/db/repository";

export default function Coupons() {
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);
  const coupons = dbRepository.getCoupons();

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedNotice(`✨ Promo code ${code} copied to clipboard! Paste it at checkout.`);
    setTimeout(() => setCopiedNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Coupons & Vouchers</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Apply these promotional promo codes at checkout for instant discounts
        </p>
      </div>

      {copiedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in">
          <span>{copiedNotice}</span>
          <button onClick={() => setCopiedNotice(null)} className="font-bold text-xs">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coupons.map((coupon) => (
          <CouponCard
            key={coupon.id}
            code={coupon.code}
            title={coupon.title}
            description={coupon.description}
            discountAmount={coupon.discountAmount}
            discountPercentage={coupon.discountPercentage}
            minOrderAmount={coupon.minOrderAmount}
            expiresAt={coupon.expiresAt}
            onApply={handleCopyCoupon}
          />
        ))}
      </div>
    </div>
  );
}
