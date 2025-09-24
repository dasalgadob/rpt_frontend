import React from 'react';
import { Button, Tooltip, message, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { DeleteOutlined } from '@ant-design/icons';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../constants';

const DeleteButton = ({ endpoint, id, onSuccess, confirmMessage = '¿Está seguro de eliminar este elemento?\n\nEsta acción no se puede deshacer.' }) => {
  const {
    data: deleteData,
    error: deleteError,
    trigger: triggerDelete,
    isMutating: deleteIsLoading
  } = useSWRMutation(
    `${endpoint}/${id}`,
    (url) => fetcher(url, { method: 'DELETE' })
  );

  const handleDelete = async () => {
    try {
      await triggerDelete();
      toast.success('Eliminado correctamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <Popconfirm
      title={confirmMessage}
      onConfirm={handleDelete}
      okText="Sí"
      cancelText="No"
      placement="topRight"
    >
      <Tooltip title="Eliminar">
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          loading={deleteIsLoading}
        />
      </Tooltip>
    </Popconfirm>
  );
};

export default DeleteButton;
