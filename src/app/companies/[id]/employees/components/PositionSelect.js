"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Select, Form } from 'antd';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';

const { Option } = Select;

const PositionSelect = ({ 
  companyId, 
  placeholder = "Seleccionar posición",
  selectFirstAsDefault = false,
  rules = [],
  name
}) => {
  const { data: response, error, isLoading } = useSWR(
    companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/positions` : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Transform the response data to component format
  const positions = useMemo(() => {
    return response?.data?.map(item => ({
      id: item.id,
      name: item.attributes.name,
    })) || [];
  }, [response?.data]);

  // Create a select component that can handle auto-selection
  const PositionSelectField = (props) => {
    const { value, onChange } = props;
    const [displayValue, setDisplayValue] = useState(null);
    
    // Auto-select first position if enabled and no value is set
    useEffect(() => {
      if (selectFirstAsDefault && positions.length > 0 && !value && onChange) {
        const firstPositionId = positions[0].id;
        onChange(firstPositionId);
      }
    }, [value, onChange]);

    // Update display value when positions load or value changes
    useEffect(() => {
      if (!value) {
        setDisplayValue(null);
        return;
      }

      // Handle both string and number IDs by converting both to strings for comparison
      const position = positions.find(position => 
        String(position.id) === String(value)
      );
      
      if (position) {
        setDisplayValue({
          value: position.id,
          label: position.name
        });
      } else {
        // If position not found yet (still loading), show temporary label
        setDisplayValue({
          value: value,
          label: isLoading ? "Cargando..." : `Posición ${value}`
        });
      }
    }, [value]);

    // Update display when component receives new data (positions will change)
    if (value && positions.length > 0) {
      const position = positions.find(position => 
        String(position.id) === String(value)
      );
      
      if (position && (!displayValue || displayValue.label !== position.name)) {
        setDisplayValue({
          value: position.id,
          label: position.name
        });
      }
    }

    return (
      <Select
        style={{ width: '100%' }}
        placeholder={placeholder}
        loading={isLoading}
        allowClear
        showSearch
        labelInValue
        value={displayValue}
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        onChange={(selected) => {
          // Extract just the ID for the form
          onChange(selected?.value);
        }}
        notFoundContent={isLoading ? "Cargando..." : "No hay posiciones disponibles"}
      >
        {positions.map(position => (
          <Option key={position.id} value={position.id}>
            {position.name}
          </Option>
        ))}
      </Select>
    );
  };

  return (
    <Form.Item label="Posición" name={name} style={{ marginBottom: 0 }} rules={rules}>
      <PositionSelectField />
    </Form.Item>
  );
};

export default PositionSelect;
