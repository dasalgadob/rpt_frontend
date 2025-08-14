"use client";

import React from 'react';
import { Modal, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import { useCreatePositionType } from '../../../../hooks/usePositionTypes';

const CreatePositionTypeModal = ({ 
  visible, 
  onCancel, 
  onSuccess,
  companyId 
}) => {
  const [form] = Form.useForm();
  const { createPositionType, isCreating } = useCreatePositionType(companyId);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const response = await createPositionType(values);
      
      toast.success('Tipo de posición creado exitosamente');
      form.resetFields();
      onSuccess(response.data);
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Ant Design validation error - don't show toast
        return;
      }
      
      console.error('Error creating position type:', error);
      toast.error('Error al crear el tipo de posición');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Crear Tipo de Posición"
      open={visible}
      onOk={handleSave}
      onCancel={handleCancel}
      confirmLoading={isCreating}
      okText="Crear"
      cancelText="Cancelar"
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          name="name"
          label="Nombre del Tipo de Posición"
          rules={[
            { required: true, message: 'Por favor ingrese el nombre del tipo de posición' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
            { max: 100, message: 'El nombre no puede tener más de 100 caracteres' }
          ]}
        >
          <Input 
            placeholder="Ej: Gerente, Analista, Director..."
            autoFocus
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePositionTypeModal;
