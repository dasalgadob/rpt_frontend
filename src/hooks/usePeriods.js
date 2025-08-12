import useSWR from 'swr';
import { fetcher } from '../constants';

// Hook para obtener todos los períodos de una empresa
export const useCompanyPeriods = (companyId) => {
  const { data, error, isLoading, mutate } = useSWR(
    companyId ? [`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods`, { method: 'GET' }] : null,
    ([url, params]) => fetcher(url, params),
    {
      fallbackData: [],
      revalidateOnFocus: false,
    }
  );

  return {
    periods: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook para obtener un período específico
export const usePeriod = (companyId, periodId) => {
  const { data, error, isLoading, mutate } = useSWR(
    companyId && periodId 
      ? [`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods/${periodId}`, { method: 'GET' }] 
      : null,
    ([url, params]) => fetcher(url, params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    period: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook para operaciones CRUD de períodos
export const usePeriodOperations = () => {
  // Crear período
  const createPeriod = async (companyId, periodData) => {
    try {
      const result = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods`, {
        method: 'POST',
        body: periodData,
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Actualizar período
  const updatePeriod = async (companyId, periodId, periodData) => {
    try {
      const result = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods/${periodId}`, {
        method: 'PUT',
        body: periodData,
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Eliminar período
  const deletePeriod = async (companyId, periodId) => {
    try {
      await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods/${periodId}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    createPeriod,
    updatePeriod,
    deletePeriod,
  };
};
