"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useCompanyOperations } from '../../hooks/useCompanies';

const CompanyForm = ({ 
  visible, 
  onCancel, 
  onSuccess, // Cambiar nombre para ser más claro
  initialValues = null, 
  mode = 'add' // 'add' or 'edit'
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { createCompany, updateCompany } = useCompanyOperations();

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, mode, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Preparar los datos de la empresa
      const companyData = {
        name: values.name,
        // Puedes agregar más campos aquí según tu API
      };

      let result;
      
      if (mode === 'add') {
        // Crear nueva empresa usando POST
        result = await createCompany(companyData);
        
        if (result.success) {
          message.success('Empresa creada exitosamente');
          form.resetFields();
          onSuccess && onSuccess(result.data); // Llamar callback de éxito
        } else {
          message.error(result.error || 'Error al crear la empresa');
        }
      } else {
        // Actualizar empresa existente usando PUT
        result = await updateCompany(initialValues.id, companyData);
        
        if (result.success) {
          message.success('Empresa actualizada exitosamente');
          form.resetFields();
          onSuccess && onSuccess(result.data); // Llamar callback de éxito
        } else {
          message.error(result.error || 'Error al actualizar la empresa');
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
      title={mode === 'add' ? 'Añadir Nueva Empresa' : 'Editar Empresa'}
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
          {mode === 'add' ? 'Crear Empresa' : 'Actualizar Empresa'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="companyForm"
        variant="filled"
      >
        <Form.Item
          name="name"
          label={<span style={{ fontWeight: 'bold' }}>Nombre de la empresa</span>}
          rules={[
            {
              required: true,
              message: 'Por favor ingrese el nombre de la empresa',
            },
            {
              min: 2,
              message: 'El nombre debe tener al menos 2 caracteres',
            },
          ]}
        >
          <Input 
            placeholder="Ingrese el nombre de la empresa"
            maxLength={100}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompanyForm;
