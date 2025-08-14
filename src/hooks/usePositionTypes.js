"use client";

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../constants';

// Hook to fetch position types for a company
export const usePositionTypes = (companyId) => {
  // Get API URL from environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const swrKey = companyId ? `${apiUrl}/companies/${companyId}/position_types` : null;
  console.log("🚀 ~ usePositionTypes ~ companyId:", companyId)
  
   const { data, error, isLoading, mutate} = useSWR(
    swrKey,
    (url) => fetcher(url, { method: 'GET' })
  );
  console.log("🚀 ~ usePositionTypes ~ data:", data)

  // Transform the response data
  let positionTypes = [];
  
  if (data?.data) {
    positionTypes = data.data.map(item => ({
      id: item.id,
      name: item.attributes?.name || item.name,
    }));
  }

  return {
    positionTypes,
    isLoading,
    error,
    mutate
  };
};

// Hook to create a position type
export const useCreatePositionType = (companyId) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const { trigger, isMutating } = useSWRMutation(
    `${apiUrl}/companies/${companyId}/position_types`,
    async (url, { arg: values }) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create position type');
      }
      
      return response.json();
    }
  );

  return {
    createPositionType: trigger,
    isCreating: isMutating
  };
};
