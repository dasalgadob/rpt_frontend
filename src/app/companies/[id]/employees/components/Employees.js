"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Card, Col, Form, Row, Upload, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import DeleteButton from '@/components/DeleteButton';
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

  const handleDownload = async () => {
    try {
      toast.info('Iniciando descarga del archivo Excel...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employees/download.xlsx`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `empleados_empresa_${companyId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Archivo descargado exitosamente');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error al descargar el archivo. Inténtelo de nuevo.');
    }
  };

  const handleUpload = async (file) => {
    try {
      toast.info('Iniciando importación de empleados...');
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employees/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al procesar el archivo' }));
        throw new Error(errorData.message || 'Error al importar el archivo');
      }

      const result = await response.json();
      
      toast.success(`Archivo importado exitosamente. ${result.imported_count || 'Varios'} empleados procesados.`);
      mutate(); // Refresh the employee list
      
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Error al importar el archivo: ${error.message}`);
      return false; // Prevent default upload behavior
    }
  };

  const uploadProps = {
    name: 'file',
    accept: '.xlsx,.xls,.csv',
    showUploadList: false,
    beforeUpload: (file) => {
      // Validate file type
      const isValidType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                         file.type === 'application/vnd.ms-excel' || 
                         file.type === 'text/csv' ||
                         file.name.endsWith('.xlsx') ||
                         file.name.endsWith('.xls') ||
                         file.name.endsWith('.csv');
      
      if (!isValidType) {
        toast.error('Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)');
        return false;
      }

      // Validate file size (max 10MB)
      const isValidSize = file.size / 1024 / 1024 < 50;
      if (!isValidSize) {
        toast.error('El archivo debe ser menor a 50MB');
        return false;
      }

      return handleUpload(file);
    }
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
          <Tooltip title="Editar empleado">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Eliminar empleado">
            <DeleteButton
              endpoint={`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employees`}
              id={record.id}
              onSuccess={mutate}
              confirmMessage={`¿Está seguro de eliminar el empleado "${record.nombre}"?\n\nEsta acción no se puede deshacer.`}
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
          <div style={{ fontSize: '14px', color: '#666' }}>
            Total: {employees.length} empleados
          </div>
          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              title="Importar empleados desde Excel o CSV"
            >
              Importar
            </Button>
          </Upload>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            title="Descargar listado de empleados en Excel"
          >
            Descargar
          </Button>
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
