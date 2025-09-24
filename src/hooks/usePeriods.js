import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../constants';

// Hook para obtener todos los períodos de una empresa
export const useCompanyPeriods = (companyId) => {
  const { data, error, isLoading, mutate } = useSWR(
    companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods` : null,
    (url) => fetcher(url, { method: 'GET' }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      refreshInterval: 0,
      onError: (error) => {
        console.warn('Error al cargar períodos desde la API:', error.message);
      },
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );

  // Transformar los datos al formato que espera el componente
  let periods = [];
  
  if (data) {
    // API devuelve JSON API format: {"data":[{"id":"1","type":"periods","attributes":{"name":"Q1 2024"}}]}
      // Si data tiene una propiedad 'data' que es un array
      periods = data.data.map(item => ({
        id: item.id,
        name: item.attributes?.name || 'Sin nombre',
        type: item.attributes?.period_type || '',
        status: item.attributes?.status || '',
        companyId: item.relationships?.company?.data?.id,
        minimum_score_employee: item.attributes?.minimum_score_employee ?? null,
        goal_floor: item.attributes?.goal_floor ?? null,
        goal_value: item.attributes?.goal_value ?? null,
        goal_ceil: item.attributes?.goal_ceil ?? null,
        formula_below_value: item.attributes?.formula_below_value || '', 
        formula_above_value: item.attributes?.formula_above_value || '',
        goal_achieved: item.attributes?.goal_achieved ?? null,
        score: item.attributes?.score ?? null,
      }));
  
  }

  return {
    periods,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook para obtener un período específico
export const usePeriod = (companyId, periodId) => {
  const { data, error, isLoading, mutate } = useSWR(
    companyId && periodId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods/${periodId}`
      : null,
    (url) => fetcher(url, { method: 'GET' }),
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

      const url = `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods`;
      const result = await fetcher(url, {
        method: 'POST',
        body: periodData,
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('=== ERROR en createPeriod ===');
      console.error('Error completo:', error);
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
      console.error('Error en updatePeriod:', error);
      return { success: false, error: error.message };
    }
  };

  // Eliminar período usando useSWRMutation
  const { trigger: deletePeriod, isMutating: isDeleting } = useSWRMutation(
    null, // No key needed for delete operations
    async (_, { arg: { companyId, periodId } }) => {
      return await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods/${periodId}`, {
        method: 'DELETE',
      });
    }
  );

  return {
    createPeriod,
    updatePeriod,
    deletePeriod,
    isDeleting,
  };
};
