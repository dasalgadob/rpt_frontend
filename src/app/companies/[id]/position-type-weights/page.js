"use client";

import React, { useState } from 'react';
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
import DeleteButton from '@/components/DeleteButton';


const PositionTypeWeightsPage = () => {
  const params = useParams();
  const { id } = params; // Company ID from URL
  const [periodFilter, setPeriodFilter] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [filterForm] = Form.useForm();


  // Hook para obtener los datos desde el endpoint (sin localStorage)
  const { weights: allWeights, isLoading, isError: error, mutate } = useCompanyPositionTypeWeights(id, periodFilter);

  console.log('Position Type Weights Page:', { id, allWeights, error, isLoading });

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
      dataIndex: ['attributes', 'position_type_name'],
      key: 'position_type_name',
      render: (text, record) => record.attributes?.position_type_name || 'N/A',
    },
    {
      title: 'Corporativo',
      dataIndex: ['attributes', 'corporate_percentage'],
      key: 'corporate_percentage',
      render: (value, record) => record.attributes?.corporate_percentage ? `${record.attributes.corporate_percentage}%` : '0%',
      align: 'center',
    },
    {
      title: 'Área',
      dataIndex: ['attributes', 'department_percentage'],
      key: 'department_percentage',
      render: (value, record) => record.attributes?.department_percentage ? `${record.attributes.department_percentage}%` : '0%',
      align: 'center',
    },
    {
      title: 'Cargo',
      dataIndex: ['attributes', 'position_percentage'],
      key: 'position_percentage',
      render: (value, record) => record.attributes?.position_percentage ? `${record.attributes.position_percentage}%` : '0%',
      align: 'center',
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => {
        const total =
          Number(record.attributes?.corporate_percentage || 0) +
          Number(record.attributes?.department_percentage || 0) +
          Number(record.attributes?.position_percentage || 0);
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
            <DeleteButton
              endpoint={`${process.env.NEXT_PUBLIC_API_URL}/companies/${id}/position_type_weights`}
              id={record.id}
              onSuccess={mutate}
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
