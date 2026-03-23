import { useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { apiClient, bookEndpoints } from '../utils/api';

interface UseAutoSaveOptions {
  bookId: string;
  data: any;
  onSave?: (timestamp: Date) => void;
  onError?: (error: any) => void;
  delay?: number;
}

export function useAutoSave({
  bookId,
  data,
  onSave,
  onError,
  delay = 500,
}: UseAutoSaveOptions) {
  const debouncedData = useDebounce(data, delay);
  const lastSaveRef = useRef<Date | null>(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async (saveData: any) => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    
    try {
      const response = await apiClient.post(bookEndpoints.autosave(bookId), saveData);
      lastSaveRef.current = new Date(response.timestamp);
      onSave?.(lastSaveRef.current);
    } catch (error) {
      console.error('Auto-save failed:', error);
      onError?.(error);
    } finally {
      isSavingRef.current = false;
    }
  }, [bookId, onSave, onError]);

  // Trigger save when debounced data changes
  const triggerSave = useCallback(() => {
    if (debouncedData && bookId) {
      save(debouncedData);
    }
  }, [debouncedData, bookId, save]);

  return {
    triggerSave,
    lastSave: lastSaveRef.current,
    isSaving: isSavingRef.current,
  };
}
