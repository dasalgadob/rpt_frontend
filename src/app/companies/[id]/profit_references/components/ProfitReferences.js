"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Card, Col, Form, Row, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';
import { toast } from 'react-toastify';
import PeriodSelect from '../../goals/components/PeriodSelect';
import ProfitReferenceForm from './ProfitReferenceForm';
import ReferenceCompensationModal from './ReferenceCompensationModal';
import PeriodSelectFilter from '@/components/PeriodSelectFilter';

const ProfitReferences = ({ companyId }) => {
  const [filterForm] = Form.useForm();
  const [periodFilter, setPeriodFilter] = useState(null);

  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add', // 'add' or 'edit'
    selectedRecord: null
  });

  const [viewModalState, setViewModalState] = useState({
    visible: false,
    profitReferenceId: null
  });

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/profit_references`
        + `${periodFilter ? `?period_id=${periodFilter}` : ''}`
      : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  // SWR mutation for deleting profit references
  const { trigger: deleteProfitReference, isMutating: isDeleting } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/profit_references`,
    async (url, { arg }) => {
      return fetcher(`${url}/${arg.id}`, {
        method: 'DELETE'
      });
    }
  );

  // Watch for form changes and trigger SWR revalidation
  const onFilterFormChange = (changedValues, allValues) => {
    if ('period' in changedValues) setPeriodFilter(allValues.period);
  };

  // Transform the response data to component format
  const profitReferences = response?.data?.map(item => ({
    id: item.id,
    period: item.attributes?.period_name,
    period_id: item.attributes?.period_id,
    since_percentage_profit: item.attributes?.since_percentage_profit,
    position_types: item.attributes?.profit_reference_has_position_types_data || [],
    equation: item.attributes?.equation
  })) || [];

  const handleEdit = (record) => {
    // Extract position_type_ids from the position_types data
    const position_type_ids = record.position_types?.map(item => item.position_type_id) || [];
    
    const recordWithPositionTypeIds = {
      ...record,
      position_type_ids
    };
    
    setModalState({
      visible: true,
      mode: 'edit',
      selectedRecord: recordWithPositionTypeIds
    });
  };

  const handleView = (record) => {
    setViewModalState({
      visible: true,
      profitReferenceId: record.id
    });
  };

  const handleDelete = async (record) => {
    try {
      await deleteProfitReference({ id: record.id });
      toast.success(`Referencia de compensación eliminada exitosamente`);
      mutate(); // Refresh the data
    } catch (error) {
      console.error('Error deleting profit reference:', error);
      toast.error('Error al eliminar la referencia de compensación');
    }
  };

  const handleAdd = () => {
    setModalState({
      visible: true,
      mode: 'add',
      selectedRecord: null
    });
  };

  const handleModalCancel = () => {
    setModalState(prev => ({
      ...prev,
      visible: false,
      selectedRecord: null
    }));
  };

  const handleViewModalCancel = () => {
    setViewModalState({
      visible: false,
      profitReferenceId: null
    });
  };

  const handleModalSuccess = () => {
    mutate(); // Refresh the data
    setModalState({
      visible: false,
      mode: 'add',
      selectedRecord: null
    });
  };

  // Helper function to render profit percentage with color coding
  const renderProfitPercentage = (percentage) => {
    let color = '#1890ff'; // Default blue
    
    if (percentage >= 15) color = '#52c41a'; // Green for high profit
    else if (percentage >= 10) color = '#faad14'; // Orange for medium profit
    else if (percentage >= 5) color = '#fa8c16'; // Orange-red for low profit
    else color = '#f5222d'; // Red for very low profit

    return (
      <Tag color={color} style={{ fontSize: '14px', padding: '4px 8px' }}>
        {percentage}%
      </Tag>
    );
  };

  // Helper function to render position types
  const renderPositionTypes = (positionTypes) => {
    if (!positionTypes || positionTypes.length === 0) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>Sin tipos de posición</span>;
    }

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {positionTypes.map((item, index) => (
          <Tag 
            key={item.id || index} 
            color="#722ed1" 
            style={{ fontSize: '12px', margin: '2px 0' }}
          >
            {item.position_type_name}
          </Tag>
        ))}
      </div>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Periodo',
      dataIndex: 'period',
      key: 'period',
      width: 200,
      render: (text) => text || '',
      sorter: (a, b) => (a.period || '').localeCompare(b.period || ''),
    },
    {
      title: 'Porcentaje de Ganancia (%)',
      dataIndex: 'since_percentage_profit',
      key: 'since_percentage_profit',
      width: 200,
      render: renderProfitPercentage,
      sorter: (a, b) => (a.since_percentage_profit || 0) - (b.since_percentage_profit || 0),
    },
    {
        title: 'Ecuación',
        dataIndex: 'equation',
        key: 'equation'
    },
    {
      title: 'Tipos de Posición',
      dataIndex: 'position_types',
      key: 'position_types',
      width: 250,
      render: renderPositionTypes,
      sorter: (a, b) => {
        const aCount = a.position_types?.length || 0;
        const bCount = b.position_types?.length || 0;
        return aCount - bCount;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
            title="Ver detalles"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            title="Editar referencia"
          />
          <Popconfirm
            title="Eliminar referencia de compensación"
            description={`¿Está seguro que desea eliminar la referencia del periodo "${record.period}"?`}
            onConfirm={() => handleDelete(record)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Eliminar referencia"
              loading={isDeleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3 style={{ color: '#ff4d4f' }}>Error cargando referencias de compensación</h3>
          <p>{error.message}</p>
          <Button onClick={() => mutate()}>Reintentar</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Form form={filterForm} onValuesChange={onFilterFormChange}>
        <Row gutter={16}>
          <Col span={6}>
            <PeriodSelectFilter
              name="period"
              companyId={companyId}
              placeholder="Filtrar por periodo"
              selectFirstAsDefault={true}
            />
          </Col>
        </Row>
      </Form>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Referencias de Compensación</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Total: {profitReferences.length} referencias
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Añadir Referencia
          </Button>
        </div>
      </div>
      
      <Card>
        <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#389e0d' }}>💰 Información sobre Referencias de Compensación</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#52c41a' }}>
            Las referencias de compensación definen los porcentajes de ganancia esperados por periodo.
            Estos valores se utilizan como base para calcular bonificaciones y compensaciones variables.
          </p>
        </div>

        <Table
          columns={columns}
          dataSource={profitReferences}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} referencias`,
          }}
        />
      </Card>

      <ProfitReferenceForm
        visible={modalState.visible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
        initialValues={modalState.selectedRecord}
        title={modalState.mode === 'add' ? 'Añadir Referencia de Compensación' : 'Editar Referencia de Compensación'}
        mode={modalState.mode}
        companyId={companyId}
      />

      <ReferenceCompensationModal
        visible={viewModalState.visible}
        onCancel={handleViewModalCancel}
        profitReferenceId={viewModalState.profitReferenceId}
        companyId={companyId}
      />
    </div>
  );
};

export default ProfitReferences;
