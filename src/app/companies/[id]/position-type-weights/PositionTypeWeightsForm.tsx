"use client";

import React from 'react';
import { Form, InputNumber, Modal } from 'antd';
import { toast } from 'react-toastify';
import { usePositionTypeWeightOperations } from '../../../../hooks/usePositionTypeWeights';
import PositionTypeSelect from './PositionTypeSelect';
import PeriodSelect from '@/components/PeriodSelect';

// Type declaration for JavaScript PeriodSelect component
const PeriodSelectComponent = PeriodSelect as any;

const PERIOD_ID = 'period_id';

interface InitialValues {
  id?: string | number;
  attributes?: {
    position_type_id?: string | number;
    period_id?: string | number;
    corporate_percentage?: string | number;
    department_percentage?: string | number;
    job_competencies_percentage?: string | number;
    position_percentage?: string | number;
    position_type_name?: string;
  };
  position_type_id?: string | number;
  period_id?: string | number;
  period?: { id: string | number };
  corporate_percentage?: number;
  department_percentage?: number;
  position_percentage?: number;
}

interface PositionTypeWeightsFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: InitialValues;
  mode: 'add' | 'edit';
  companyId: string;
}

const PositionTypeWeightsForm: React.FC<PositionTypeWeightsFormProps> = ({ 
  visible, 
  onCancel, 
  onSuccess,
  initialValues, 
  mode,
  companyId
}) => {
  console.log("🚀 ~ PositionTypeWeightsForm ~ initialValues:", initialValues);
  const [form] = Form.useForm();
  const isSettingInitialValues = React.useRef(false);
  const { createPositionTypeWeight, updatePositionTypeWeight } = usePositionTypeWeightOperations();

  // Robust initial values loading pattern (similar to CorporateGoalForm)
  React.useEffect(() => {
    if (visible) {
      console.log("🚀 ~ PositionTypeWeightsForm useEffect ~ initialValues:", initialValues);
      if (initialValues) {
        isSettingInitialValues.current = true;
        const formValues = {
          ...initialValues,
          [PERIOD_ID]: initialValues.attributes?.period_id,
          corporate_percentage: (() => {
            const value = initialValues.attributes?.corporate_percentage;
            if (!value) return 0;
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return isNaN(numValue) ? 0 : numValue;
          })(),
          department_percentage: (() => {
            const value = initialValues.attributes?.department_percentage;
            if (!value) return 0;
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return isNaN(numValue) ? 0 : numValue;
          })(),
          position_percentage: (() => {
            // Map job_competencies_percentage to position_percentage if available
            const value = initialValues.attributes?.position_percentage ;
            if (!value) return 0;
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return isNaN(numValue) ? 0 : numValue;
          })(),
          position_type_id: { value: initialValues.attributes?.position_type_id, label: initialValues.attributes?.position_type_name },
          job_competencies_percentage: initialValues.attributes?.job_competencies_percentage,
        };
        
        // Use setTimeout to ensure proper form initialization
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

  const handleSubmit = async () => {
    if (isSettingInitialValues.current) {
      console.log('Still setting initial values, skipping submit');
      return;
    }

    try {
      const values = await form.validateFields();
      
      // Validar que la suma no exceda 100%
      const total = (values.corporate_percentage || 0) + (values.department_percentage || 0) + (values.position_percentage || 0) + (values.job_competencies_percentage || 0);
      if (total > 100) {
        toast.error('La suma de los porcentajes no puede exceder 100%');
        return;
      }
      
      // Preparar valores para enviar al API
      const apiValues = {
        ...values,
        period_id: values[PERIOD_ID]
      };
      
      // Use the appropriate operation based on mode
      let result;
      if (mode === 'add') {
        result = await createPositionTypeWeight(companyId, apiValues);
      } else {
        const weightId = initialValues?.id;
        if (!weightId) {
          toast.error('Error: ID de peso no encontrado');
          return;
        }
        result = await updatePositionTypeWeight(companyId, weightId, apiValues);
      }
      
      if (result.success) {
        toast.success(`Peso de tipo de posición ${mode === 'add' ? 'creado' : 'actualizado'} exitosamente`);
        form.resetFields();
        onSuccess(); // Refresh the data and close modal
      } else {
        toast.error(result.error || `Error al ${mode === 'add' ? 'crear' : 'actualizar'} el peso de tipo de posición`);
      }
      
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
        // Form validation errors - don't show toast
        console.error('Validation failed:', error);
      } else {
        console.error('Error saving position type weight:', error);
        toast.error(`Error al ${mode === 'add' ? 'crear' : 'actualizar'} el peso de tipo de posición`);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Calcular total en tiempo real
  const corporatePercentage = Form.useWatch('corporate_percentage', form) || 0;
  const departmentPercentage = Form.useWatch('department_percentage', form) || 0;
  const positionPercentage = Form.useWatch('position_percentage', form) || 0;
  const jobCompetenciesPercentage = Form.useWatch('job_competencies_percentage', form) || 0;
  const total = corporatePercentage + departmentPercentage + positionPercentage + jobCompetenciesPercentage;

  return (
    <Modal
      key={`modal-${mode}-${initialValues?.id || 'new'}`}
      title={mode === 'add' ? 'Añadir Peso de Tipo de Posición' : 'Editar Peso de Tipo de Posición'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={false}
      okText="Guardar"
      cancelText="Cancelar"
      width={500}
    >
      <Form
        key={`${mode}-${initialValues?.id || 'new'}`}
        form={form}
        layout="vertical"
        preserve={false}
      >
        {/* Period Select - Using JavaScript component */}
        <PeriodSelectComponent
          name={PERIOD_ID}
          selectFirstAsDefault={true}
          companyId={companyId}
          placeholder="Seleccionar periodo"
          rules={[{ required: true, message: 'Por favor seleccione el periodo' }]}
        />

        <Form.Item
          name="position_type_id"
          label="Tipo de Posición"
          rules={[{ required: true, message: 'Por favor seleccione el tipo de posición' }]}
        >
          <PositionTypeSelect 
            placeholder="Seleccionar tipo de posición"
            companyId={companyId}
            value={undefined}
            onChange={() => {}}
          />
        </Form.Item>

        {/* First row - Corporate and Department */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="corporate_percentage"
            label="Corporativo (%)"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: 'Requerido' },
              { type: 'number', min: 0, max: 100, message: 'Debe estar entre 0 y 100' }
            ]}
          >
            <InputNumber
              placeholder="0"
              style={{ width: '100%' }}
              min={0}
              max={100}
              formatter={(value: any) => `${value}%`}
              parser={(value: any) => value?.replace('%', '')}
            />
          </Form.Item>

          <Form.Item
            name="department_percentage"
            label="Área (%)"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: 'Requerido' },
              { type: 'number', min: 0, max: 100, message: 'Debe estar entre 0 y 100' }
            ]}
          >
            <InputNumber
              placeholder="0"
              style={{ width: '100%' }}
              min={0}
              max={100}
              formatter={(value: any) => `${value}%`}
              parser={(value: any) => value?.replace('%', '')}
            />
          </Form.Item>
        </div>

        {/* Second row - Position and Job Competencies */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            name="position_percentage"
            label="Cargo (%)"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: 'Requerido' },
              { type: 'number', min: 0, max: 100, message: 'Debe estar entre 0 y 100' }
            ]}
          >
            <InputNumber
              placeholder="0"
              style={{ width: '100%' }}
              min={0}
              max={100}
              formatter={(value: any) => `${value}%`}
              parser={(value: any) => value?.replace('%', '')}
            />
          </Form.Item>

          <Form.Item
            name="job_competencies_percentage"
            label="Competencias (%)"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: 'Requerido' },
              { type: 'number', min: 0, max: 100, message: 'Debe estar entre 0 y 100' }
            ]}
          >
            <InputNumber
              placeholder="0"
              style={{ width: '100%' }}
              min={0}
              max={100}
              formatter={(value: any) => `${value}%`}
              parser={(value: any) => value?.replace('%', '')}
            />
          </Form.Item>
        </div>

        {/* Mostrar total calculado */}
        <div style={{ 
          padding: '12px', 
          backgroundColor: total === 100 ? '#f6ffed' : total > 100 ? '#fff2f0' : '#fff7e6',
          border: `1px solid ${total === 100 ? '#b7eb8f' : total > 100 ? '#ffccc7' : '#ffd666'}`,
          borderRadius: '6px',
          marginTop: '8px'
        }}>
          <strong>Total: {total}%</strong>
          {total > 100 && (
            <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
              ⚠️ La suma excede 100%
            </div>
          )}
          {total === 100 && (
            <div style={{ color: '#52c41a', fontSize: '12px', marginTop: '4px' }}>
              ✓ Suma correcta
            </div>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default PositionTypeWeightsForm;
