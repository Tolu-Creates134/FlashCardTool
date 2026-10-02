import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchCategories } from '../../services/api';
import { CategoryDto, ListAllCategoriesResponse } from '../../types';

/**
 * Retrieves all categories
 * @returns {UseQueryResult<CategoryDto[]>}
 */
export const useCategoriesQuery = (): UseQueryResult<CategoryDto[]> => {
    return useQuery<ListAllCategoriesResponse, Error, CategoryDto[]>({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        select: (data: ListAllCategoriesResponse) => data.categories ?? []
    });
}

