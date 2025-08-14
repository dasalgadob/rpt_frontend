"use client";

import React, { useState } from 'react';
import { Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePositionTypes } from '../../../../hooks/usePositionTypes';
import CreatePositionTypeModal from './CreatePositionTypeModal';

const { Option } = Select;

const PositionTypeSelect = ({ 
  companyId, 
  placeholder = "Seleccionar tipo de posición",
  value,
  onChange,
  ...props
}) => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { positionTypes, isLoading, error, mutate } = usePositionTypes(companyId);

  console.log('PositionTypeSelect render:', { companyId, positionTypes, isLoading, error, value });

  // Use position types directly from the API
  let displayPositionTypes = positionTypes || [];
  
  // Si tenemos un valor inicial que no está en la lista, agregarlo temporalmente
  if (value && value.value) {
    const existsInList = displayPositionTypes.some(pt => pt.name === value.value);
    if (!existsInList) {
      displayPositionTypes = [
        ...displayPositionTypes,
        { id: 'temp-' + value.value, name: value.value }
      ];
    }
  }

  console.log('Final displayPositionTypes:', displayPositionTypes, 'Current value:', value);

  const handleCreatePositionTypeSuccess = (newPositionType) => {
    console.log('Position type created:', newPositionType);
    // Refresh the position types data
    mutate();
    setIsCreateModalVisible(false);
  };

  const handleCreatePositionTypeCancel = () => {
    setIsCreateModalVisible(false);
  };

  return (
    <>
      <Select
        style={{ width: '100%' }}
        placeholder={placeholder}
        loading={false} // Temporal: disable loading for debug
        allowClear
        showSearch
        labelInValue
        value={value}
        filterOption={(input, option) => {
          // Don't filter the "create" option
          if (option?.key === 'create-position-type') return true;
          return option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={(selected) => {
          console.log('Select onChange:', selected);
          // Handle "create position type" option
          if (selected?.value === 'create-position-type') {
            setIsCreateModalVisible(true);
            return;
          }
          // Pass the selected value to parent
          onChange && onChange(selected?.value);
        }}
        notFoundContent="No hay tipos de posición disponibles"
        {...props}
      >
        <Option key="create-position-type" value="create-position-type" style={{ borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#1890ff' }}>
            <PlusOutlined style={{ marginRight: 8 }} />
            Crear Tipo de Posición
          </div>
        </Option>
        {displayPositionTypes.map(positionType => (
          <Option key={positionType.id} value={positionType.id}>
            {positionType.name}
          </Option>
        ))}
      </Select>
      
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
