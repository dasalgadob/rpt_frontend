"use client";

import React, { useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Select, Modal } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';
import PeriodSelect from '@/components/PeriodSelect';
import AreaSelect from './AreaSelect';
import EmployeeSelect from './EmployeeSelect';
import DefaultPeriod from './DefaultPeriod';

const { Option } = Select;

const PERIOD_ID = 'period_id';

interface Employee {
  id: string | number;
  name: string;
}

interface Period {
  id: string | number;
  name?: string;
}

interface AreaGoalFormValues {
  id?: string | number | undefined;
  description?: string | undefined;
  percentage?: number | string | undefined;
  score?: number | string | undefined;
  period?: Period | undefined;
  period_id?: string | number | undefined;
  employee?: Employee | undefined;
  employee_id?: { value: string | number; label: string; } | string | number | undefined;
}

interface AreasGoalFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: AreaGoalFormValues | null;
  title: string;
  mode: 'add' | 'edit';
  companyId: string | number;
}

const AreasGoalForm: React.FC<AreasGoalFormProps> = ({
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

  // Watch period value from form
  const periodValue = Form.useWatch(PERIOD_ID, form);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        isSettingInitialValues.current = true;
        const formValues: AreaGoalFormValues = {
          ...initialValues,
          percentage: (() => {
            if (!initialValues.percentage) return undefined;
            const percentageValue = String(initialValues.percentage).replace('%', '');
            const numValue = parseInt(percentageValue, 10);
            return isNaN(numValue) ? undefined : numValue;
          })(),
          period_id: initialValues.period?.id,
          employee_id: initialValues.employee
            ? { value: initialValues.employee.id, label: initialValues.employee.name }
            : undefined,
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

  const { trigger: saveGoal, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/department_goals`,
    async (url: string, { arg }: any) => {
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
      console.log("🚀 ~ handleSubmit ~ values:", values)
      values.employee_id = values.employee_id?.value
      const method = mode === 'add' ? 'POST' : 'PUT';
      const goalId = mode === 'edit' ? initialValues?.id : null;
      // @ts-expect-error: SWRMutation expects null as first argument, arg as options
      await saveGoal({ values, goalId, method });
      toast.success(`Meta de área ${mode === 'add' ? 'creada' : 'actualizada'} exitosamente`);
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.name === 'ValidationError') {
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
      >
        <PeriodSelect companyId={companyId} name={PERIOD_ID} rules={[{ required: true, message: 'Por favor seleccione el periodo' }]} />
        <EmployeeSelect
          name="employee_id"
          companyId={companyId}
          placeholder="Seleccionar empleado"
          rules={[{ required: true, message: 'Por favor seleccione el empleado' }]}
        />
        <Form.Item 
          label="Meta"
          name="goal"
          rules={[{ required: true, message: 'Por favor ingrese la meta' }]}
        >
          <Input
            placeholder="Ingrese la meta"
            maxLength={100}
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
            parser={(value => {
              const parsed = parseFloat((value ?? '').replace('%', ''));
              return isNaN(parsed) ? undefined : parsed;
            }) as (displayValue: string | undefined) => number}
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
