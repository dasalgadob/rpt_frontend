"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Card, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { fetcher } from '@/constants';
import DepartmentModal from './DepartmentModal';

const DepartmentsPage = ({ params }) => {
  const companyId = params.id;
  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add',
    selectedRecord: null
  });

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/departments` : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  const departments = response?.data?.map(item => ({
    id: item.id,
    name: item.attributes?.name,
  })) || [];

  const handleEdit = (record) => {
    setModalState({ visible: true, mode: 'edit', selectedRecord: record });
  };

  const handleDelete = async (record) => {
    await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/departments/${record.id}`, { method: 'DELETE' });
    mutate();
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
          <Popconfirm
            title="¿Seguro que deseas eliminar esta área?"
            onConfirm={() => handleDelete(record)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Áreas</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Añadir Área
        </Button>
      </div>
      <Card>
        <Table
          columns={columns}
          dataSource={departments}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <DepartmentModal
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

export default DepartmentsPage;
