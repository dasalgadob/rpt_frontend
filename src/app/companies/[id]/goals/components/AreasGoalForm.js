"use client";

import React from 'react';
import { Form, Input, InputNumber, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';
import PeriodSelect from './PeriodSelect';
import AreaSelect from './AreaSelect';

const { Option } = Select;

const PERIOD_ID = 'period_id';

const AreasGoalForm = ({ 
  visible, 
  onCancel, 
  onSuccess,
  initialValues, 
  title,
  mode,
  companyId
}) => {
  const [form] = Form.useForm();
  
  // Watch period value from form
  const periodValue = Form.useWatch(PERIOD_ID, form);

  // Transform initialValues for form compatibility
  const formInitialValues = initialValues ? {
    ...initialValues,
    percentage: (() => {
      if (!initialValues.percentage) return undefined;
      // Handle percentage values - remove % symbol and convert to number
      const percentageValue = String(initialValues.percentage).replace('%', '');
      const numValue = parseInt(percentageValue, 10);
      return isNaN(numValue) ? undefined : numValue;
    })(),
    period_id: initialValues.period?.id || initialValues.period_id, // Handle both period object and period_id
    department_id: initialValues.area?.id || initialValues.department_id, // Handle both area object and area_id
  } : {};

  // SWR mutation for creating/updating area goals
  const { trigger: saveGoal, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/department_goals`,
    async (url, { arg }) => {
      const { values, goalId, method } = arg;
      const requestUrl = method === 'POST' ? url : `${url}/${goalId}`;
      
      return fetcher(requestUrl, {
        method,
        body: { department_goal: values }
      });
    }
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const method = mode === 'add' ? 'POST' : 'PUT';
      const goalId = mode === 'edit' ? initialValues?.id : null;
      
      await saveGoal({ values, goalId, method });

      toast.success(`Meta de área ${mode === 'add' ? 'creada' : 'actualizada'} exitosamente`);
      form.resetFields();
      onSuccess(); // Refresh the data and close modal
      
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Form validation errors - don't show toast
        console.error('Validation failed:', error);
      } else {
        console.error('Error saving corporate goal:', error);
        toast.error(`Error al ${mode === 'add' ? 'crear' : 'actualizar'} la meta de área`);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      key={`modal-${mode}-${initialValues?.id || 'new'}`}
      title={title}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={isMutating}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form
        key={`${mode}-${initialValues?.id || 'new'}`}
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={formInitialValues}
      >
        <PeriodSelect
          name={PERIOD_ID}
          selectFirstAsDefault={true}
          companyId={companyId}
          placeholder="Seleccionar periodo"
          rules={[{ required: true, message: 'Por favor ingrese el periodo' }]}
        />

        <AreaSelect
          name="department_id"
          companyId={companyId}
          placeholder="Seleccionar área"
          rules={[{ required: true, message: 'Por favor seleccione el área' }]}
        />

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

export default AreasGoalForm;
