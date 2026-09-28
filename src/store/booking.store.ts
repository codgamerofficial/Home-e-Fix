import { create } from "zustand";
import { persist } from "zustand/middleware";
import { findCanonicalVariant } from "@/services/marketplace/canonicalService.service";

export interface BookingItemDraft {
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  categorySlug: string;
  variantId?: string;
  variantName?: string;
  variantDuration?: string;
  packageId?: string;
  packageName?: string;
  unitPrice: number;
  quantity: number;
  quantityUnit?: string;
  pricingType?: "fixed" | "starting_from" | "range" | "quote" | "inspection_required";
  materialsPolicy?: "included" | "extra" | "customer_provided" | "technician_supplied" | "inspection_required";
  warrantyDays?: number;
  duration?: number | string;
  subtotal: number;
  thumbnail?: string;
}

export interface BookingDraft {
  source: "single_service" | "cart";
  items: BookingItemDraft[];
  selectedAddressId?: string;
  selectedDate?: string;
  selectedSlotId?: string;
  isEmergencyRequested?: boolean;
  questionAnswers?: Record<string, string>;
  customerNotes?: string;
  uploadedPhotos?: string[];
  couponCode?: string;
  paymentMethod?: "upi" | "card" | "wallet" | "cash";
  idempotencyKey?: string;
  createdAt?: string;
}

interface BookingDraftStore {
  draft: BookingDraft | null;
  setSingleServiceDraft: (service: any, quantity?: number, variant?: any) => void;
  setCartDraft: (cartItems: any[]) => void;
  updateDraft: (partial: Partial<BookingDraft>) => void;
  updateQuestionAnswer: (questionId: string, answer: string) => void;
  clearDraft: () => void;
  ensureIdempotencyKey: () => string;
}

function generateIdempotencyKey(): string {
  return `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useBookingDraftStore = create<BookingDraftStore>()(
  persist(
    (set, get) => ({
      draft: null,

      setSingleServiceDraft: (service: any, quantity = 1, variant?: any) => {
        const qty = Math.max(1, quantity);
        const resolvedVariant = variant || (service ? findCanonicalVariant(service) : null);
        const unitPrice = resolvedVariant?.price ?? service.discountedPrice ?? service.basePrice ?? service.customerPrice ?? 99;
        const duration = resolvedVariant?.durationLabel || resolvedVariant?.duration || service.durationMinutes || service.duration || "30–45 mins";

        const item: BookingItemDraft = {
          serviceId: service.id || `srv-${service.slug || "custom"}`,
          serviceSlug: service.slug || "service",
          serviceName: service.name || "Home Service",
          categorySlug: service.category?.slug || service.categorySlug || service.category || "general",
          variantId: resolvedVariant?.id,
          variantName: resolvedVariant?.name,
          variantDuration: resolvedVariant?.durationLabel,
          packageId: resolvedVariant?.id,
          packageName: resolvedVariant?.name,
          unitPrice,
          quantity: qty,
          quantityUnit: service.quantityUnit || "unit",
          pricingType: resolvedVariant?.pricingType || service.pricingType || "fixed",
          materialsPolicy: service.materialsPolicy || "extra",
          warrantyDays: typeof resolvedVariant?.warrantyDays === "number"
            ? resolvedVariant.warrantyDays
            : (typeof service.warrantyDays === "number" ? service.warrantyDays : 0),
          duration,
          subtotal: unitPrice * qty,
          thumbnail: service.thumbnail || service.imageUrl,
        };

        set({
          draft: {
            source: "single_service",
            items: [item],
            isEmergencyRequested: false,
            questionAnswers: {},
            customerNotes: "",
            uploadedPhotos: [],
            couponCode: "",
            paymentMethod: "upi",
            idempotencyKey: generateIdempotencyKey(),
            createdAt: new Date().toISOString(),
          },
        });
      },

      setCartDraft: (cartItems: any[]) => {
        if (!cartItems || cartItems.length === 0) {
          set({ draft: null });
          return;
        }

        const items: BookingItemDraft[] = cartItems.map((cartItem) => {
          const qty = Math.max(1, cartItem.quantity || 1);
          const unitPrice = cartItem.discountedPrice ?? cartItem.basePrice ?? 499;
          return {
            serviceId: cartItem.id,
            serviceSlug: cartItem.slug || "service",
            serviceName: cartItem.name,
            categorySlug: cartItem.category?.slug || cartItem.categorySlug || "general",
            unitPrice,
            quantity: qty,
            quantityUnit: cartItem.quantityUnit || "unit",
            pricingType: cartItem.pricingType || "fixed",
            materialsPolicy: cartItem.materialsPolicy || "extra",
            warrantyDays: typeof cartItem.warrantyDays === "number" ? cartItem.warrantyDays : 0,
            duration: cartItem.durationMinutes || cartItem.duration || 45,
            subtotal: unitPrice * qty,
            thumbnail: cartItem.thumbnail,
          };
        });

        set({
          draft: {
            source: "cart",
            items,
            isEmergencyRequested: false,
            questionAnswers: {},
            customerNotes: "",
            uploadedPhotos: [],
            couponCode: "",
            paymentMethod: "upi",
            idempotencyKey: generateIdempotencyKey(),
            createdAt: new Date().toISOString(),
          },
        });
      },

      updateDraft: (partial: Partial<BookingDraft>) => {
        const current = get().draft;
        if (!current) {
          set({
            draft: {
              source: "single_service",
              items: [],
              ...partial,
              idempotencyKey: generateIdempotencyKey(),
              createdAt: new Date().toISOString(),
            },
          });
        } else {
          set({ draft: { ...current, ...partial } });
        }
      },

      updateQuestionAnswer: (questionId: string, answer: string) => {
        const current = get().draft;
        if (!current) return;
        set({
          draft: {
            ...current,
            questionAnswers: {
              ...(current.questionAnswers || {}),
              [questionId]: answer,
            },
          },
        });
      },

      clearDraft: () => set({ draft: null }),

      ensureIdempotencyKey: () => {
        const current = get().draft;
        if (current?.idempotencyKey) {
          return current.idempotencyKey;
        }
        const newKey = generateIdempotencyKey();
        if (current) {
          set({ draft: { ...current, idempotencyKey: newKey } });
        }
        return newKey;
      },
    }),
    {
      name: "homeefix-booking-draft-storage",
    }
  )
);
