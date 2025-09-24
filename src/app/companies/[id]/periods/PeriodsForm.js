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

export default PeriodsForm;
