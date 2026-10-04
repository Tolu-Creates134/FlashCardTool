import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query"
import { deleteCategory } from "../../services/api"
import { useNavigate } from "react-router-dom";
import { isInfrastructureError } from "../../utils/infraErrorHandler";
import { AxiosError } from "axios";

interface CategoryDeleteCommand{
    categoryId: string;
}

/**
 * Delete category and related decks/flashcards mutation
 * @returns 
 */
export const useDeleteCategoryMutation = (): UseMutationResult<void, Error, CategoryDeleteCommand>  => {
    const queryClient = useQueryClient();
    const navigate = useNavigate()

    return useMutation<void, Error, CategoryDeleteCommand>({
        mutationFn: async (category: CategoryDeleteCommand) => {
            await deleteCategory(category.categoryId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['decks'] });
            navigate('/home');
        },
        onError: (error: Error) => {
            const axiosError = error as AxiosError
            if (isInfrastructureError(axiosError)) {
                return;
            }
            throw error;
        }
    })
}