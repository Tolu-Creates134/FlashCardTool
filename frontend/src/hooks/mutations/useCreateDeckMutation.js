import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDeck } from '../../services/api';

/**
 * Mutation hook for creating a new deck
 * @returns {UseMutationResult} React Query mutation with mutate, isPending, isError, error
 */
export const useCreateDeckMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createDeck,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decks'] });
        },
    });
};
