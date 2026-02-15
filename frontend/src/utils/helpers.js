/**
 * Custom function to generate unique ID 
 * @returns 
 */
export const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9);
};