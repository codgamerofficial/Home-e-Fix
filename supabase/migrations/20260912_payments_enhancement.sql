-- ==============================================================================
-- Home-e-Fix Payment Gateway Schema Enhancement
-- Adds Razorpay signature verification and audit columns to payments table
-- ==============================================================================

-- 1. Ensure columns exist on payments table
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS gateway_signature TEXT;
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'BOOKING';
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.payments ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMPTZ;

-- 2. Create index on gateway_order_id for ultra-fast webhook and verify lookups
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON public.payments(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_payment_id ON public.payments(gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);

-- 3. Add VIP pass columns to profiles if not present
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMPTZ;

-- 4. Enable RLS on payments table if not already enabled
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Policies: Customers can view their own payments, service role has full access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view their own payments'
  ) THEN
    CREATE POLICY "Users can view their own payments" 
      ON public.payments FOR SELECT 
      USING (auth.uid() = customer_id);
  END IF;
END $$;
