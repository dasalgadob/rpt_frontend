import useSWR from 'swr';
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
    if (Array.isArray(data)) {
      // Si data es directamente un array
      periods = data.map(item => ({
        id: item.id,
        name: item.attributes?.name || 'Sin nombre',
        type: item.attributes?.period_type || 'N/A',
        status: item.attributes?.status || 'N/A',
        companyId: item.relationships?.company?.data?.id,
        company_profit_percentage: item.attributes?.company_profit_percentage ?? null,
        minimum_score_employee: item.attributes?.minimum_score_employee ?? null,
      }));
    } else if (data.data && Array.isArray(data.data)) {
      // Si data tiene una propiedad 'data' que es un array
      periods = data.data.map(item => ({
        id: item.id,
        name: item.attributes?.name || 'Sin nombre',
        type: item.attributes?.period_type || 'N/A',
        status: item.attributes?.status || 'N/A',
        companyId: item.relationships?.company?.data?.id,
        company_profit_percentage: item.attributes?.company_profit_percentage ?? null,
        minimum_score_employee: item.attributes?.minimum_score_employee ?? null,
      }));
    }
    
    console.log('Datos originales de períodos de la API:', data);
    console.log('Períodos procesados desde la API:', periods);
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
    console.log('=== HOOK createPeriod INICIADO ===');
    console.log('Company ID recibido:', companyId);
    console.log('Period Data recibido:', periodData);
    
    try {
      // Formatear datos según lo que espera Rails
      const payload = {
        period: {
          name: periodData.name,
          period_type: periodData.period_type,
          status: periodData.status,
          company_profit_percentage: periodData.company_profit_percentage,
          minimum_score_employee: periodData.minimum_score_employee
        }
      };

      const url = `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods`;
      console.log('URL construida para POST:', url);
      console.log('Payload a enviar:', payload);

      const result = await fetcher(url, {
        method: 'POST',
        body: payload,
      });
      
      console.log('=== RESPUESTA DEL SERVIDOR ===');
      console.log('Result:', result);
      
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
      // Formatear datos según lo que espera Rails
      const payload = {
        period: {
          name: periodData.name,
          period_type: periodData.period_type,
          status: periodData.status,
          company_profit_percentage: periodData.company_profit_percentage,
          minimum_score_employee: periodData.minimum_score_employee
        }
      };

      const result = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods/${periodId}`, {
        method: 'PUT',
        body: payload,
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('Error en updatePeriod:', error);
      return { success: false, error: error.message };
    }
  };

  // Eliminar período
  const deletePeriod = async (companyId, periodId) => {
    try {
      const result = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods/${periodId}`, {
        method: 'DELETE',
      });
      
      // Para DELETE con 204, result podría ser undefined o null
      // Esto es normal y significa éxito
      return { success: true, data: result };
    } catch (error) {
      console.error('Error en deletePeriod:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    createPeriod,
    updatePeriod,
    deletePeriod,
  };
};
