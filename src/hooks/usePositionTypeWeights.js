import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useEffect, useState } from 'react';
import { fetcher } from '../constants';

// Hook para obtener position type weights de una empresa
export const useCompanyPositionTypeWeights = (companyId, periodFilter = null) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const swrKey = companyId ? `${apiUrl}/companies/${companyId}/position_type_weights${periodFilter ? `?period_id=${periodFilter}` : ''}` : null;

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    (url) => fetcher(url, { method: 'GET' }),
    {
      onError: (error) => {
        console.warn(`Position type weights endpoint error for company ${companyId}:`, error);
      }
    }
  );

  // Retornar los datos tal como vienen del endpoint
  return {
    weights: data?.data || [],
    isLoading: isLoading && !error,
    isError: error,
    mutate
  };
};

// Hook para operaciones CRUD de position type weights
export const usePositionTypeWeightOperations = () => {
  const createPositionTypeWeight = async (companyId, weightData) => {
    try {
      const response = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_type_weights`, {
        method: 'POST',
        body: { position_type_weight: weightData }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating position type weight:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePositionTypeWeight = async (companyId, weightId, weightData) => {
    try {
      const response = await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_type_weights/${weightId}`, {
        method: 'PUT',
        body: { position_type_weight: weightData }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating position type weight:', error);
      return { success: false, error: error.message };
    }
  };

  const deletePositionTypeWeight = async (companyId, weightId) => {
    try {
      await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_type_weights/${weightId}`, {
        method: 'DELETE'
      });
      return { success: true };
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
