"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Card } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { fetcher } from '@/constants';
import PositionTypeFormModal from './PositionTypeFormModal';
import DeleteButton from '../../../../components/DeleteButton';

const PositionTypesPage = ({ params }) => {
  const companyId = params.id;
  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add',
    selectedRecord: null
  });

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_types` : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  const positionTypes = response?.data?.map(item => ({
    id: item.id,
    name: item.attributes?.name,
  })) || [];

  const handleEdit = (record) => {
    setModalState({ visible: true, mode: 'edit', selectedRecord: record });
  };

  const handleAdd = () => {
    setModalState({ visible: true, mode: 'add', selectedRecord: null });
  };

  const handleModalCancel = () => {
    setModalState({ visible: false, mode: 'add', selectedRecord: null });
  };

  const handleModalSuccess = () => {
    mutate();
    setModalState({ visible: false, mode: 'add', selectedRecord: null });
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
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
          <DeleteButton
            endpoint={`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_types`}
            id={record.id}
            onSuccess={mutate}
            confirmText={`¿Seguro que deseas eliminar el tipo de posición "${record.name}"?`}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Tipos de Posición</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Añadir Tipo de Posición
        </Button>
      </div>
      <Card>
        <Table
          columns={columns}
          dataSource={positionTypes}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <PositionTypeFormModal
        visible={modalState.visible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
        initialValues={modalState.selectedRecord}
        mode={modalState.mode}
        companyId={companyId}
      />
    </div>
  );
};

export default PositionTypesPage;
