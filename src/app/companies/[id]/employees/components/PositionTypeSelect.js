"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Select, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useSWR, { mutate } from 'swr';
import { fetcher } from '../../../../../constants';
import CreatePositionTypeModal from './CreatePositionTypeModal';

const { Option } = Select;

const PositionTypeSelect = ({ 
  companyId, 
  placeholder = "Seleccionar tipo de posición",
  selectFirstAsDefault = false,
  rules = [],
  name
}) => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const swrKey = companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_types` : null;
  
  const { data: response, error, isLoading } = useSWR(
    swrKey,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Transform the response data to component format
  const positionTypes = useMemo(() => {
    return response?.data?.map(item => ({
      id: item.id,
      name: item.attributes.name,
    })) || [];
  }, [response?.data]);

  // Create a select component that can handle auto-selection
  const PositionTypeSelectField = (props) => {
    const { value, onChange } = props;
    const [displayValue, setDisplayValue] = useState(null);
    
    // Auto-select first position type if enabled and no value is set
    useEffect(() => {
      if (selectFirstAsDefault && positionTypes.length > 0 && !value && onChange) {
        const firstPositionTypeId = positionTypes[0].id;
        onChange(firstPositionTypeId);
      }
    }, [value, onChange]);

    // Update display value when position types load or value changes
    useEffect(() => {
      if (!value) {
        setDisplayValue(null);
        return;
      }

      // Handle both string and number IDs by converting both to strings for comparison
      const positionType = positionTypes.find(positionType => 
        String(positionType.id) === String(value)
      );
      
      if (positionType) {
        setDisplayValue({
          value: positionType.id,
          label: positionType.name
        });
      } else {
        // If position type not found yet (still loading), show temporary label
        setDisplayValue({
          value: value,
          label: isLoading ? "Cargando..." : `Tipo ${value}`
        });
      }
    }, [value]);

    // Update display when component receives new data (positionTypes will change)
    if (value && positionTypes.length > 0) {
      const positionType = positionTypes.find(positionType => 
        String(positionType.id) === String(value)
      );
      
      if (positionType && (!displayValue || displayValue.label !== positionType.name)) {
        setDisplayValue({
          value: positionType.id,
          label: positionType.name
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
          if (option?.key === 'create-position-type') return true;
          return option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={(selected) => {
          // Handle "create position type" option
          if (selected?.value === 'create-position-type') {
            setIsCreateModalVisible(true);
            return;
          }
          // Extract just the ID for the form
          onChange(selected?.value);
        }}
        notFoundContent={isLoading ? "Cargando..." : "No hay tipos de posición disponibles"}
      >
        <Option key="create-position-type" value="create-position-type" style={{ borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#1890ff' }}>
            <PlusOutlined style={{ marginRight: 8 }} />
            Crear Tipo de Posición
          </div>
        </Option>
        {positionTypes.map(positionType => (
          <Option key={positionType.id} value={positionType.id}>
            {positionType.name}
          </Option>
        ))}
      </Select>
    );
  };

  const handleCreatePositionTypeSuccess = (newPositionType) => {
    // Refresh the position types data
    mutate(swrKey);
    setIsCreateModalVisible(false);
  };

  const handleCreatePositionTypeCancel = () => {
    setIsCreateModalVisible(false);
  };

  return (
    <>
      <Form.Item label="Tipo de Posición" name={name} style={{ marginBottom: 0 }} rules={rules}>
        <PositionTypeSelectField />
      </Form.Item>
      
      <CreatePositionTypeModal
        visible={isCreateModalVisible}
        onCancel={handleCreatePositionTypeCancel}
        onSuccess={handleCreatePositionTypeSuccess}
        companyId={companyId}
      />
    </>
  );
};

export default PositionTypeSelect;
