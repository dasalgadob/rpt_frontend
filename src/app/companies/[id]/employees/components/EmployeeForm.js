"use client";

import React, { useEffect, useRef } from 'react';
import { Form, Input, Modal } from 'antd';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';
import AreaSelect from '../../goals/components/AreaSelect';
import PositionTypeSelect from './PositionTypeSelect';
import PositionSelect from '@/components/position-select/PositionSelect';

const EmployeeForm = ({ 
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

  // SWR mutation for creating/updating employees
  const { trigger: saveEmployee, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employees`,
    async (url, { arg }) => {
      const { values, employeeId, method } = arg;
      const requestUrl = method === 'POST' ? url : `${url}/${employeeId}`;
      
      return fetcher(requestUrl, {
        method,
        body: { employee: values }
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
          employee_id: initialValues.employee_id,
          name: initialValues.nombre,
          department_id: initialValues.department_id,
          position_id: initialValues.position_id,
          position_type_id: initialValues.position_type_id,
          position_type_name: initialValues.position_type_name
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
      const employeeId = mode === 'edit' ? initialValues?.id : null;
      
      await saveEmployee({ values, employeeId, method });
      
      const successMessage = mode === 'edit' ? 'Empleado actualizado exitosamente' : 'Empleado creado exitosamente';
      toast.success(successMessage);
      
      onSuccess();
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Ant Design validation error - don't show toast
        return;
      }
      console.error('Error saving employee:', error);
      const errorMessage = mode === 'edit' ? 'Error al actualizar el empleado' : 'Error al crear el empleado';
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
        <Form.Item
          label="ID de Empleado"
          name="employee_id"
          rules={[
            { required: true, message: 'El ID del empleado es requerido' }
          ]}
        >
          <Input placeholder="Ingrese el ID del empleado" />
        </Form.Item>

        <Form.Item
          label="Nombre"
          name="name"
          rules={[
            { required: true, message: 'El nombre del empleado es requerido' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
          ]}
        >
          <Input placeholder="Ingrese el nombre del empleado" />
        </Form.Item>

        <AreaSelect
          companyId={companyId}
          name="department_id"
          rules={[
            { required: true, message: 'Debe seleccionar un área' }
          ]}
        />
        <PositionSelect
          companyId={companyId}
          name="position_id"
          rules={[
            { required: true, message: 'Debe seleccionar una posición' }
          ]}
        />

        <PositionTypeSelect
          companyId={companyId}
          name="position_type_id"
          rules={[
            { required: true, message: 'Debe seleccionar un tipo de posición' }
          ]}
        />
      </Form>
    </Modal>
  );
};

export default EmployeeForm;
