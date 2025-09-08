"use client";

import React, { useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Modal } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';
import PeriodSelect from '../../goals/components/PeriodSelect';
import PositionTypeSelectMultiple from './PositionTypeSelectMultiple';

const ProfitReferenceForm = ({ 
  visible, 
  onCancel, 
  onSuccess,
  initialValues, 
  title,
  mode,
  companyId
}) => {
  const [form] = Form.useForm();
  const isSettingInitialValues = useRef(false);

  // SWR mutation for creating/updating profit references
  const { trigger: saveProfitReference, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/profit_references`,
    async (url, { arg }) => {
      const { values, profitReferenceId, method } = arg;
      const requestUrl = method === 'POST' ? url : `${url}/${profitReferenceId}`;
      
      return fetcher(requestUrl, {
        method,
        body: { profit_reference: values }
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
          period_id: initialValues.period?.id || initialValues.period_id,
          since_percentage_profit: initialValues.since_percentage_profit,
          position_type_ids: initialValues.position_type_ids || [],
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const profitReferenceId = mode === 'edit' ? initialValues?.id : null;
      
      await saveProfitReference({ values, profitReferenceId, method });
      
      const successMessage = mode === 'edit' ? 'Referencia de compensación actualizada exitosamente' : 'Referencia de compensación creada exitosamente';
      toast.success(successMessage);
      
      onSuccess();
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Ant Design validation error - don't show toast
        return;
      }
      console.error('Error saving profit reference:', error);
      const errorMessage = mode === 'edit' ? 'Error al actualizar la referencia de compensación' : 'Error al crear la referencia de compensación';
      toast.error(errorMessage);
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={isMutating}
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <PeriodSelect
          companyId={companyId}
          name="period_id"
          rules={[
            { required: true, message: 'Debe seleccionar un periodo' }
          ]}
        />

        <Form.Item
          label="Porcentaje de Ganancia (%)"
          name="since_percentage_profit"
          rules={[
            { required: true, message: 'El porcentaje de ganancia es requerido' },
            { type: 'number', min: 0, max: 110, message: 'El porcentaje debe estar entre 0 y 100' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Ingrese el porcentaje de ganancia"
            min={0}
            max={110}
            step={0.1}
            precision={2}
            addonAfter="%"
          />
        </Form.Item>

        <Form.Item
          label="Ecuación"
          name="equation"
          rules={[
            { required: true, message: 'La ecuación es requerida' }
          ]}
        >
          <Input placeholder="Ingrese la ecuación" />
        </Form.Item>

        <PositionTypeSelectMultiple
          companyId={companyId}
          name="position_type_ids"
          rules={[
            { required: true, message: 'Debe seleccionar al menos un tipo de posición' }
          ]}
        />
      </Form>
    </Modal>
  );
};

export default ProfitReferenceForm;
