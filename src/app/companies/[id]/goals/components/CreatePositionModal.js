"use client";

import React from 'react';
import { Modal, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';

const CreatePositionModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  companyId 
}) => {
  const [form] = Form.useForm();

  // SWR mutation for creating new position
  const { trigger: createPosition, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/positions`,
    async (url, { arg }) => {
      return fetcher(url, {
        method: 'POST',
        body: { position: arg }
      });
    }
  );

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const response = await createPosition(values);

      toast.success('Posición creada exitosamente');
      form.resetFields();
      onSuccess(response.data);
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Ant Design validation error - don't show toast
        return;
      }
      console.error('Error creating position:', error);
      toast.error('Error al crear la posición');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Crear Nueva Posición"
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
          label="Nombre de la Posición"
          name="name"
          rules={[
            { required: true, message: 'El nombre de la posición es requerido' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el nombre de la posición" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePositionModal;
