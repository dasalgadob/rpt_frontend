"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Card, Col, Form, Row } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';
import CorporateGoalForm from './CorporateGoalForm';
import PeriodSelect from './PeriodSelect';
import { toast } from 'react-toastify';
import AreasGoalForm from './AreasGoalForm';
import AreaFilterSelect from './AreaFilterSelect';
import PositionFilterSelect from './PositionFilterSelect';
import IndividualGoalForm from './IndividualGoalForm';

const IndividualGoals = ({ companyId }) => {
  const [filterForm] = Form.useForm();
  const [periodFilter, setPeriodFilter] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [positionFilter, setPositionFilter] = useState(null);

  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add', // 'add' or 'edit'
    selectedRecord: null
  });

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_goals`
        + `${periodFilter ? `?period_id=${periodFilter}` : ''}`
        + `${departmentFilter ? `${periodFilter ? '&' : '?'}department_id=${departmentFilter}` : ''}`
        + `${positionFilter ? `${periodFilter || departmentFilter ? '&' : '?'}position_id=${positionFilter}` : ''}`
      : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Watch for form changes and trigger SWR revalidation
  const onFilterFormChange = (changedValues, allValues) => {
    if ('period' in changedValues) setPeriodFilter(allValues.period);
    if ('department_id' in changedValues) setDepartmentFilter(allValues.department_id);
    if ('position_id' in changedValues) setPositionFilter(allValues.position_id);
  };

  // Transform the response data to component format
  const goals = response?.data?.map(item => ({
    employee_id: item.attributes?.employee_id,
    employee_name: item.attributes?.employee_name,
    id: item.id,
    department: item.attributes?.department_name,
    department_id: item.attributes?.department_id,
    description: item.attributes?.description,
    percentage: item.attributes?.percentage,
    score: item.attributes?.score,
    period: item.attributes?.period_name,
    position: item.attributes?.position_name,
    position_id: item.attributes?.position_id
  })) || [];

  const handleEdit = (record) => {
    setModalState({
      visible: true,
      mode: 'edit',
      selectedRecord: record
    });
  };

  const handleDelete = async (record) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_goals/${record.id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        toast.success('Meta individual eliminada correctamente');
        mutate(); // Refresca la tabla
      } else {
        toast.error('No se pudo eliminar la meta individual');
      }
    } catch (error) {
      toast.error('Error al eliminar la meta individual');
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
      title: 'Empleado',
      dataIndex: 'employee_name',
      key: 'employee_id',
      render: (text) => text || 'N/A',
      sorter: (a, b) => (a.employee_name || 0) - (b.employee_name || 0),
    },
    {
      title: 'Area',
      dataIndex: 'department',
      key: 'department',
      render: (text) => text || 'N/A',
      sorter: (a, b) => (a.department?.name || 0) - (b.department?.name || 0),
    },
    {
      title: 'Posicion',
      dataIndex: 'position',
      key: 'position',
      render: (text) => text || 'N/A',
      sorter: (a, b) => (a.department?.name || 0) - (b.department?.name || 0),
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
      render: (text) => text || 'N/A',
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
          <h3 style={{ color: '#ff4d4f' }}>Error cargando metas individuales</h3>
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
            <PeriodSelect
              name="period"
              companyId={companyId}
              placeholder="Filtrar por periodo"
            selectFirstAsDefault={true}
          />
        </Col>
        <Col span={6}>
          <AreaFilterSelect
            name="department_id"
            companyId={companyId}
            placeholder="Filtrar por área"
          />
        </Col>
        <Col span={6}>
          <PositionFilterSelect
            name="position_id"
            companyId={companyId}
            placeholder="Filtrar por posición"
          />
        </Col>
        </Row>
      </Form>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Metas Individuales</h3>
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

      <IndividualGoalForm
        visible={modalState.visible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
        initialValues={modalState.selectedRecord}
        title={modalState.mode === 'add' ? 'Añadir Meta Individual' : 'Editar Meta Individual'}
        mode={modalState.mode}
        companyId={companyId}
      />
    </div>
  );
};

export default IndividualGoals;
