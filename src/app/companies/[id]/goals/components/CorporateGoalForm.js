"use client";

import React from 'react';
import { Form, Input, InputNumber, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';
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

  // Get default period using SWR
  const { data: defaultPeriodData } = useSWR(
    companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods/default_period` : null,
    (url) => fetcher(url, { method: 'GET' })
  );
  const defaultPeriod = defaultPeriodData?.data;

  React.useEffect(() => {
    if (visible) {
      console.log("🚀 ~ CorporateGoalForm ~ initialValues:", initialValues)
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
          period_id: initialValues.period?.id
          
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
          name="goal"
          label="Meta"
          rules={[{ required: true, message: 'Por favor ingrese la meta' }]}
        >
          <Input placeholder="Ingrese la meta" />
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
          name="goal_floor"
          label="Piso de la Meta"
          rules={[
            { required: true, message: 'Por favor ingrese el piso de la Meta' },
            { type: 'number' }
          ]}
        >
          <InputNumber
            placeholder="Ingrese el piso de la Meta"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="goal_value"
          label="Meta target"
          rules={[
            { required: true, message: 'Por favor ingrese la Meta target' },
            { type: 'number' }
          ]}
        >
          <InputNumber
            placeholder="Ingrese la meta target"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="goal_ceil"
          label="Techo de la meta"
          rules={[
            { required: true, message: 'Por favor ingrese el techo de la meta' },
            { type: 'number' }
          ]}
        >
          <InputNumber
            placeholder="Ingrese el techo de la meta"
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          name="formula_below_value"
          label="Formula entre piso y target"
          rules={[{ required: true, message: 'Por favor ingrese la formula entre piso y target' }]}
        >
          <Input placeholder="Ingrese la formula" />
        </Form.Item>

        <Form.Item
          name="formula_above_value"
          label="Formula entre target y techo"
          rules={[{ required: true, message: 'Por favor ingrese la formula entre target y techo' }]}
        >
          <Input placeholder="Ingrese la formula" />
        </Form.Item>
        <Form.Item
          name="goal_achieved"
          label="Meta lograda"
          rules={[
            { required: true, message: 'Por favor ingrese la Meta lograda' },
            { type: 'number' }
          ]}
        >
          <InputNumber
            placeholder="Ingrese la meta lograda"
            style={{ width: '100%' }}
          />
      </Form.Item>
      </Form>
    </Modal>
  );
};

export default CorporateGoalForm;
