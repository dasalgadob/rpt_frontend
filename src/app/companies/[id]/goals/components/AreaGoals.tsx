"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Card, Col, Form, Row, Alert, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import DeleteButton from '@/components/DeleteButton';
import DownloadButton from '@/components/DownloadButton';
import UploadExcel from '@/components/UploadExcel';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';
import CorporateGoalForm from './CorporateGoalForm';
import PeriodSelect from './PeriodSelect';
import { toast } from 'react-toastify';
import AreasGoalForm from './AreasGoalForm';
import AreaFilterSelect from './AreaFilterSelect';
import EmployeeFilterSelect from '@/components/EmployeeFilterSelect';
import PeriodSelectFilter from '@/components/PeriodSelectFilter';

interface Period {
  id: string | number;
  name?: string;
}

interface Employee {
  id: string | number;
  name: string;
}

interface Goal {
  id: string | number;
  department?: string;
  department_id?: string | number;
  description?: string;
  percentage?: number | string;
  score?: number | string;
  period?: Period;
  employee?: Employee;
  goal?: string;
}

interface AreaGoalsProps {
  companyId: string | number;
}

const AreaGoals: React.FC<AreaGoalsProps> = ({ companyId }) => {
  const [filterForm] = Form.useForm();
  const [periodFilter, setPeriodFilter] = useState<string | number | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | number | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string | number | null>(null);

  const [modalState, setModalState] = useState<{
    visible: boolean;
    mode: 'add' | 'edit';
    selectedRecord: Goal | null;
  }>({
    visible: false,
    mode: 'add',
    selectedRecord: null
  });

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/department_goals`
        + `${periodFilter ? `?period_id=${periodFilter}` : ''}`
        + `${departmentFilter ? `${periodFilter ? '&' : '?'}department_id=${departmentFilter}` : ''}`
        + `${employeeFilter ? `${periodFilter || departmentFilter ? '&' : '?'}employee_id=${employeeFilter}` : ''}`
      : null,
    (url: string) => fetcher(url, { method: 'GET' })
  );

  const onFilterFormChange = (changedValues: any, allValues: any) => {
    if ('period' in changedValues) setPeriodFilter(allValues.period);
    if ('department_id' in changedValues) setDepartmentFilter(allValues.department_id);
    if ('employee_id' in changedValues) setEmployeeFilter(allValues.employee_id);
  };

  const goals: Goal[] = response?.data?.map((item: any) => ({
    id: item.id,
    department: item.attributes?.employee?.department?.name,
    department_id: item.attributes?.department_id,
    description: item.attributes?.description,
    percentage: item.attributes?.percentage,
    score: item.attributes?.score,
    period: item.attributes?.period ? {
      id: item.attributes.period.id,
      name: item.attributes.period.name
    } : undefined,
    employee: item.attributes?.employee ? {
      id: item.attributes.employee.id,
      name: item.attributes.employee.name
    } : undefined,
    goal: item.attributes?.goal
  })) || [];

  const departmentsOk: string = response?.departments_ok || '';
  const departmentsError: string = response?.departments_error || '';
  const apiTotalPercentage: number = parseFloat(response?.total_percentage || 0);
  const apiTotalScore: number = parseFloat(response?.total_score || 0);

  const getPercentageAlert = () => {
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
    const feedbackComponents = [] as React.ReactNode[];
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

  const handleEdit = (record: Goal) => {
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
    mutate();
    setModalState({
      visible: false,
      mode: 'add',
      selectedRecord: null
    });
  };

  const columns = [
    {
        title: 'Empleado',
        dataIndex: 'employee',
        key: 'employee',
        render: (employee: Employee | undefined) => employee?.name || ''
    },
    {
      title: 'Area',
      dataIndex: 'department',
      key: 'department',
      render: (text: string) => text || '',
      sorter: (a: Goal, b: Goal) => (a.department || 0).toString().localeCompare((b.department || 0).toString()),
    },
    {
      title: 'Meta',
      dataIndex: 'goal',
      key: 'goal',
      render: (text: string) => text || '',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '',
    },
    {
      title: 'Porcentaje',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number | string) => percentage ? `${percentage}%` : '',
      sorter: (a: Goal, b: Goal) => (Number(a.percentage) || 0) - (Number(b.percentage) || 0),
    },
    {
      title: 'Evaluación',
      dataIndex: 'score',
      key: 'score',
      render: (score: number | string) => score || '',
      sorter: (a: Goal, b: Goal) => (Number(a.score) || 0) - (Number(b.score) || 0),
    },
    {
      title: 'Periodo',
      dataIndex: 'period',
      key: 'period',
      render: (period: Period | undefined) => period?.name || '',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Goal) => (
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
      {getPercentageAlert()}
      {getDepartmentFeedback()}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Metas de Área</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <DownloadButton
            url={`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/department_goals/download${periodFilter ? `?period_id=${periodFilter}` : ''}`}
            filename="metas_area.xlsx"
            title="Descargar"
          />
          <UploadExcel
            url={`http://localhost:3010/companies/1/department_goals/upload`}
            title="Importar"
          />
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
