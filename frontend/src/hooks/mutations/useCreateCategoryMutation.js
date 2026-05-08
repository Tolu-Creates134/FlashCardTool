import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../../services/api';

/**
 * Mutation hook for creating a new category
 * @returns {UseMutationResult} React Query mutation with mutate, isPending, isError, error
 */
export const useCreateCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCategory,
        onSuccess: (createdCategory) => {
            queryClient.setQueryData(['categories'], (existingCategories = []) => [
                createdCategory,
                ...existingCategories.filter((category) => category.id !== createdCategory.id),
            ]);
        },
    });
};
