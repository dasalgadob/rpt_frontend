import useSWR from 'swr';
import { fetcher } from '../constants';

// Hook para obtener todas las empresas
export const useCompanies = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/companies`, 
    (url) => fetcher(url, { method: 'GET' }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0, // Deshabilitar deduplicación
      refreshInterval: 0, // Sin auto-refresh
      onError: (error) => {
        console.warn('Error al cargar empresas desde la API:', error.message);
      },
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      onSuccess: (data) => {
        console.log('Hook useCompanies - Datos recargados exitosamente:', data);
      }
    }
  );

  // Asegurar que siempre devolvemos un array
  let companies = [];
  
  if (data) {
    // Tu API devuelve JSON API format: {"data":[{"id":"1","type":"companies","attributes":{"name":"Sura"}}]}
    if (Array.isArray(data)) {
      // Si data es directamente un array
      companies = data.map(item => ({
        id: item.id,
        name: item.attributes?.name || 'Sin nombre',
        status: item.attributes?.status,
      }));
    } else if (data.data && Array.isArray(data.data)) {
      // Si data tiene una propiedad 'data' que es un array (tu caso)
      companies = data.data.map(item => ({
        id: item.id,
        name: item.attributes?.name || 'Sin nombre',
        status: item.attributes?.status,
      }));
    }
    
    console.log('Datos originales de la API:', data);
    console.log('Empresas procesadas desde la API:', companies);
    console.log('¿Array vacío?', companies.length === 0);
  } else if (error) {
    // No mostrar datos demo ni siquiera en caso de error
    console.error('Error de conexión con la API. Mostrando tabla vacía:', error.message);
    companies = []; // Siempre array vacío en caso de error
  }
  // Si no hay data ni error (primera carga), companies permanece como array vacío []

  return {
    companies,
    isLoading,
    isError: error,
    mutate,
    // Función simple para recargar después de eliminar
    refreshAfterDelete: async () => {
      console.log('Recargando datos después de eliminación...');
      try {
        // Forzar una nueva llamada al API sin caché
        const newData = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies`, { method: 'GET' });
        console.log('Nuevos datos obtenidos:', newData);
        
        // Actualizar el caché de SWR con los nuevos datos
        mutate(newData, false);
        
        return true;
      } catch (error) {
        console.error('Error al recargar datos:', error);
        return false;
      }
    }
  };
};

// Hook para obtener una empresa específica
export const useCompany = (id) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? [`${process.env.NEXT_PUBLIC_API_URL}/companies/${id}`, { method: 'GET' }] : null,
    ([url, params]) => fetcher(url, params),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    company: data,
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook para operaciones CRUD de empresas
export const useCompanyOperations = () => {
  // Crear empresa
  const createCompany = async (companyData) => {
    try {
      // Formatear datos según lo que espera Rails
      const payload = {
        company: {
          name: companyData.name,
        }
      };

      const result = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies`, {
        method: 'POST',
        body: payload,
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Actualizar empresa
  const updateCompany = async (id, companyData) => {
    try {
      // Formatear datos según lo que espera Rails
      const payload = {
        company: {
          name: companyData.name,
        }
      };

      const result = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${id}`, {
        method: 'PUT',
        body: payload,
      });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Eliminar empresa
  const deleteCompany = async (id) => {
    try {
      const result = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${id}`, {
        method: 'DELETE',
      });
      
      // Para DELETE con 204, result podría ser undefined o null
      // Esto es normal y significa éxito
      return { success: true, data: result };
    } catch (error) {
      console.error('Error en deleteCompany:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    createCompany,
    updateCompany,
    deleteCompany,
  };
};
