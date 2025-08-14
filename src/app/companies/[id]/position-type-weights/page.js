"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { 
  Table, 
  Button, 
  Select, 
  Space, 
  Tag, 
  Tooltip,
  Flex,
  Form,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { fetcher } from '../../../../constants';
import PositionTypeWeightsForm from './PositionTypeWeightsForm';
import PeriodSelect from '../goals/components/PeriodSelect';
import { useCompanyPositionTypeWeights, usePositionTypeWeightOperations } from '../../../../hooks/usePositionTypeWeights';

const PositionTypeWeightsPage = () => {
  const params = useParams();
  const { id } = params; // Company ID from URL
  const [periodFilter, setPeriodFilter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [filterForm] = Form.useForm();

  // Usar hook personalizado de SWR para position type weights
  const { weights: weightsData, isLoading, isError: error, mutate } = useCompanyPositionTypeWeights(id, periodFilter);
  const { deletePositionTypeWeight } = usePositionTypeWeightOperations();

  // Listen for localStorage changes to refresh data
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage changed, refreshing weights data...');
      mutate(); // Refresh the data when localStorage changes
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events for same-tab localStorage changes
    window.addEventListener('localStorageChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, [mutate]);

  // Los datos ya vienen procesados del hook
  const allWeights = weightsData || [];

  console.log('Position Type Weights Page:', { id, weightsData, error, isLoading, allWeights });

  // Watch for form changes and trigger SWR revalidation
  const onFilterFormChange = (changedValues, allValues) => {
    if ('period' in changedValues) {
      setPeriodFilter(allValues.period);
    }
  };

  // Los datos ya vienen procesados del hook - sin filtro de búsqueda local
  const filteredWeights = allWeights;

  // Table columns configuration
  const columns = [
    {
      title: 'Tipo de posición',
      dataIndex: 'position_type',
      key: 'position_type',
      sorter: (a, b) => (a.position_type || '').localeCompare(b.position_type || ''),
      render: (text) => text || 'N/A',
    },
    {
      title: 'Corporativo',
      dataIndex: 'corporativo',
      key: 'corporativo',
      sorter: (a, b) => (a.corporativo || 0) - (b.corporativo || 0),
      render: (value) => value ? `${value}%` : '0%',
      align: 'center',
    },
    {
      title: 'Área',
      dataIndex: 'area',
      key: 'area',
      sorter: (a, b) => (a.area || 0) - (b.area || 0),
      render: (value) => value ? `${value}%` : '0%',
      align: 'center',
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
      sorter: (a, b) => (a.cargo || 0) - (b.cargo || 0),
      render: (value) => value ? `${value}%` : '0%',
      align: 'center',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      sorter: (a, b) => (a.total || 0) - (b.total || 0),
      render: (value, record) => {
        const total = (record.corporativo || 0) + (record.area || 0) + (record.cargo || 0);
        const color = total === 100 ? 'green' : total > 100 ? 'red' : 'orange';
        return <Tag color={color}>{total}%</Tag>;
      },
      align: 'center',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Action handlers
  const handleEdit = (weight) => {
    setModalMode('edit');
    setSelectedWeight(weight);
    setModalVisible(true);
  };

  const handleDelete = async (weight) => {
    const confirmDelete = window.confirm(
      `¿Está seguro de eliminar el peso para "${weight.position_type}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (confirmDelete) {
      try {
        const result = await deletePositionTypeWeight(id, weight.id);
        
        if (result.success) {
          message.success(`Peso para "${weight.position_type}" eliminado correctamente`);
          // Revalidar los datos después de eliminar
          await mutate();
        } else {
          message.error(result.error || 'Error al eliminar el peso');
        }
      } catch (error) {
        console.error('Error inesperado en eliminación:', error);
        message.error('Error inesperado al eliminar el peso');
      }
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedWeight(null);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedWeight(null);
  };

  const handleFormSuccess = () => {
    // Revalidar los datos después de la operación exitosa
    mutate();
    setModalVisible(false);
    setSelectedWeight(null);
  };

  // Loading and error states
  if (error && !allWeights.length) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        border: '1px solid #ff4d4f',
        borderRadius: '6px',
        backgroundColor: '#fff2f0'
      }}>
        <h3 style={{ color: '#ff4d4f' }}>Error al cargar los pesos de tipo de posición</h3>
        <p>{error.message}</p>
        <Button type="primary" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }
  
  if (isLoading && !allWeights.length) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Cargando pesos de tipo de posición...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with period selection and add button */}
      <Flex justify="space-between" align="center" style={{ marginBottom: '16px' }}>
        <Form 
          form={filterForm}
          onValuesChange={onFilterFormChange}
          style={{ margin: 0 }}
        >
          <PeriodSelect 
            companyId={id}
            name="period"
            placeholder="Seleccionar período"
            selectFirstAsDefault={false}
            rules={[]}
          />
        </Form>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Añadir
        </Button>
      </Flex>
       
      {/* Position Type Weights table */}
      <Table
        columns={columns}
        dataSource={filteredWeights}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} de ${total} pesos de tipo de posición`,
        }}
        loading={false} // Temporal: disable loading for debug
      />

      {/* Modal para crear/editar pesos */}
      <PositionTypeWeightsForm
        visible={modalVisible}
        onCancel={handleModalCancel}
        onSuccess={handleFormSuccess}
        initialValues={selectedWeight}
        mode={modalMode}
        companyId={id}
      />
    </div>
  );
};

export default PositionTypeWeightsPage;
