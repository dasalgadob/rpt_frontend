"use client";

import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { fetcher } from '@/constants';

const PositionTypeFormModal = ({ visible, onCancel, onSuccess, initialValues, mode }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ name: initialValues?.name || '' });
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (mode === 'add') {
        await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/2/position_types`, {
          method: 'POST',
          body: { position_type: { name: values.name } },
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (mode === 'edit' && initialValues?.id) {
        await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/2/position_types/${initialValues.id}`, {
          method: 'PATCH',
          body: { position_type: { name: values.name } },
          headers: { 'Content-Type': 'application/json' },
        });
      }
      onSuccess();
      form.resetFields();
    } catch (err) {
      // Validation or API error
    }
  };

  return (
    <Modal
      open={visible}
      title={mode === 'add' ? 'Añadir Tipo de Posición' : 'Editar Tipo de Posición'}
      onCancel={() => { form.resetFields(); onCancel(); }}
      onOk={handleOk}
      footer={[
        <Button key="back" onClick={() => { form.resetFields(); onCancel(); }}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          {mode === 'add' ? 'Añadir' : 'Guardar'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: 'Por favor ingresa el nombre del tipo de posición' }]}
        >
          <Input placeholder="Nombre del tipo de posición" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PositionTypeFormModal;
