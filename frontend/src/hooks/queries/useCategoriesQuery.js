import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../../services/api';

/**
 * Retrieves all categories 
 * @returns 
 */
export const useCategoriesQuery = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories
    });
}

