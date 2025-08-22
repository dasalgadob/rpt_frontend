import React from 'react';
import { Button, Tooltip, message, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { DeleteOutlined } from '@ant-design/icons';

const DeleteButton = ({ endpoint, id, onSuccess, confirmMessage = '¿Está seguro de eliminar este elemento?\n\nEsta acción no se puede deshacer.' }) => {
  const handleDelete = async () => {
    try {
      const response = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        message.success('Eliminado correctamente');
        toast.success('Eliminado correctamente');
        if (onSuccess) onSuccess();
      } else {
        message.error('No se pudo eliminar');
        toast.error('No se pudo eliminar');
      }
    } catch (error) {
  message.error('Error al eliminar');
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
        />
      </Tooltip>
    </Popconfirm>
  );
};

export default DeleteButton;
