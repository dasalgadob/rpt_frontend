"use client";

import React from 'react';
import { Form, Input, InputNumber, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';
import PeriodSelect from '@/components/PeriodSelect';
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
  const isSettingInitialValues = React.useRef(false);
  
  // Watch period value from form
  const periodValue = Form.useWatch(PERIOD_ID, form);

  React.useEffect(() => {
    if (visible) {
      if (initialValues) {
        isSettingInitialValues.current = true;
        const formValues = {
          ...initialValues,
          percentage: (() => {
            if (!initialValues.percentage) return undefined;
            const percentageValue = String(initialValues.percentage).replace('%', '');
            const numValue = parseInt(percentageValue, 10);
            return isNaN(numValue) ? undefined : numValue;
          })(),
          period_id: initialValues.period?.id,
        };
        setTimeout(() => {
          form.setFieldsValue(formValues);
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
      >
        <PeriodSelect
          name={PERIOD_ID}
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
