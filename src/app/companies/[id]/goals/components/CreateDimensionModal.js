"use client";

import React from 'react';
import { Modal, Form, Input } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';

const CreateDimensionModal = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  companyId,
  periodId
}) => {
  const [form] = Form.useForm();

  // SWR mutation for creating new dimension
  const { trigger: createDimension, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/dimensions`,
    async (url, { arg }) => {
      return fetcher(url, {
        method: 'POST',
        body: { dimension: arg }
      });
    }
  );

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // Add periodId to the dimension data
      const dimensionData = {
        ...values,
        period_id: periodId
      };
      
      const response = await createDimension(dimensionData);
      
      toast.success('Dimensión creada exitosamente');
      form.resetFields();
      onSuccess(response.data);
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Ant Design validation error - don't show toast
        return;
      }
      console.error('Error creating dimension:', error);
      toast.error('Error al crear la dimensión');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Crear Nueva Dimensión"
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
          label="Nombre de la Dimensión"
          name="name"
          rules={[
            { required: true, message: 'El nombre de la dimensión es requerido' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el nombre de la dimensión" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDimensionModal;
