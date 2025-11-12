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
  Flex,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  SearchOutlined 
} from '@ant-design/icons';
import DeleteButton from '@/components/DeleteButton';
import { fetcher } from '../../../../constants';
import PeriodsForm from './PeriodsForm';
import { useCompanyPeriods, usePeriodOperations } from '../../../../hooks/usePeriods';
import Loading from '@/components/loading/Loading';

const PeriodsPage = () => {
  const params = useParams();
  const { id } = params; // Company ID from URL
  const [searchValue, setSearchValue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // Usar hook personalizado de SWR para períodos
  const { periods: periodsData, isLoading, isError: error, mutate } = useCompanyPeriods(id);
  const { deletePeriod } = usePeriodOperations();

  // Los datos ya vienen procesados del hook
  const allPeriods = periodsData || [];

  // Handle search/filter
  const handleSearch = (value) => {
    setSearchValue(value);
  };

  // Filter periods based on search
  const filteredPeriods = allPeriods?.filter(period => 
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
        // Manejar tanto mayúsculas como minúsculas
        const statusLower = status.toLowerCase();
        let color = 'default';
        
        if (statusLower === 'abierto') {
          color = 'green';
        } else if (statusLower === 'cerrado') {
          color = 'volcano';
        }
        
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Abierto', value: 'abierto' },
        { text: 'Cerrado', value: 'cerrado' },
        { text: 'N/A', value: 'N/A' },
      ],
      onFilter: (value, record) => {
        const recordStatus = (record.status || 'N/A').toLowerCase();
        const filterValue = value.toLowerCase();
        return recordStatus === filterValue;
      },
    },
    {
      title: '% Cumplimiento de la Utilidad',
      dataIndex: 'company_profit_percentage',
      key: 'company_profit_percentage',
      align: 'center', // <-- Centra el contenido
      render: (value) => value !== undefined && value !== null ? `${value}%` : 'No definido',
    },
    {
      title: 'Calificación Mínima de Funcionario',
      dataIndex: 'minimum_score_employee',
      key: 'minimum_score_employee',
      align: 'center', // <-- Centra el contenido
      render: (value) => value !== undefined && value !== null ? value : 'No definido',
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
          <DeleteButton
            endpoint={`${process.env.NEXT_PUBLIC_API_URL}/companies/${id}/periods`}
            id={record.id}
            onSuccess={mutate}
            confirmMessage={`¿Está seguro de eliminar el período "${record.name}"?\n\nEsta acción no se puede deshacer.`}
          />
        </Space>
      ),
    },
  ];

  // Action handlers
  const handleEdit = (period) => {
    setModalMode('edit');
    setSelectedPeriod(period);
    setModalVisible(true);
  };

  const handleDelete = async (period) => {
    const confirmDelete = window.confirm(
      `¿Está seguro de eliminar el período "${period.name}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (confirmDelete) {
      try {
        const result = await deletePeriod(id, period.id);
        
        if (result.success) {
          message.success(`Período "${period.name}" eliminado correctamente`);
          // Revalidar los datos después de eliminar
          await mutate();
        } else {
          message.error(result.error || 'Error al eliminar el período');
        }
      } catch (error) {
        console.error('Error inesperado en eliminación:', error);
        message.error('Error inesperado al eliminar el período');
      }
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedPeriod(null);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedPeriod(null);
  };

  const handleFormSuccess = () => {
    // Revalidar los datos después de la operación exitosa
    mutate();
    setModalVisible(false);
    setSelectedPeriod(null);
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
      <Loading />
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
          options={allPeriods?.map(period => ({
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

      {/* Modal para crear/editar períodos */}
      <PeriodsForm
        visible={modalVisible}
        onCancel={handleModalCancel}
        onSuccess={handleFormSuccess}
        initialValues={selectedPeriod}
        mode={modalMode}
        companyId={id}
      />
    </div>
  );
};

export default PeriodsPage;
