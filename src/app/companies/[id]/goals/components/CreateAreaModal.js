"use client";

import React from 'react';
import { Modal, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';

const CreateAreaModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  companyId 
}) => {
  const [form] = Form.useForm();

  // SWR mutation for creating new area
  const { trigger: createArea, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/departments`,
    async (url, { arg }) => {
      return fetcher(url, {
        method: 'POST',
        body: { department: arg }
      });
    }
  );

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const response = await createArea(values);
      
      toast.success('Área creada exitosamente');
      form.resetFields();
      onSuccess(response.data);
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Ant Design validation error - don't show toast
        return;
      }
      console.error('Error creating area:', error);
      toast.error('Error al crear el área');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Crear Nueva Área"
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
          label="Nombre del Área"
          name="name"
          rules={[
            { required: true, message: 'El nombre del área es requerido' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el nombre del área" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAreaModal;
