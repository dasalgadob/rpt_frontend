import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useEffect, useState } from 'react';
import { fetcher } from '../constants';

// Hook para obtener position type weights de una empresa
export const useCompanyPositionTypeWeights = (companyId, periodFilter = null) => {
  const [localDataVersion, setLocalDataVersion] = useState(0);
  
  // Debugging: log the API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  console.log('Position Type Weights API URL:', apiUrl);
  
  const swrKey = companyId ? `${apiUrl}/companies/${companyId}/position_type_weights${periodFilter ? `?period_id=${periodFilter}` : ''}` : null;
  console.log('Position Type Weights SWR Key:', swrKey);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setLocalDataVersion(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleStorageChange); // Custom event for same-tab
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, []);
  
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    (url) => fetcher(url, { method: 'GET' }),
    {
      onError: (error) => {
        console.warn(`Position type weights endpoint error for company ${companyId}:`, error);
      }
    }
  );

  console.log('Position Type Weights hook data:', { companyId, data, error, isLoading });

  // Get local position type weights from localStorage as fallback
  const localStorageKey = `position_type_weights_${companyId}${periodFilter ? `_period_${periodFilter}` : ''}`;
  const localWeights = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem(localStorageKey) || '[]')
    : [];

  // Transform the response data to handle both success and error cases - with fallback for errors
  let weights = [];
  
  if (data?.data) {
    // Use API data if available
    weights = data.data.map(item => ({
      id: item.id,
      position_type: item.attributes?.position_type,
      corporativo: item.attributes?.corporativo,
      area: item.attributes?.area,
      cargo: item.attributes?.cargo,
      total: (item.attributes?.corporativo || 0) + (item.attributes?.area || 0) + (item.attributes?.cargo || 0)
    }));
  } else if (localWeights.length > 0) {
    // Use local data if API fails
    weights = localWeights.map(item => ({
      id: item.id,
      position_type: item.position_type,
      corporativo: item.corporativo,
      area: item.area,
      cargo: item.cargo,
      total: (item.corporativo || 0) + (item.area || 0) + (item.cargo || 0)
    }));
  }

  console.log('Final weights (API + Local):', { 
    apiData: data?.data, 
    localData: localWeights, 
    final: weights,
    localDataVersion 
  });

  return {
    weights,
    isLoading: isLoading && !error, // Don't show loading if there's an error
    isError: error,
    mutate: () => {
      mutate();
      setLocalDataVersion(prev => prev + 1);
    }
  };
};

// Hook para operaciones CRUD de position type weights
export const usePositionTypeWeightOperations = () => {
  
  const createPositionTypeWeight = async (companyId, weightData) => {
    try {
      // Try API first, fallback to localStorage
      try {
        const response = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_type_weights`, {
          method: 'POST',
          body: { position_type_weight: weightData }
        });
        return { success: true, data: response.data };
      } catch (apiError) {
        console.warn('API failed, using localStorage:', apiError);
        
        // Fallback to localStorage
        const newWeight = {
          id: Date.now(),
          position_type: weightData.position_type,
          corporativo: weightData.corporativo || 0,
          area: weightData.area || 0,
          cargo: weightData.cargo || 0
        };
        
        const existingWeights = JSON.parse(localStorage.getItem(`position_type_weights_${companyId}`) || '[]');
        const updatedWeights = [...existingWeights, newWeight];
        localStorage.setItem(`position_type_weights_${companyId}`, JSON.stringify(updatedWeights));
        
        // Trigger storage event for updates
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('localStorageChange')); // Custom event for same-tab
        
        console.log('Weight created locally:', newWeight);
        return { success: true, data: newWeight };
      }
    } catch (error) {
      console.error('Error creating position type weight:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePositionTypeWeight = async (companyId, weightId, weightData) => {
    try {
      // Try API first, fallback to localStorage
      try {
        const response = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_type_weights/${weightId}`, {
          method: 'PUT',
          body: { position_type_weight: weightData }
        });
        return { success: true, data: response.data };
      } catch (apiError) {
        console.warn('API failed, using localStorage:', apiError);
        
        // Fallback to localStorage
        const existingWeights = JSON.parse(localStorage.getItem(`position_type_weights_${companyId}`) || '[]');
        const updatedWeights = existingWeights.map(weight => 
          weight.id === weightId 
            ? { 
                ...weight, 
                position_type: weightData.position_type,
                corporativo: weightData.corporativo || 0,
                area: weightData.area || 0,
                cargo: weightData.cargo || 0
              }
            : weight
        );
        localStorage.setItem(`position_type_weights_${companyId}`, JSON.stringify(updatedWeights));
        
        // Trigger storage event for updates
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('localStorageChange')); // Custom event for same-tab
        
        console.log('Weight updated locally:', weightId);
        return { success: true, data: updatedWeights.find(w => w.id === weightId) };
      }
    } catch (error) {
      console.error('Error updating position type weight:', error);
      return { success: false, error: error.message };
    }
  };

  const deletePositionTypeWeight = async (companyId, weightId) => {
    try {
      // Try API first, fallback to localStorage
      try {
        await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_type_weights/${weightId}`, {
          method: 'DELETE'
        });
        return { success: true };
      } catch (apiError) {
        console.warn('API failed, using localStorage:', apiError);
        
        // Fallback to localStorage
        const existingWeights = JSON.parse(localStorage.getItem(`position_type_weights_${companyId}`) || '[]');
        const updatedWeights = existingWeights.filter(weight => weight.id !== weightId);
        localStorage.setItem(`position_type_weights_${companyId}`, JSON.stringify(updatedWeights));
        
        // Trigger storage event for updates
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('localStorageChange')); // Custom event for same-tab
        
        console.log('Weight deleted locally:', weightId);
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting position type weight:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    createPositionTypeWeight,
    updatePositionTypeWeight,
    deletePositionTypeWeight
  };
};
