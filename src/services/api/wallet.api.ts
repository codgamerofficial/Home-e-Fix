import { supabase } from "@/lib/supabase";
import { assertServiceConfigured } from "@/lib/integrations/status";
import { DatabaseError } from "@/lib/errors/AppError";
import { logger } from "@/lib/observability/logger";
import type { DbWalletTransaction } from "@/types/database.types";

/**
 * Authoritative Supabase API for Wallet & Transactions.
 * Derived strictly from PostgreSQL transaction ledgers. Never returns hardcoded balances.
 */
export const walletApi = {
  /**
   * Get user wallet balance from database.
   */
  async getWalletBalance(userId: string): Promise<number> {
    assertServiceConfigured("supabase");

    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.error("Failed to query wallet balance", error, { userId });
      throw new DatabaseError(`Could not retrieve wallet balance: ${error.message}`, error);
    }

    return data?.balance ?? 0;
  },

  /**
   * Record wallet transaction and update ledger.
   */
  async addMoney(userId: string, amount: number, referenceId?: string): Promise<DbWalletTransaction> {
    assertServiceConfigured("supabase");

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      throw new DatabaseError("Wallet record not found for user.", walletError);
    }

    const newBalance = (wallet.balance || 0) + amount;

    const { data, error } = await supabase
      .from("wallet_transactions")
      .insert([
        {
          wallet_id: wallet.id,
          type: "CREDIT",
          amount,
          balance_after: newBalance,
          title: "Added Money to Wallet",
          reference_id: referenceId || null,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("Failed to write wallet transaction to database", error, { userId, amount });
      throw new DatabaseError(`Failed to credit wallet: ${error.message}`, error);
    }

    // Update wallet balance
    await supabase.from("wallets").update({ balance: newBalance }).eq("id", wallet.id);

    return data as unknown as DbWalletTransaction;
  },

  /**
   * Get transaction history for user's wallet.
   */
  async getTransactions(walletId: string): Promise<DbWalletTransaction[]> {
    assertServiceConfigured("supabase");

    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", walletId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch wallet transactions", error, { walletId });
      throw new DatabaseError(`Could not retrieve transactions: ${error.message}`, error);
    }

    return (data as unknown as DbWalletTransaction[]) || [];
  },
};
