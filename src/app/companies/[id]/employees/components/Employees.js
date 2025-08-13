"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Card, Col, Form, Row } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { fetcher } from '@/constants';
import { toast } from 'react-toastify';
import AreaFilterSelect from '../../goals/components/AreaFilterSelect';
import PositionFilterSelect from './PositionFilterSelect';
import PositionTypeFilterSelect from './PositionTypeFilterSelect';
import EmployeeForm from './EmployeeForm';

const Employees = ({ companyId }) => {
  const [filterForm] = Form.useForm();
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [positionFilter, setPositionFilter] = useState(null);
  const [positionTypeFilter, setPositionTypeFilter] = useState(null);

  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add', // 'add' or 'edit'
    selectedRecord: null
  });

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employees`
        + `${departmentFilter ? `?department_id=${departmentFilter}` : ''}`
        + `${positionFilter ? `${departmentFilter ? '&' : '?'}position_id=${positionFilter}` : ''}`
        + `${positionTypeFilter ? `${departmentFilter || positionFilter ? '&' : '?'}position_type_id=${positionTypeFilter}` : ''}`
      : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Watch for form changes and trigger SWR revalidation
  const onFilterFormChange = (changedValues, allValues) => {
    if ('department_id' in changedValues) setDepartmentFilter(allValues.department_id);
    if ('position_id' in changedValues) setPositionFilter(allValues.position_id);
    if ('position_type_id' in changedValues) setPositionTypeFilter(allValues.position_type_id);
  };

  // Transform the response data to component format
  const employees = response?.data?.map(item => ({
    id: item.id,
    employee_id: item.attributes?.employee_id,
    nombre: item.attributes?.name,
    area: item.attributes?.department_name,
    department_id: item.attributes?.department_id,
    posicion: item.attributes?.position_name,
    position_id: item.attributes?.position_id,
    tipo_posicion: item.attributes?.position_type_name,
    position_type_id: item.attributes?.position_type_id
  })) || [];

  const handleEdit = (record) => {
    setModalState({
      visible: true,
      mode: 'edit',
      selectedRecord: record
    });
  };

  const handleDelete = (record) => {
    toast.info(`Eliminando empleado: ${record.nombre}`);
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
      title: 'ID',
      dataIndex: 'employee_id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text) => text || 'N/A',
      sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
    },
    {
      title: 'Área',
      dataIndex: 'area',
      key: 'area',
      render: (text) => text || 'N/A',
      sorter: (a, b) => (a.area || '').localeCompare(b.area || ''),
    },
    {
      title: 'Posición',
      dataIndex: 'posicion',
      key: 'posicion',
      render: (text) => text || 'N/A',
      sorter: (a, b) => (a.posicion || '').localeCompare(b.posicion || ''),
    },
    {
      title: 'Tipo de Posición',
      dataIndex: 'tipo_posicion',
      key: 'tipo_posicion',
      render: (text) => text || 'N/A',
      sorter: (a, b) => (a.tipo_posicion || '').localeCompare(b.tipo_posicion || ''),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
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
          <h3 style={{ color: '#ff4d4f' }}>Error cargando empleados</h3>
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
          <Col span={6}>
            <PositionTypeFilterSelect
              name="position_type_id"
              companyId={companyId}
              placeholder="Filtrar por tipo de posición"
            />
          </Col>
        </Row>
      </Form>
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Empleados</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Añadir Empleado
          </Button>
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={employees}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} empleados`,
        }}
      />

      <EmployeeForm
        visible={modalState.visible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
        initialValues={modalState.selectedRecord}
        title={modalState.mode === 'add' ? 'Añadir Empleado' : 'Editar Empleado'}
        mode={modalState.mode}
        companyId={companyId}
      />
    </div>
  );
};

export default Employees;
