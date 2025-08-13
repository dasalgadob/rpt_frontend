"use client";

import React from 'react';
import { Modal, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';

const CreatePositionTypeModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  companyId 
}) => {
  const [form] = Form.useForm();

  // SWR mutation for creating new position type
  const { trigger: createPositionType, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_types`,
    async (url, { arg }) => {
      return fetcher(url, {
        method: 'POST',
        body: { position_type: arg }
      });
    }
  );

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
      title="Crear Nuevo Tipo de Posición"
      open={visible}
      onOk={handleSave}
      onCancel={handleCancel}
      confirmLoading={isMutating}
      destroyOnClose
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          label="Nombre del Tipo de Posición"
          name="name"
          rules={[
            { required: true, message: 'El nombre del tipo de posición es requerido' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el nombre del tipo de posición" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePositionTypeModal;
