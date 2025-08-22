"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { Select, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useSWR, { mutate } from 'swr';
import { fetcher } from '../../../../../constants';
import CreatePositionTypeModal from '../../employees/components/CreatePositionTypeModal';

const { Option } = Select;

const PositionTypeSelectMultiple = ({ 
  companyId, 
  placeholder = "Seleccionar tipos de posición",
  selectFirstAsDefault = false,
  rules = [],
  name,
  label = "Tipos de Posición"
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

  // Create a select component that can handle auto-selection and multiple values
  const PositionTypeSelectMultipleField = (props) => {
    const { value, onChange } = props;
    
    // Auto-select first position type if enabled and no value is set
    useEffect(() => {
      if (selectFirstAsDefault && positionTypes.length > 0 && (!value || value.length === 0) && onChange) {
        const firstPositionTypeId = positionTypes[0].id;
        onChange([firstPositionTypeId]);
      }
    }, [value, onChange]);

    // Calculate display value - convert IDs to label-value objects
    const getDisplayValue = () => {
      if (!value || value.length === 0) {
        return [];
      }

      return value.map(id => {
        const positionType = positionTypes.find(positionType => 
          String(positionType.id) === String(id)
        );
        
        if (positionType) {
          return {
            value: positionType.id,
            label: positionType.name
          };
        } else {
          return {
            value: id,
            label: isLoading ? "Cargando..." : `Tipo ${id}`
          };
        }
      });
    };

    return (
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder={placeholder}
        loading={isLoading}
        allowClear
        showSearch
        labelInValue
        value={getDisplayValue()}
        filterOption={(input, option) => {
          // Don't filter the "create" option
          if (option?.key === 'create-position-type') return true;
          return option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        onChange={(selected) => {
          // Handle "create position type" option
          const createOption = selected.find(item => item?.value === 'create-position-type');
          if (createOption) {
            // Remove the create option from selection and open modal
            const filteredSelection = selected.filter(item => item?.value !== 'create-position-type');
            setIsCreateModalVisible(true);
            // Keep the current selection without the create option
            const ids = filteredSelection.map(item => item.value);
            onChange(ids);
            return;
          }
          // Extract just the IDs for the form
          const ids = selected.map(item => item.value);
          onChange(ids);
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
      <Form.Item label={label} name={name} style={{ marginBottom: 0 }} rules={rules}>
        <PositionTypeSelectMultipleField />
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

export default PositionTypeSelectMultiple;
