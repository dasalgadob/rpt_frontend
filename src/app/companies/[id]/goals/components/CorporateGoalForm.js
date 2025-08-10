"use client";

import React, { useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';
import PeriodSelect from './PeriodSelect';
import DimensionSelect from './DimensionSelect';

const { Option } = Select;

const PERIOD_ID = 'period_id';

const CorporateGoalForm = ({ 
  visible, 
  onCancel, 
  onSuccess,
  initialValues, 
  title,
  mode,
  companyId
}) => {
  console.log("🚀 ~ CorporateGoalForm ~ initialValues:", initialValues)
  const [form] = Form.useForm();
  const isSettingInitialValues = useRef(false);
  
  // Watch period value from form
  const periodValue = Form.useWatch(PERIOD_ID, form);

  // SWR mutation for creating/updating corporate goals
  const { trigger: saveGoal, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/corporate_goals`,
    async (url, { arg }) => {
      const { values, goalId, method } = arg;
      const requestUrl = method === 'POST' ? url : `${url}/${goalId}`;
      
      return fetcher(requestUrl, {
        method,
        body: { corporate_goal: values }
      });
    }
  );

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        isSettingInitialValues.current = true;
        // Transform initialValues to match form field names
        const formValues = {
          ...initialValues,
          period_id: initialValues.period?.id || initialValues.period_id, // Handle both period object and period_id
        };
        
        // Set values in the next tick to ensure proper timing
        setTimeout(() => {
          form.setFieldsValue(formValues);
          // Reset flag after form is set
          setTimeout(() => {
            isSettingInitialValues.current = false;
          }, 50);
        }, 0);
      } else {
        form.resetFields();
        isSettingInitialValues.current = false;
      }
    }
  }, [visible, initialValues, form]);

  // Clear dimension when period changes (but not when setting initial values)
  useEffect(() => {
    if (visible && !isSettingInitialValues.current) {
      form.setFieldValue('dimension_id', undefined);
    }
  }, [periodValue, form, visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const method = mode === 'add' ? 'POST' : 'PUT';
      const goalId = mode === 'edit' ? initialValues?.id : null;
      
      await saveGoal({ values, goalId, method });

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
      confirmLoading={isMutating}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <PeriodSelect
          name={PERIOD_ID}
          selectFirstAsDefault={true}
          companyId={companyId}
          placeholder="Seleccionar periodo"
          rules={[{ required: true, message: 'Por favor ingrese el periodo' }]}
        />

        <DimensionSelect
          name="dimension_id"
          companyId={companyId}
          periodId={periodValue}
          placeholder="Seleccionar dimensión"
          rules={[{ required: true, message: 'Por favor seleccione la dimensión' }]}
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

export default CorporateGoalForm;
