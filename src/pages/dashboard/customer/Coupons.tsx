import { CouponCard } from "@/components/ui/coupon-card";
import { Badge } from "@/components/ui/badge";

const MOCK_COUPONS = [
  {
    id: "c-1",
    code: "FIRSTFIX100",
    title: "Flat ₹100 Off On First Booking",
    description: "Applicable on any home service category with minimum booking amount of ₹299.",
    discountAmount: 100,
    minOrderAmount: 299,
    expiresAt: "2026-12-31",
  },
  {
    id: "c-2",
    code: "HOMEEFIX20",
    title: "20% Off AC Deep Cleaning & Servicing",
    description: "Get 20% discount up to ₹300 on Split & Window AC foam servicing.",
    discountPercentage: 20,
    minOrderAmount: 499,
    expiresAt: "2026-08-31",
  },
  {
    id: "c-3",
    code: "VIPPASS",
    title: "Exclusive ₹150 Off for VIP Pass Members",
    description: "Special voucher valid across all plumbing and electrical services.",
    discountAmount: 150,
    minOrderAmount: 399,
    expiresAt: "2026-10-15",
  },
];

export default function Coupons() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Coupons & Vouchers</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Apply these promotional promo codes at checkout for instant discounts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_COUPONS.map((coupon) => (
          <CouponCard
            key={coupon.id}
            code={coupon.code}
            title={coupon.title}
            description={coupon.description}
            discountAmount={coupon.discountAmount}
            discountPercentage={coupon.discountPercentage}
            minOrderAmount={coupon.minOrderAmount}
            expiresAt={coupon.expiresAt}
            onApply={(code) => alert(`Copied promo code ${code}!`)}
          />
        ))}
      </div>
    </div>
  );
}
