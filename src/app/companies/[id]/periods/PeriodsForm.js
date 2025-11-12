"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message, Select, InputNumber } from 'antd';
import { usePeriodOperations } from '../../../../hooks/usePeriods';

const { Option } = Select;

// Constantes para los tipos de periodo y estados
const PERIOD_TYPES = {
  anual: 'Anual',
  trimestral: 'Trimestral',
  semestral: 'Semestral'
};

const PERIOD_STATUS = {
  abierto: 'Abierto',
  cerrado: 'Cerrado',
};

const PeriodsForm = ({ 
  visible, 
  onCancel, 
  onSuccess,
  initialValues = null, 
  mode = 'add', // 'add' or 'edit'
  companyId // ID de la empresa para crear el periodo
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { createPeriod, updatePeriod } = usePeriodOperations();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialValues) {
        console.log('=== DATOS PARA EDITAR ===');
        console.log('Initial values recibidos:', initialValues);
        
        // Mapear los datos correctamente para el formulario
        const formData = {
          ...initialValues,
          name: initialValues.name,
          period_type: initialValues.type,
          status: initialValues.status,
          company_profit_percentage: initialValues.company_profit_percentage,
          minimum_score_employee: initialValues.minimum_score_employee,
          formula_below_value: initialValues.formula_below_value,
        };
        
        console.log('Datos mapeados para el formulario:', formData);
        form.setFieldsValue(formData);
      } else {
        // Establecer valores por defecto para nuevo período
        form.resetFields();
        form.setFieldsValue({
          status: 'abierto' // Estado por defecto
        });
      }
    }
  }, [visible, initialValues, mode, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      console.log("🚀 ~ handleSubmit ~ values:", values)
      let result;
      
      if (mode === 'add') {
        result = await createPeriod(companyId, values);
        
        if (result.success) {
          message.success('Período creado exitosamente');
          form.resetFields();
          onSuccess && onSuccess(result.data); // Llamar callback de éxito
        } else {
          message.error(result.error || 'Error al crear el período');
        }
      } else {
        // Actualizar período existente usando PUT
        result = await updatePeriod(companyId, initialValues.id, values);
        
        if (result.success) {
          message.success('Período actualizado exitosamente');
          form.resetFields();
          onSuccess && onSuccess(result.data); // Llamar callback de éxito
        } else {
          message.error(result.error || 'Error al actualizar el período');
        }
      }
      
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Por favor complete todos los campos requeridos');
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
      title={mode === 'add' ? 'Añadir Nuevo Período' : 'Editar Período'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Cancelar
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
        >
          {mode === 'add' ? 'Crear Período' : 'Actualizar Período'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="periodForm"
        variant="filled"
      >
        <Form.Item
          name="name"
          label="Período"
          rules={[
            {
              required: true,
              message: 'Por favor ingrese el nombre del período',
            },
            {
              min: 2,
              message: 'El nombre debe tener al menos 2 caracteres',
            },
          ]}
        >
          <Input 
            placeholder="Ej: Q1 2024, Primer Semestre 2024, Enero-Marzo 2024"
            maxLength={50}
          />
        </Form.Item>

        <Form.Item
          name="period_type"
          label="Tipo"
          rules={[
            {
              required: true,
              message: 'Por favor seleccione el tipo de período',
            },
          ]}
        >
          <Select placeholder="Seleccione el tipo de período">
            {Object.entries(PERIOD_TYPES).map(([key, value]) => (
              <Option key={key} value={key}>
                {value}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Estado"
          rules={[
            {
              required: true,
              message: 'Por favor seleccione el estado del período',
            },
          ]}
        >
          <Select placeholder="Seleccione el estado del período">
            {Object.entries(PERIOD_STATUS).map(([key, value]) => (
              <Option key={key} value={key}>
                {value}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="minimum_score_employee"
          label="Calificación Mínima de Funcionario"
        >
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Ej: 70"
          />
        </Form.Item>
        <Form.Item
          name="company_profit_percentage"
          label="% de cumplimiento de la utilidad"
          rules={[
            { required: true, message: 'Por favor ingrese el % de cumplimiento de la utilidad' },
            { type: 'number', min: 0, max: 100, message: 'El porcentaje debe estar entre 0 y 100' }
          ]}
        >
          <InputNumber
            placeholder="Ingrese el % de cumplimiento"
            style={{ width: '100%' }}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
          />
        </Form.Item>

        <Form.Item
          name="formula_below_value"
          label="Formula puntuacion personal"
          rules={[
            { required: true, message: 'Por favor ingrese la fórmula de puntuación personal' }
          ]}
        >
          <Input
            placeholder="Ingrese la fórmula de puntuación personal"
            maxLength={255}
          />
        </Form.Item>

        
      </Form>
    </Modal>
  );
};

export default PeriodsForm;
