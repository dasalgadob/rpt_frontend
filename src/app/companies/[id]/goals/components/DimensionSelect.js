"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Select, Form } from 'antd';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';

const { Option } = Select;

const DimensionSelect = ({ 
  companyId, 
  periodId,
  placeholder = "Seleccionar dimensión",
  selectFirstAsDefault = false,
  rules = [],
  name
}) => {
  const { data: response, error, isLoading } = useSWR(
    companyId && periodId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/dimensions?period_id=${periodId}` : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Track when SWR data changes to trigger updates
  const dimensionsKey = response?.data?.length || 0;
  const dimensions = useMemo(() => {
    return response?.data?.map(item => ({
      id: item.id,
      name: item.attributes.name,
    })) || [];
  }, [response?.data]);

  // Create a select component that can handle auto-selection
  const DimensionSelectField = (props) => {
    const { value, onChange } = props;
    const [displayValue, setDisplayValue] = useState(null);
    
    // Auto-select first dimension if enabled and no value is set
    useEffect(() => {
      if (selectFirstAsDefault && dimensions.length > 0 && !value && onChange) {
        const firstDimensionId = dimensions[0].id;
        onChange(firstDimensionId);
      }
    }, [value, onChange]);

    // Update display value when dimensions load or value changes
    useEffect(() => {
      if (!value) {
        setDisplayValue(null);
        return;
      }

      // Handle both string and number IDs by converting both to strings for comparison
      const dimension = dimensions.find(dim => 
        String(dim.id) === String(value)
      );
      
      if (dimension) {
        setDisplayValue({
          value: dimension.id,
          label: dimension.name
        });
      } else {
        // If dimension not found yet (still loading), show temporary label
        setDisplayValue({
          value: value,
          label: isLoading ? "Cargando..." : `Dimensión ${value}`
        });
      }
    }, [value]); // Only depend on value

    // Update display when component receives new data (dimensions will change)
    if (value && dimensions.length > 0) {
      const dimension = dimensions.find(dim => 
        String(dim.id) === String(value)
      );
      
      if (dimension && (!displayValue || displayValue.label !== dimension.name)) {
        setDisplayValue({
          value: dimension.id,
          label: dimension.name
        });
      }
    }

    return (
      <Select
        style={{ width: '100%' }}
        placeholder={periodId ? placeholder : "Primero selecciona un periodo"}
        loading={isLoading}
        allowClear
        showSearch
        disabled={!periodId}
        labelInValue
        value={displayValue}
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        onChange={(selected) => {
          // Extract just the ID for the form
          onChange(selected?.value);
        }}
        notFoundContent={isLoading ? "Cargando..." : "No hay dimensiones disponibles"}
      >
        {dimensions.map(dimension => (
          <Option key={dimension.id} value={dimension.id}>
            {dimension.name}
          </Option>
        ))}
      </Select>
    );
  };

  return (
    <Form.Item label="Dimensión" name={name} style={{ marginBottom: 0 }} rules={rules}>
      <DimensionSelectField />
    </Form.Item>
  );
};

export default DimensionSelect;
