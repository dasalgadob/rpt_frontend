"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Card, Col, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';
import CorporateGoalForm from './CorporateGoalForm';
import PeriodSelect from './PeriodSelect';
import { toast } from 'react-toastify';

const CorporateGoals = ({ companyId }) => {
  const [filterForm] = Form.useForm();
  const [periodFilter, setPeriodFilter] = useState(null);
  
  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add', // 'add' or 'edit'
    selectedRecord: null
  });

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/corporate_goals${periodFilter ? `?period_id=${periodFilter}` : ''}` : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Watch for form changes and trigger SWR revalidation
  const onFilterFormChange = (changedValues, allValues) => {
    if ('period' in changedValues) {
      setPeriodFilter(allValues.period);
    }
  };

  // Transform the response data to component format
  const goals = response?.data?.map(item => ({
    id: item.id,
    dimension_id: item.attributes.dimension_id,
    description: item.attributes.description,
    percentage: item.attributes.percentage,
    score: item.attributes.score,
    period: item.attributes.period,
  })) || [];

  const handleEdit = (record) => {
    setModalState({
      visible: true,
      mode: 'edit',
      selectedRecord: record
    });
  };

  const handleDelete = (record) => {
    toast.info(`Eliminando meta corporativa: ${record.id}`);
    // TODO: Implement delete functionality
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

  const handleModalSuccess = () => {
    mutate(); // Refresh the data
    setModalState({
      visible: false,
      mode: 'add',
      selectedRecord: null
    });
  };

  const columns = [
    {
      title: 'Dimensión',
      dataIndex: 'dimension_id',
      key: 'dimension_id',
      render: (dimension_id) => dimension_id || 'N/A',
      sorter: (a, b) => (a.dimension_id || 0) - (b.dimension_id || 0),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Porcentaje',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => percentage ? `${percentage}%` : 'N/A',
      sorter: (a, b) => (a.percentage || 0) - (b.percentage || 0),
    },
    {
      title: 'Evaluación',
      dataIndex: 'score',
      key: 'score',
      render: (score) => score || 'N/A',
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
    },
    {
      title: 'Periodo',
      dataIndex: 'period',
      key: 'period',
      render: (period) => period || 'N/A',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3 style={{ color: '#ff4d4f' }}>Error cargando metas corporativas</h3>
          <p>{error.message}</p>
          <Button onClick={() => mutate()}>Reintentar</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Form form={filterForm} onValuesChange={onFilterFormChange}>
        <Col span={4}>
          <PeriodSelect
              name="period"
              companyId={companyId}
              placeholder="Filtrar por periodo"
              selectFirstAsDefault={true}
          />
        </Col>
      </Form>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Metas Corporativas</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Añadir Meta
          </Button>
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={goals}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} metas`,
        }}
      />

      <CorporateGoalForm
        visible={modalState.visible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
        initialValues={modalState.selectedRecord}
        title={modalState.mode === 'add' ? 'Añadir Meta Corporativa' : 'Editar Meta Corporativa'}
        mode={modalState.mode}
        companyId={companyId}
      />
    </div>
  );
};

export default CorporateGoals;
