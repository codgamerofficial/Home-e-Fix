import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { formatDate, nowIso } from "@/lib/date";
import { generateReference } from "@/services/db/repository";

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  title: string;
  date: string;
  status: "success" | "pending" | "failed";
  paymentId?: string;
  isDevSeed?: boolean;
}

interface WalletStore {
  balance: number;
  transactions: WalletTransaction[];
  addFunds: (amount: number, method?: string, paymentId?: string) => void;
  deductFunds: (amount: number, title: string) => boolean;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],

      addFunds: (amount: number, method = "Razorpay UPI", paymentId) => {
        const dateStr = formatDate(nowIso());

        const newTx: WalletTransaction = {
          id: `tx-${Date.now()}`,
          type: "credit",
          amount,
          title: `Added Money via ${method}`,
          date: dateStr,
          status: "success",
          paymentId: paymentId || generateReference("PAY"),
          isDevSeed: false,
        };

        set((state) => ({
          balance: state.balance + amount,
          transactions: [newTx, ...state.transactions],
        }));
      },

      deductFunds: (amount: number, title: string) => {
        const { balance } = get();
        if (balance < amount) return false;

        const dateStr = formatDate(nowIso());

        const newTx: WalletTransaction = {
          id: `tx-${Date.now()}`,
          type: "debit",
          amount,
          title,
          date: dateStr,
          status: "success",
        };

        set((state) => ({
          balance: state.balance - amount,
          transactions: [newTx, ...state.transactions],
        }));

        return true;
      },
    }),
    {
      name: "homeefix-wallet-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
