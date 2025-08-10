"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import { fetcher } from '../../../../../constants';
import PeriodSelect from './PeriodSelect';

const { Option } = Select;

const CorporateGoalForm = ({ 
  visible, 
  onCancel, 
  onSuccess,
  initialValues, 
  title,
  mode,
  companyId
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const url = mode === 'add' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/corporate_goals`
        : `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/corporate_goals/${initialValues?.id}`;
      
      const method = mode === 'add' ? 'POST' : 'PUT';
      
      await fetcher(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ corporate_goal: values }),
      });

      toast.success(`Meta corporativa ${mode === 'add' ? 'creada' : 'actualizada'} exitosamente`);
      form.resetFields();
      onSuccess(); // Refresh the data and close modal
      
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Form validation errors - don't show toast
        console.error('Validation failed:', error);
      } else {
        console.error('Error saving corporate goal:', error);
        toast.error(`Error al ${mode === 'add' ? 'crear' : 'actualizar'} la meta corporativa`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <PeriodSelect
          name="period"
          selectFirstAsDefault={true}
          companyId={companyId}
          placeholder="Seleccionar periodo"
          rules={[{ required: true, message: 'Por favor ingrese el periodo' }]}
        />

        <Form.Item
          name="dimension_id"
          label="Dimensión"
          rules={[{ required: true, message: 'Por favor ingrese la dimensión' }]}
        >
          <InputNumber
            placeholder="Ingrese ID de dimensión"
            style={{ width: '100%' }}
            min={1}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descripción"
          rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
        >
          <Input.TextArea
            placeholder="Ingrese la descripción de la meta"
            rows={3}
          />
        </Form.Item>

        <Form.Item
          name="percentage"
          label="Porcentaje"
          rules={[
            { required: true, message: 'Por favor ingrese el porcentaje' },
            { type: 'number', min: 0, max: 100, message: 'El porcentaje debe estar entre 0 y 100' }
          ]}
        >
          <InputNumber
            placeholder="Ingrese el porcentaje"
            style={{ width: '100%' }}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
          />
        </Form.Item>

        <Form.Item
          name="score"
          label="Evaluación"
          rules={[{ required: true, message: 'Por favor ingrese la evaluación' }]}
        >
          <InputNumber
            placeholder="Ingrese la evaluación"
            style={{ width: '100%' }}
            min={0}
            step={0.1}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CorporateGoalForm;
