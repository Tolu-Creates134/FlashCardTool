import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { deleteDeck } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { isInfrastructureError } from "../../utils/infraErrorHandler";
import { AxiosError } from "axios";

interface DeckDeleteCommand {
    deckId: string;
}


/**
 * Deletes a deck using deckId
 * @param {*} deckId 
 * @returns 
 */
export const useDeleteDeckMutation = (): UseMutationResult<void, Error, DeckDeleteCommand> => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation<void, Error, DeckDeleteCommand>({
        mutationFn: async (command: DeckDeleteCommand): Promise<void> => {
           await deleteDeck(command.deckId);
        },
        onSuccess: (_data: void, variables: DeckDeleteCommand) => {
            queryClient.removeQueries({ queryKey: ['deck', variables.deckId] });
            queryClient.removeQueries({ queryKey: ['flashcards', variables.deckId]});
            navigate('/home'); // navigate first
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['decks'] });
                queryClient.invalidateQueries({ queryKey: ['categories'] });
            }, 0);
        },
        onError: (error: Error): void => {
            const axiosError = error as AxiosError
            if (isInfrastructureError(axiosError)) {
                return;
            }
            throw error;
        }
    });
}
