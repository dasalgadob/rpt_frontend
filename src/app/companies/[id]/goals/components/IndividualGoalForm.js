"use client";

import React, { useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';
import PeriodSelect from '@/components/PeriodSelect';
import AreaSelect from './AreaSelect';
import PositionSelect from './PositionSelect';
import EmployeeSelect from './EmployeeSelect';

const { Option } = Select;

const PERIOD_ID = 'period_id';

const IndividualGoalForm = ({ 
  visible, 
  onCancel, 
  onSuccess,
  initialValues, 
  title,
  mode,
  companyId,
  mutate
}) => {
  console.log("🚀 ~ IndividualGoalForm ~ initialValues:", initialValues)
  const [form] = Form.useForm();
  const isSettingInitialValues = useRef(false);
  
  // Watch period value from form
  const periodValue = Form.useWatch(PERIOD_ID, form);

  // SWR mutation for creating/updating area goals
  const { trigger: saveGoal, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_goals`,
    async (url, { arg }) => {
      const { values, goalId, method } = arg;
      const requestUrl = method === 'POST' ? url : `${url}/${goalId}`;
      
      return fetcher(requestUrl, {
        method,
        body: { position_goal: values }
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
          percentage: parseFloat(initialValues.percentage), // Ensure percentage is a float
          period_id: initialValues.period_id, // Handle both period object and period_id
          employee_id: initialValues.employee.id
            ? { value: initialValues.employee.id, label: initialValues.employee.name }
            : undefined,
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

  // Clear area when period changes (but not when setting initial values)
  useEffect(() => {
    if (visible && !isSettingInitialValues.current) {
      form.setFieldValue('department_id', undefined);
    }
  }, [periodValue, form, visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // If employee_id is an object, extract the value
      if (values.employee_id && typeof values.employee_id === 'object') {
        values.employee_id = values.employee_id.value;
      }
      
      const method = mode === 'add' ? 'POST' : 'PUT';
      console.log("🚀 ~ handleSubmit ~ method:", method)
      const goalId = mode === 'edit' ? initialValues?.id : null;
      
      await saveGoal({ values, goalId, method });

      toast.success(`Meta de área ${mode === 'add' ? 'creada' : 'actualizada'} exitosamente`);
      form.resetFields();
      
      // Refresh the data if mutate function is provided
      if (mutate) {
        mutate();
      }
      
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
        <EmployeeSelect
          name="employee_id"
          companyId={companyId}
          placeholder="Seleccionar empleado"
          rules={[{ required: true, message: 'Por favor seleccione el empleado' }]}
        />
        <Form.Item
          name="goal"
          label="Meta"
          rules={[{ required: true, message: 'Por favor ingrese la meta' }]}
        >
          <Input
            placeholder="Ingrese la meta"
            rows={3}
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

export default IndividualGoalForm;
