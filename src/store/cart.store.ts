import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  discountedPrice?: number;
  duration?: number;
  thumbnail?: string;
  quantity: number;
  category?: { slug: string; name: string };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [
        {
          id: "pop-ac-clean",
          name: "Split AC Foam Deep Jet Servicing",
          slug: "split-ac-foam-servicing",
          basePrice: 699,
          discountedPrice: 499,
          duration: 45,
          thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80",
          quantity: 1,
          category: { slug: "ac", name: "AC Repair & Service" },
        },
      ],
      addItem: (service: any) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === service.id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += 1;
          set({ items: updated });
        } else {
          set({
            items: [
              ...currentItems,
              {
                id: service.id,
                name: service.name,
                slug: service.slug,
                basePrice: service.basePrice || 499,
                discountedPrice: service.discountedPrice || service.basePrice || 499,
                duration: service.duration || 45,
                thumbnail: service.thumbnail,
                quantity: 1,
                category: service.category,
              },
            ],
          });
        }
      },
      removeItem: (id: string) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      updateQuantity: (id: string, delta: number) => {
        const updated = get()
          .items.map((i) => {
            if (i.id === id) {
              const newQty = i.quantity + delta;
              return newQty > 0 ? { ...i, quantity: newQty } : null;
            }
            return i;
          })
          .filter(Boolean) as CartItem[];
        set({ items: updated });
      },
      clearCart: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.discountedPrice || i.basePrice) * i.quantity,
          0
        ),
    }),
    {
      name: "homeefix-cart-storage",
    }
  )
);
