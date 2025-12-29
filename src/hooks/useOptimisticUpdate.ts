import { useState, useCallback } from 'react';

/**
 * Hook for optimistic UI updates
 * Updates UI immediately, then reverts if the operation fails
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error, previousData: T) => void
) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (optimisticData: T) => {
      const previousData = data;
      
      // Optimistic update
      setData(optimisticData);
      setIsUpdating(true);
      setError(null);

      try {
        // Perform actual update
        const result = await updateFn(optimisticData);
        setData(result);
        setIsUpdating(false);
        onSuccess?.(result);
        return result;
      } catch (err) {
        // Revert on error
        setData(previousData);
        setIsUpdating(false);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error, previousData);
        throw error;
      }
    },
    [data, updateFn, onSuccess, onError]
  );

  return {
    data,
    update,
    isUpdating,
    error,
    setData, // Allow manual updates if needed
  };
}

