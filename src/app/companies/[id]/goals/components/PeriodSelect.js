"use client";

import React, { useMemo, useEffect } from 'react';
import { Select, Form } from 'antd';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';

const { Option } = Select;

const PeriodSelect = ({ 
  companyId, 
  placeholder = "Seleccionar periodo",
  selectFirstAsDefault = false,
  rules = [],
  name
}) => {
  const { data: response, error, isLoading } = useSWR(
    companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods` : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Transform the response data to component format
  const periods = useMemo(() => {
    return response?.data?.map(item => ({
      id: item.id,
      name: item.attributes.name,
    })) || [];
  }, [response?.data]);

  // Create a select component that can handle auto-selection
  const PeriodSelectField = (props) => {
    const { value, onChange: formOnChange } = props;
    
    // Auto-select first period if enabled and no value is set
    useEffect(() => {
      if (selectFirstAsDefault && periods.length > 0 && !value && formOnChange) {
        const firstPeriodId = periods[0].id;
        formOnChange(firstPeriodId);
      }
    }, [value, formOnChange]); // Only essential dependencies

    return (
      <Select
        style={{ width: '100%' }}
        placeholder={placeholder}
        loading={isLoading}
        allowClear
        showSearch
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...props}
      >
        {periods.map(period => (
          <Option key={period.id} value={period.id}>
            {period.name}
          </Option>
        ))}
      </Select>
    );
  };

  return (
    <Form.Item label="Periodo" name={name} style={{ marginBottom: 0 }} rules={rules}>
      <PeriodSelectField />
    </Form.Item>
  );
};

export default PeriodSelect;
