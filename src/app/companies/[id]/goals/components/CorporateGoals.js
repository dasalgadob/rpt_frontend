"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Card, Col, Form, Alert, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import DeleteButton from '@/components/DeleteButton';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';
import CorporateGoalForm from './CorporateGoalForm';
import PeriodSelect from './PeriodSelect';
import { toast } from 'react-toastify';
import PeriodSelectFilter from '@/components/PeriodSelectFilter';

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
    goal: item.attributes?.goal,
    goal_floor: item.attributes?.goal_floor,
    goal_value: item.attributes?.goal_value,
    goal_ceil: item.attributes?.goal_ceil,
    formula_below_value: item.attributes?.formula_below_value,
    formula_above_value: item.attributes?.formula_above_value,
    goal_achieved: item.attributes?.goal_achieved
  })) || [];

  // Get total percentage and score from API response
  const apiTotalPercentage = parseFloat(response?.total_percentage || 0);
  const apiTotalScore = parseFloat(response?.total_score || 0);
  
  const getPercentageAlert = () => {
    if (goals.length === 0) return null;
    
    if (apiTotalPercentage > 100) {
      return (
        <Alert
          message="⚠️ Advertencia: Porcentajes exceden el 100%"
          description={`La suma total de porcentajes es ${apiTotalPercentage.toFixed(1)}%. Los porcentajes de las metas corporativas deben sumar exactamente 100%.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    } else if (apiTotalPercentage < 100) {
      return (
        <Alert
          message="ℹ️ Información: Porcentajes incompletos"
          description={`La suma total de porcentajes es ${apiTotalPercentage.toFixed(1)}%. Los porcentajes de las metas corporativas deben sumar exactamente 100%. Faltan ${(100 - apiTotalPercentage).toFixed(1)} puntos porcentuales.`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    } else if (apiTotalPercentage === 100) {
      return (
        <Alert
          message="✅ Perfecto: Porcentajes balanceados"
          description={`La suma total de porcentajes es exactamente 100%. Las metas corporativas están correctamente balanceadas. Puntuación total: ${apiTotalScore.toFixed(1)} puntos.`}
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
      title: 'Meta',
      dataIndex: 'goal',
      key: 'goal',
      render: (text, record) => record.goal || 'N/A'
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 360, // Make description span 3 columns width
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
          <Tooltip title="Editar meta">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Eliminar meta">
            <DeleteButton
              endpoint={`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/corporate_goals`}
              id={record.id}
              onSuccess={mutate}
              confirmMessage={`¿Está seguro de eliminar la meta corporativa?\n\nEsta acción no se puede deshacer.`}
            />
          </Tooltip>
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
          <PeriodSelectFilter
              name="period"
              companyId={companyId}
              placeholder="Filtrar por periodo"
              selectFirstAsDefault={true}
          />
        </Col>
      </Form>
      
      {getPercentageAlert()}
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h3 style={{ margin: 0 }}>Metas Corporativas</h3>
          {apiTotalPercentage === 100 && (
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#52c41a',
              padding: '4px 12px',
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '6px'
            }}>
              📊 Puntuación Total: {apiTotalScore.toFixed(1)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Total: {goals.length} metas | Suma de porcentajes: {apiTotalPercentage.toFixed(1)}%
            {apiTotalPercentage === 100 && ` | Puntuación: ${apiTotalScore.toFixed(1)}`}
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
