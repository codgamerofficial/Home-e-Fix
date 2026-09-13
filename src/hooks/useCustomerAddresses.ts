import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressesApi } from "@/services/api/addresses.api";
import type { Address } from "@/types/address.types";
import { useAuthStore } from "@/store/auth.store";

export function useCustomerAddresses() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const queryKey = ["customer-addresses", userId || "anonymous"];

  const {
    data: addresses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Address[], Error>({
    queryKey,
    queryFn: async () => {
      if (!userId) return [];
      const result = await addressesApi.getCustomerAddresses(userId);
      // Guarantee array contract to prevent any caller runtime crash
      return Array.isArray(result) ? result : [];
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });

  const createMutation = useMutation({
    mutationFn: (newAddr: Partial<Address>) => {
      if (!userId) throw new Error("Please log in to save a delivery address.");
      return addressesApi.createAddress(newAddr, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Address> }) => {
      if (!userId) throw new Error("Please log in to update your address.");
      return addressesApi.updateAddress(id, updates, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error("Please log in to delete an address.");
      return addressesApi.deleteAddress(id, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error("Please log in to set default address.");
      return addressesApi.setDefaultAddress(id, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    addresses: Array.isArray(addresses) ? addresses : [],
    isLoading,
    isError,
    error,
    refetch,
    createAddress: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAddress: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteAddress: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    setDefaultAddress: setDefaultMutation.mutateAsync,
    isSettingDefault: setDefaultMutation.isPending,
  };
}
