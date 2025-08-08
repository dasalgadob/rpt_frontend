"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { 
  Table, 
  Button, 
  Select, 
  Space, 
  Tag, 
  Tooltip,
  Flex
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined 
} from '@ant-design/icons';

// Fetcher function for SWR - real API request
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
  
  // Transform JSON API format to our component format
  return result.data?.map(item => ({
    id: item.id,
    name: item.attributes.name,
    type: item.attributes.period_type || 'N/A',
    status: item.attributes.status || 'N/A',
    companyId: item.relationships?.company?.data?.id
  })) || [];
};

const PeriodsPage = () => {
  const params = useParams();
  const { id } = params; // Company ID from URL
  const [searchValue, setSearchValue] = useState(null);

  // SWR call to fetch periods data
  const { data: periods, error, isLoading } = useSWR(
    id ? `/companies/${id}/periods` : null,
    fetcher
  );

  // Handle search/filter
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  // Filter periods based on search
  const filteredPeriods = periods?.filter(period => 
    !searchValue || period.name?.toLowerCase().includes(searchValue.toLowerCase())
  ) || [];

  // Table columns configuration
  const columns = [
    {
      title: 'Periodo',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Semestre', value: 'Semestre' },
        { text: 'Bimestre', value: 'Bimestre' },
        { text: 'Trimestre', value: 'Trimestre' },
        { text: 'N/A', value: 'N/A' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) => type || 'N/A',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status || status === 'N/A') {
          return <Tag color="default">N/A</Tag>;
        }
        const color = status === 'Abierto' ? 'cyan' : 'volcano';
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Abierto', value: 'Abierto' },
        { text: 'Cerrado', value: 'Cerrado' },
        { text: 'N/A', value: 'N/A' },
      ],
      onFilter: (value, record) => (record.status || 'N/A') === value,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Action handlers
  const handleEdit = (period) => {
    console.log('Edit period:', period);
    // TODO: Implement edit functionality
  };

  const handleDelete = (period) => {
    console.log('Delete period:', period);
    // TODO: Implement delete functionality
  };

  const handleAdd = () => {
    console.log('Add new period');
    // TODO: Implement add functionality
  };

  // Loading and error states
  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        border: '1px solid #ff4d4f',
        borderRadius: '6px',
        backgroundColor: '#fff2f0'
      }}>
        <h3 style={{ color: '#ff4d4f' }}>Error al cargar los períodos</h3>
        <p>{error.message}</p>
        <Button type="primary" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Cargando períodos...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with search and add button */}
      <Flex justify="space-between" align="center" style={{ marginBottom: '16px' }}>
        <Select
          placeholder="Seleccione un período"
          allowClear
          showSearch
          style={{ width: 300 }}
          onChange={handleSearch}
          suffixIcon={<SearchOutlined />}
          options={periods?.map(period => ({
            value: period.name,
            label: period.name,
          })) || []}
        />
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Añadir
        </Button>
      </Flex>

      {/* Periods table */}
      <Table
        columns={columns}
        dataSource={filteredPeriods}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} de ${total} períodos`,
        }}
        loading={isLoading}
      />
    </div>
  );
};

export default PeriodsPage;
