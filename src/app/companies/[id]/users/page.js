"use client";

import React, { useState, use } from 'react';
import { Table, Button, Space, Card, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import DeleteButton from '@/components/DeleteButton';
import DownloadButton from '@/components/DownloadButton';
import UploadExcel from '@/components/UploadExcel';
import useSWR from 'swr';
import { fetcher } from '@/constants';
import UserModal from './UserModal';

const UsersPage = ({ params }) => {
  const resolvedParams = use(params);
  const companyId = resolvedParams.id;
  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add',
    selectedRecord: null
  });

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/users` : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  const users = response?.data?.map(item => ({
    id: item.id,
    name: item?.name,
    email: item?.email,
  })) || [];
  console.log("🚀 ~ UsersPage ~ users:", users)

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
      render: (text) => text || 'Sin nombre',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar usuario">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Eliminar usuario">
            <DeleteButton
              endpoint={`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/users`}
              id={record.id}
              onSuccess={mutate}
              confirmMessage={`¿Seguro que deseas eliminar al usuario "${record.name || record.email}"?\n\nEsta acción no se puede deshacer.`}
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
          <h3 style={{ color: '#ff4d4f' }}>Error cargando usuarios</h3>
          <p>{error.message}</p>
          <Button onClick={() => mutate()}>Reintentar</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Usuarios</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Añadir Usuario
          </Button>
        </div>
      </div>
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          loading={isLoading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} usuarios`,
          }}
        />
      </Card>
      <UserModal
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

export default UsersPage;
