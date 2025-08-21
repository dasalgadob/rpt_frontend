"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message, Select } from 'antd';
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
      
      // Preparar los datos del periodo
      const periodData = {
        name: values.name,
        period_type: values.period_type,
        status: values.status,
        company_profit_percentage: values.company_profit_percentage,
        minimum_score_employee: values.minimum_score_employee
      };

      console.log('Datos del periodo a enviar:', periodData);
      console.log('Company ID:', companyId);
      console.log('Modo:', mode);

      let result;
      
      if (mode === 'add') {
        // Crear nuevo período usando POST
        console.log('=== INICIANDO CREACIÓN DE PERÍODO ===');
        console.log('Llamando createPeriod con:', { companyId, periodData });
        
        result = await createPeriod(companyId, periodData);
        
        console.log('=== RESULTADO DE createPeriod ===');
        console.log('Result:', result);
        
        if (result.success) {
          message.success('Período creado exitosamente');
          form.resetFields();
          onSuccess && onSuccess(result.data); // Llamar callback de éxito
        } else {
          message.error(result.error || 'Error al crear el período');
        }
      } else {
        // Actualizar período existente usando PUT
        result = await updatePeriod(companyId, initialValues.id, periodData);
        
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
          label={<span style={{ fontWeight: 'bold' }}>Período</span>}
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
          label={<span style={{ fontWeight: 'bold' }}>Tipo</span>}
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
          label={<span style={{ fontWeight: 'bold' }}>Estado</span>}
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
          name="company_profit_percentage"
          label={<span style={{ fontWeight: 'bold' }}>% Utilidad</span>}
        >
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Ej: 88"
            suffix="%"
          />
        </Form.Item>

        <Form.Item
          name="minimum_score_employee"
          label={<span style={{ fontWeight: 'bold' }}>Calificación Mínima de Funcionario</span>}
        >
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="Ej: 70"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PeriodsForm;
