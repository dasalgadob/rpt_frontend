"use client";

import React, { useState } from 'react';
import { Form, Input, InputNumber, Modal } from 'antd';
import { toast } from 'react-toastify';
import { usePositionTypeWeightOperations } from '../../../../hooks/usePositionTypeWeights';
import PositionTypeSelect from './PositionTypeSelect';
import PeriodSelect from '../goals/components/PeriodSelect';

const PERIOD_ID = 'period_id';

const PositionTypeWeightsForm = ({ 
  visible, 
  onCancel, 
  onSuccess,
  initialValues, 
  mode,
  companyId
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPositionTypeWeight, updatePositionTypeWeight } = usePositionTypeWeightOperations();

  // Transform initialValues for form compatibility
  const formInitialValues = initialValues ? {
    ...initialValues,
    // En modo edit, usar directamente el string del position_type
    // En modo add, usar el formato de objeto para el select
    position_type: mode === 'edit' 
      ? initialValues.position_type 
      : (initialValues.position_type ? {
          label: initialValues.position_type,
          value: initialValues.position_type
        } : undefined),
    [PERIOD_ID]: initialValues.period_id || initialValues.period?.id,
    corporativo: initialValues.corporativo || 0,
    area: initialValues.area || 0,
    cargo: initialValues.cargo || 0,
  } : {};

  console.log('PositionTypeWeightsForm render:', { 
    mode, 
    initialValues, 
    formInitialValues 
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      
      // Extraer el valor del position_type si es un objeto (del select)
      const positionTypeValue = typeof values.position_type === 'object' && values.position_type?.value 
        ? values.position_type.value 
        : values.position_type;
      
      // Validar que la suma no exceda 100%
      const total = (values.corporativo || 0) + (values.area || 0) + (values.cargo || 0);
      if (total > 100) {
        toast.error('La suma de los porcentajes no puede exceder 100%');
        return;
      }
      
      const method = mode === 'add' ? 'POST' : 'PUT';
      const weightId = mode === 'edit' ? initialValues?.id : null;
      
      // Preparar valores para enviar al API
      const apiValues = {
        ...values,
        period_id: values[PERIOD_ID]  // Incluir el período seleccionado
      };
      
      // Use the appropriate operation based on mode
      let result;
      if (mode === 'add') {
        result = await createPositionTypeWeight(companyId, apiValues);
      } else {
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
      if (error.name === 'ValidationError') {
        // Form validation errors - don't show toast
        console.error('Validation failed:', error);
      } else {
        console.error('Error saving position type weight:', error);
        toast.error(`Error al ${mode === 'add' ? 'crear' : 'actualizar'} el peso de tipo de posición`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Calcular total en tiempo real
  const corporate = Form.useWatch('corporate_percentage', form) || 0;
  const department = Form.useWatch('department_percentage', form) || 0;
  const position = Form.useWatch('position_percentage', form) || 0;
  const total = corporate + department + position;

  return (
    <Modal
      key={`modal-${mode}-${initialValues?.id || 'new'}`}
      title={mode === 'add' ? 'Añadir Peso de Tipo de Posición' : 'Editar Peso de Tipo de Posición'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={isSubmitting}
      okText="Guardar"
      cancelText="Cancelar"
      width={500}
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
          rules={[{ required: true, message: 'Por favor seleccione el periodo' }]}
        />

        <Form.Item
          name="position_type_id"
          label="Tipo de Posición"
          rules={[{ required: true, message: 'Por favor ingrese el tipo de posición' }]}
        >
            <PositionTypeSelect 
              placeholder="Seleccionar tipo de posición"
              companyId={companyId}
            />
        </Form.Item>

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
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
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
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
            />
          </Form.Item>

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
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
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
