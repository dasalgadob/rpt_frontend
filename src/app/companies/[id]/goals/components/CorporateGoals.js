"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Card, Col, Form, Alert } from 'antd';
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
    dimension_id: item.attributes?.dimension.id,
    dimension: item.attributes?.dimension,
    description: item.attributes?.description,
    percentage: item.attributes?.percentage,
    score: item.attributes?.score,
    period: item.attributes?.period,
  })) || [];

  // Calculate total percentage and generate alert message
  const totalPercentage = goals.reduce((sum, goal) => sum + (goal.percentage || 0), 0);
  
  const getPercentageAlert = () => {
    if (goals.length === 0) return null;
    
    if (totalPercentage > 100) {
      return (
        <Alert
          message="⚠️ Advertencia: Porcentajes exceden el 100%"
          description={`La suma total de porcentajes es ${totalPercentage.toFixed(1)}%. Los porcentajes de las metas corporativas deben sumar exactamente 100%.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    } else if (totalPercentage < 100) {
      return (
        <Alert
          message="ℹ️ Información: Porcentajes incompletos"
          description={`La suma total de porcentajes es ${totalPercentage.toFixed(1)}%. Los porcentajes de las metas corporativas deben sumar exactamente 100%. Faltan ${(100 - totalPercentage).toFixed(1)} puntos porcentuales.`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    } else if (totalPercentage === 100) {
      return (
        <Alert
          message="✅ Perfecto: Porcentajes balanceados"
          description={`La suma total de porcentajes es exactamente 100%. Las metas corporativas están correctamente balanceadas.`}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    
    return null;
  };

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
      dataIndex: 'dimension',
      key: 'dimension_id',
      render: (dimension) => dimension?.name || 'N/A',
      sorter: (a, b) => (a.dimension?.name || 0) - (b.dimension?.name || 0),
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
      render: (period) => period?.name || 'N/A',
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
      
      {getPercentageAlert()}
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Metas Corporativas</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Total: {goals.length} metas | Suma de porcentajes: {totalPercentage.toFixed(1)}%
          </div>
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
