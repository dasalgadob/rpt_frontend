"use client";

import React from 'react';
import { Table, Button, Space, Tag, Card, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useSWR from 'swr';

const { Option } = Select;

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
    area: item.attributes.area,
    status: item.attributes.status || 'Active',
    target: item.attributes.target,
    current: item.attributes.current || 0,
    progress: item.attributes.progress || 0,
    responsibleArea: item.attributes.responsible_area,
  })) || [];
};

const AreaGoals = ({ companyId }) => {
  const { data: goals, error, isLoading, mutate } = useSWR(
    companyId ? `/companies/${companyId}/area-goals` : null,
    fetcher
  );

  const handleEdit = (record) => {
    message.info(`Editando meta de área: ${record.name}`);
    // TODO: Implement edit functionality
  };

  const handleDelete = (record) => {
    message.info(`Eliminando meta de área: ${record.name}`);
    // TODO: Implement delete functionality
  };

  const handleAdd = () => {
    message.info('Añadiendo nueva meta de área');
    // TODO: Implement add functionality
  };

  // Get unique areas for filtering
  const areas = goals ? [...new Set(goals.map(g => g.area).filter(Boolean))] : [];

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Área',
      dataIndex: 'area',
      key: 'area',
      render: (area) => area || 'N/A',
      filters: areas.map(area => ({ text: area, value: area })),
      onFilter: (value, record) => record.area === value,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Responsable',
      dataIndex: 'responsibleArea',
      key: 'responsibleArea',
      render: (responsible) => responsible || 'N/A',
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
      render: (progress) => `${progress || 0}%`,
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
          <h3 style={{ color: '#ff4d4f' }}>Error cargando metas de área</h3>
          <p>{error.message}</p>
          <Button onClick={() => mutate()}>Reintentar</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Metas por Área</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Añadir Meta
        </Button>
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
    </div>
  );
};

export default AreaGoals;
