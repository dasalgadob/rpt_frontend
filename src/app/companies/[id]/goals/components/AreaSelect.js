"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Select, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useSWR, { mutate } from 'swr';
import { fetcher } from '../../../../../constants';
import CreateAreaModal from './CreateAreaModal';

const { Option } = Select;

const AreaSelect = ({ 
  companyId, 
  placeholder = "Seleccionar área",
  selectFirstAsDefault = false,
  rules = [],
  name
}) => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const swrKey = companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/departments` : null;
  
  const { data: response, error, isLoading } = useSWR(
    swrKey,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Transform the response data to component format
  const areas = useMemo(() => {
    return response?.data?.map(item => ({
      id: item.id,
      name: item.attributes.name,
    })) || [];
  }, [response?.data]);

  // Create a select component that can handle auto-selection
  const AreaSelectField = (props) => {
    const { value, onChange } = props;
    const [displayValue, setDisplayValue] = useState(null);
    
    // Auto-select first area if enabled and no value is set
    useEffect(() => {
      if (selectFirstAsDefault && areas.length > 0 && !value && onChange) {
        const firstAreaId = areas[0].id;
        onChange(firstAreaId);
      }
    }, [value, onChange]);

    // Update display value when areas load or value changes
    useEffect(() => {
      if (!value) {
        setDisplayValue(null);
        return;
      }

      // Handle both string and number IDs by converting both to strings for comparison
      const area = areas.find(area => 
        String(area.id) === String(value)
      );
      
      if (area) {
        setDisplayValue({
          value: area.id,
          label: area.name
        });
      } else {
        // If area not found yet (still loading), show temporary label
        setDisplayValue({
          value: value,
          label: isLoading ? "Cargando..." : `Área ${value}`
        });
      }
    }, [value]);

    // Update display when component receives new data (areas will change)
    if (value && areas.length > 0) {
      const area = areas.find(area => 
        String(area.id) === String(value)
      );
      
      if (area && (!displayValue || displayValue.label !== area.name)) {
        setDisplayValue({
          value: area.id,
          label: area.name
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
        filterOption={(input, option) => {
          // Don't filter the "create" option
          if (option?.key === 'create-area') return true;
          return option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={(selected) => {
          // Handle "create area" option
          if (selected?.value === 'create-area') {
            setIsCreateModalVisible(true);
            return;
          }
          // Extract just the ID for the form
          onChange(selected?.value);
        }}
        notFoundContent={isLoading ? "Cargando..." : "No hay áreas disponibles"}
      >
        <Option key="create-area" value="create-area" style={{ borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#1890ff' }}>
            <PlusOutlined style={{ marginRight: 8 }} />
            Crear Area
          </div>
        </Option>
        {areas.map(area => (
          <Option key={area.id} value={area.id}>
            {area.name}
          </Option>
        ))}
      </Select>
    );
  };

  const handleCreateAreaSuccess = (newArea) => {
    // Refresh the areas data
    mutate(swrKey);
    setIsCreateModalVisible(false);
  };

  const handleCreateAreaCancel = () => {
    setIsCreateModalVisible(false);
  };

  return (
    <>
      <Form.Item label="Área" name={name} style={{ marginBottom: 0 }} rules={rules}>
        <AreaSelectField />
      </Form.Item>
      
      <CreateAreaModal
        visible={isCreateModalVisible}
        onCancel={handleCreateAreaCancel}
        onSuccess={handleCreateAreaSuccess}
        companyId={companyId}
      />
    </>
  );
};

export default AreaSelect;
