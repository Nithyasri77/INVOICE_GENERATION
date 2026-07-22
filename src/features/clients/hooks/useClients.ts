/**
 * Purpose: Data-fetching/mutation hooks for the Clients module
 * Responsibilities: Wrap clientService calls in useQuery/useMutation (caching, loading/error
 *                    states, cache invalidation on write) — this is the only thing ClientsListPage
 *                    and its modals import from the data layer
 * Dependencies: @tanstack/react-query, clientService, client.types
 * Export: useClients, useClient, useCreateClient, useUpdateClient, useDeleteClient
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../../../services/clientService';
import type { ClientFormValues, ClientListParams } from '../../../types/client.types';

const CLIENTS_KEY = 'clients';

export function useClients(params: ClientListParams) {
  return useQuery({
    queryKey: [CLIENTS_KEY, params],
    queryFn: () => getClients(params),
    placeholderData: (prev) => prev,
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: [CLIENTS_KEY, 'detail', id],
    queryFn: () => getClientById(id as string),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ClientFormValues) => createClient(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ClientFormValues }) => updateClient(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}
