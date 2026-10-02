import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { createDeck } from '../../services/api';
import { CreateDeckCommand, CreateDeckResponse } from '../../types';

/**
 * Mutation hook for creating a new deck
 * @returns {UseMutationResult} React Query mutation with mutate, isPending, isError, error
 */
export const useCreateDeckMutation = (): UseMutationResult<CreateDeckResponse, Error, CreateDeckCommand> => {
    const queryClient = useQueryClient();

    return useMutation<CreateDeckResponse, Error, CreateDeckCommand>({
        mutationFn: (deckData: CreateDeckCommand)  => createDeck(deckData),
        onSuccess: (_data: CreateDeckResponse): void => {
            queryClient.invalidateQueries({ queryKey: ['decks'] });
        },
    });
};
