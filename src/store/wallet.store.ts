import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { formatCurrency } from "@/lib/utils";

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  title: string;
  date: string;
  status: "success" | "pending" | "failed";
  paymentId?: string;
}

interface WalletStore {
  balance: number;
  transactions: WalletTransaction[];
  addFunds: (amount: number, method?: string, paymentId?: string) => void;
  deductFunds: (amount: number, title: string) => boolean;
}

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx-1",
    type: "credit",
    amount: 100,
    title: "On-Time Guarantee Credit",
    date: "Aug 02, 2026",
    status: "success",
  },
  {
    id: "tx-2",
    type: "debit",
    amount: 150,
    title: "Paid for Switch Installation (HEF-659103)",
    date: "Jul 28, 2026",
    status: "success",
  },
  {
    id: "tx-3",
    type: "credit",
    amount: 550,
    title: "Added Money via Razorpay UPI",
    date: "Jul 20, 2026",
    status: "success",
    paymentId: "pay_rzp_984120",
  },
];

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      balance: 500,
      transactions: INITIAL_TRANSACTIONS,

      addFunds: (amount: number, method = "Razorpay UPI", paymentId) => {
        const dateStr = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });

        const newTx: WalletTransaction = {
          id: `tx-${Date.now()}`,
          type: "credit",
          amount,
          title: `Added Money via ${method}`,
          date: dateStr,
          status: "success",
          paymentId: paymentId || `pay_rzp_${Math.floor(100000 + Math.random() * 900000)}`,
        };

        set((state) => ({
          balance: state.balance + amount,
          transactions: [newTx, ...state.transactions],
        }));
      },

      deductFunds: (amount: number, title: string) => {
        const { balance } = get();
        if (balance < amount) return false;

        const dateStr = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });

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
