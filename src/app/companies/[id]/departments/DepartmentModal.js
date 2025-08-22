"use client";

import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { fetcher } from '@/constants';

const DepartmentModal = ({ visible, onCancel, onSuccess, initialValues, mode, companyId }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues || { name: '' });
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (mode === 'add') {
        await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/departments`, {
          method: 'POST',
          body: { department: { name: values.name } },
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (mode === 'edit' && initialValues?.id) {
        await fetcher(`${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/departments/${initialValues.id}`, {
          method: 'PUT',
          body: { department: { name: values.name }},
          headers: { 'Content-Type': 'application/json' },
        });
      }
      onSuccess();
      form.resetFields();
    } catch (err) {
      // Validation error or API error
    }
  };

  return (
    <Modal
      open={visible}
      title={mode === 'add' ? 'Añadir Área' : 'Editar Área'}
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
          rules={[{ required: true, message: 'Por favor ingresa el nombre del área' }]}
        >
          <Input placeholder="Nombre del área" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentModal;
