import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBagMutation, reserveBagMutation } from './queries.js';

export function useCreateBag() {
  const queryClient = useQueryClient();
  return useMutation(createBagMutation(queryClient));
}

export function useReserveBag() {
  const queryClient = useQueryClient();
  return useMutation(reserveBagMutation(queryClient));
}
