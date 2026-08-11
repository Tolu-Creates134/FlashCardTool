import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCategory } from "../../services/api"
import { useNavigate } from "react-router-dom";

/**
 * Delete category and related decks/flashcards mutation
 * @returns 
 */
export const useDeleteCategoryMutation = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async ({ categoryId }) => {
            await deleteCategory(categoryId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['decks'] });
            navigate('/home');
        }
    })
}