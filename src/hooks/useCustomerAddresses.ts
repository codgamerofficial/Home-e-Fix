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
      // If user is guest or unauthenticated, retrieve locally saved addresses
      const effectiveId = userId || "usr-guest";
      const result = await addressesApi.getCustomerAddresses(effectiveId);
      return Array.isArray(result) ? result : [];
    },
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["customer-addresses"] });
    queryClient.invalidateQueries({ queryKey: ["saved-addresses"] });
  };

  const createMutation = useMutation({
    mutationFn: (newAddr: Partial<Address>) => {
      const effectiveId = userId || "usr-guest";
      return addressesApi.createAddress(newAddr, effectiveId);
    },
    onSuccess: (savedAddress) => {
      invalidateAll();
      return savedAddress;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Address> }) => {
      const effectiveId = userId || "usr-guest";
      return addressesApi.updateAddress(id, updates, effectiveId);
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const effectiveId = userId || "usr-guest";
      return addressesApi.deleteAddress(id, effectiveId);
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => {
      const effectiveId = userId || "usr-guest";
      return addressesApi.setDefaultAddress(id, effectiveId);
    },
    onSuccess: () => {
      invalidateAll();
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
