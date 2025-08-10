"use client";

import React, { useMemo, useEffect } from 'react';
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

  // Transform the response data to component format
  const dimensions = useMemo(() => {
    return response?.data?.map(item => ({
      id: item.id,
      name: item.attributes.name,
    })) || [];
  }, [response?.data]);

  // Create a select component that can handle auto-selection
  const DimensionSelectField = (props) => {
    const { value, onChange } = props;
    
    // Auto-select first dimension if enabled and no value is set
    useEffect(() => {
      if (selectFirstAsDefault && dimensions.length > 0 && !value && onChange) {
        const firstDimensionId = dimensions[0].id;
        onChange(firstDimensionId);
      }
    }, [value, onChange]);

    return (
      <Select
        style={{ width: '100%' }}
        placeholder={periodId ? placeholder : "Primero selecciona un periodo"}
        loading={isLoading}
        allowClear
        showSearch
        disabled={!periodId}
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...props}
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
