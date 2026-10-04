import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { updateDeck } from "../../services/api";
import { DeckDto } from "../../types";
import { isInfrastructureError } from "../../utils/infraErrorHandler";

interface UpdateDeckCommand {
    deckId: string
    deckData: DeckDto
}

/**
 * Mutation hook for updating an existing deck and its flashcards
 * @returns {UseMutationResult} React Query mutation with mutate, isPending, isError, error
 */
export const useUpdateDeckMutation = (): UseMutationResult<void, Error, UpdateDeckCommand> => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, UpdateDeckCommand>({
        mutationFn: ({ deckId, deckData }: UpdateDeckCommand) => updateDeck(deckId, deckData),
        onSuccess: (_data: void, variables: UpdateDeckCommand): void => {
            queryClient.invalidateQueries({ queryKey: ['decks'] });
            queryClient.invalidateQueries({ queryKey: ['deck', variables.deckId] });
            queryClient.invalidateQueries({ queryKey: ['flashcards', variables.deckId] });
        },
        onError: (error: Error): void => {
            const axiosError = error as AxiosError
            if (isInfrastructureError(axiosError)) {
                return;
            }
            throw error;
        }
    }); 
};