"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Card, message, Select, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import useSWR from 'swr';

const { Option } = Select;
const { Search } = Input;

// Fetcher function for SWR
const fetcher = async (url) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }

  const response = await fetch(`${apiUrl}${url}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  
  // Transform JSON API format to component format
  return result.data?.map(item => ({
    id: item.id,
    name: item.attributes.name,
    description: item.attributes.description,
    employeeName: item.attributes.employee_name,
    employeePosition: item.attributes.employee_position,
    department: item.attributes.department,
    status: item.attributes.status || 'Active',
    target: item.attributes.target,
    current: item.attributes.current || 0,
    progress: item.attributes.progress || 0,
    dueDate: item.attributes.due_date,
  })) || [];
};

const IndividualGoals = ({ companyId }) => {
  const [searchText, setSearchText] = useState('');
  
  const { data: goals, error, isLoading, mutate } = useSWR(
    companyId ? `/companies/${companyId}/individual-goals` : null,
    fetcher
  );

  const handleEdit = (record) => {
    message.info(`Editando meta individual: ${record.name}`);
    // TODO: Implement edit functionality
  };

  const handleDelete = (record) => {
    message.info(`Eliminando meta individual: ${record.name}`);
    // TODO: Implement delete functionality
  };

  const handleAdd = () => {
    message.info('Añadiendo nueva meta individual');
    // TODO: Implement add functionality
  };

  // Filter goals based on search text
  const filteredGoals = goals?.filter(goal =>
    !searchText || 
    goal.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    goal.employeeName?.toLowerCase().includes(searchText.toLowerCase()) ||
    goal.department?.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  // Get unique departments for filtering
  const departments = goals ? [...new Set(goals.map(g => g.department).filter(Boolean))] : [];

  const columns = [
    {
      title: 'Meta',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Empleado',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (name, record) => (
        <div>
          <div>{name || 'N/A'}</div>
          <small style={{ color: '#666' }}>{record.employeePosition || 'N/A'}</small>
        </div>
      ),
    },
    {
      title: 'Departamento',
      dataIndex: 'department',
      key: 'department',
      render: (department) => department || 'N/A',
      filters: departments.map(dept => ({ text: dept, value: dept })),
      onFilter: (value, record) => record.department === value,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Meta',
      dataIndex: 'target',
      key: 'target',
      render: (target) => target || 'N/A',
    },
    {
      title: 'Actual',
      dataIndex: 'current',
      key: 'current',
      render: (current) => current || 0,
    },
    {
      title: 'Progreso',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => {
        const percent = progress || 0;
        const color = percent >= 80 ? 'green' : percent >= 50 ? 'orange' : 'red';
        return <Tag color={color}>{percent}%</Tag>;
      },
    },
    {
      title: 'Fecha Límite',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => date || 'N/A',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Active' ? 'green' : status === 'Completed' ? 'blue' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Paused', value: 'Paused' },
      ],
      onFilter: (value, record) => record.status === value,
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
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Metas Individuales</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Añadir Meta
          </Button>
        </div>
        
        <Search
          placeholder="Buscar por meta, empleado o departamento..."
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredGoals}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} metas`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default IndividualGoals;
