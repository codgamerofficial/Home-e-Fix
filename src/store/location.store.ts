import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LocationStore {
  city: string;
  locality: string;
  pincode: string;
  formattedAddress: string;
  isLocationSheetOpen: boolean;
  setLocation: (locality: string, pincode?: string, formattedAddress?: string) => void;
  openLocationSheet: () => void;
  closeLocationSheet: () => void;
  toggleLocationSheet: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      city: "Kolkata",
      locality: "",
      pincode: "",
      formattedAddress: "Kolkata, West Bengal",
      isLocationSheetOpen: false,

      setLocation: (locality, pincode = "", formattedAddress) => {
        set({
          locality: locality.trim(),
          pincode: pincode.trim(),
          formattedAddress: formattedAddress || (locality ? `${locality}, Kolkata - ${pincode}` : "Kolkata, West Bengal"),
        });
      },

      openLocationSheet: () => set({ isLocationSheetOpen: true }),
      closeLocationSheet: () => set({ isLocationSheetOpen: false }),
      toggleLocationSheet: () =>
        set((state) => ({ isLocationSheetOpen: !state.isLocationSheetOpen })),
    }),
    {
      name: "homeefix-location-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        city: state.city,
        locality: state.locality,
        pincode: state.pincode,
        formattedAddress: state.formattedAddress,
      }),
    }
  )
);
