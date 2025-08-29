"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Card, Col, Form, Row, Alert, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import DeleteButton from '@/components/DeleteButton';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';
import CorporateGoalForm from './CorporateGoalForm';
import PeriodSelect from './PeriodSelect';
import { toast } from 'react-toastify';
import AreasGoalForm from './AreasGoalForm';
import AreaFilterSelect from './AreaFilterSelect';
import EmployeeFilterSelect from '@/components/EmployeeFilterSelect';
import PeriodSelectFilter from '@/components/PeriodSelectFilter';

const AreaGoals = ({ companyId }) => {
  const [filterForm] = Form.useForm();
  const [periodFilter, setPeriodFilter] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState(null);

  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add', // 'add' or 'edit'
    selectedRecord: null
  });

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/department_goals`
        + `${periodFilter ? `?period_id=${periodFilter}` : ''}`
        + `${departmentFilter ? `${periodFilter ? '&' : '?'}department_id=${departmentFilter}` : ''}`
        + `${employeeFilter ? `${periodFilter || departmentFilter ? '&' : '?'}employee_id=${employeeFilter}` : ''}`
      : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Watch for form changes and trigger SWR revalidation
  const onFilterFormChange = (changedValues, allValues) => {
    if ('period' in changedValues) setPeriodFilter(allValues.period);
    if ('department_id' in changedValues) setDepartmentFilter(allValues.department_id);
    if ('employee_id' in changedValues) setEmployeeFilter(allValues.employee_id);
  };

  // Transform the response data to component format
  const goals = response?.data?.map(item => ({
    id: item.id,
    department: item.attributes?.employee?.department?.name,
    department_id: item.attributes?.department_id,
    description: item.attributes?.description,
    percentage: item.attributes?.percentage,
    score: item.attributes?.score,
    period: item.attributes?.period,
    employee: item.attributes?.employee,
    goal: item.attributes?.goal
  })) || [];

  // Get department feedback from API response
  const departmentsOk = response?.departments_ok || '';
  const departmentsError = response?.departments_error || '';
  
  // Get total percentage and score from API response (when department is selected)
  const apiTotalPercentage = parseFloat(response?.total_percentage || 0);
  const apiTotalScore = parseFloat(response?.total_score || 0);
  
  const getPercentageAlert = () => {
    // Only show percentage alerts when a department is selected and we have goals
    if (!departmentFilter || goals.length === 0) return null;
    
    if (apiTotalPercentage > 100) {
      return (
        <Alert
          message="⚠️ Advertencia: Porcentajes exceden el 100%"
          description={`La suma total de porcentajes es ${apiTotalPercentage.toFixed(1)}%. Los porcentajes de las metas de área deben sumar exactamente 100%.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    } else if (apiTotalPercentage < 100) {
      return (
        <Alert
          message="ℹ️ Información: Porcentajes incompletos"
          description={`La suma total de porcentajes es ${apiTotalPercentage.toFixed(1)}%. Los porcentajes de las metas de área deben sumar exactamente 100%. Faltan ${(100 - apiTotalPercentage).toFixed(1)} puntos porcentuales.`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    } else if (apiTotalPercentage === 100) {
      return (
        <Alert
          message="✅ Perfecto: Metas de Área tienen sus porcentajes al 100%"
          description={`La suma total de porcentajes es exactamente 100%. Las metas de área están correctamente balanceadas. Puntuación total: ${apiTotalScore.toFixed(1)} puntos.`}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    
    return null;
  };
  
  const getDepartmentFeedback = () => {
    const feedbackComponents = [];
    
    // Display departments with completion status
    if (departmentsOk) {
      feedbackComponents.push(
        <Alert
          key="departments-ok"
          message="✅ Estado de áreas"
          description={departmentsOk}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    
    // Display departments with errors
    if (departmentsError) {
      feedbackComponents.push(
        <Alert
          key="departments-error"
          message="⚠️ Áreas que requieren atención"
          description={departmentsError}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    
    return feedbackComponents;
  };

  const handleEdit = (record) => {
    setModalState({
      visible: true,
      mode: 'edit',
      selectedRecord: record
    });
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
      title: 'Area',
      dataIndex: 'department',
      key: 'department',
      render: (text) => text || 'N/A',
      sorter: (a, b) => (a.department || 0) - (b.department || 0),
    },
    {
      title: 'Meta',
      dataIndex: 'goal',
      key: 'goal',
      render: (text) => text || 'N/A',
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
              endpoint={`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/department_goals`}
              id={record.id}
              onSuccess={mutate}
              confirmMessage={`¿Está seguro de eliminar la meta de área?\n\nEsta acción no se puede deshacer.`}
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
          <h3 style={{ color: '#ff4d4f' }}>Error cargando metas de área</h3>
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
          <Col span={6}>
            <AreaFilterSelect
              name="department_id"
              companyId={companyId}
              placeholder="Filtrar por área"
            />
          </Col>
          <Col span={6}>
            <EmployeeFilterSelect
              name="employee_id"
              companyId={companyId}
              placeholder="Filtrar por empleado"
            />
          </Col>
        </Row>
      </Form>
      
      {/* Percentage validation alert for selected department */}
      {getPercentageAlert()}
      
      {/* Department feedback messages */}
      {getDepartmentFeedback()}
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Metas de Área</h3>
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

      <AreasGoalForm
        visible={modalState.visible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
        initialValues={modalState.selectedRecord}
        title={modalState.mode === 'add' ? 'Añadir Meta de Área' : 'Editar Meta de Área'}
        mode={modalState.mode}
        companyId={companyId}
      />
    </div>
  );
};

export default AreaGoals;
