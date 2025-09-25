"use client";

import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '@/constants';
import { toast } from 'react-toastify';

interface UserModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  initialValues?: {
    id?: number;
    name?: string;
    email?: string;
  } | null;
  mode: 'add' | 'edit';
  companyId: string;
}

const UserModal: React.FC<UserModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  initialValues,
  mode,
  companyId
}) => {
  const [form] = Form.useForm();

  // Create user mutation
  const { trigger: createUser, isMutating: isCreating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/users`,
    (url: string, { arg }: { arg: any }) => fetcher(url, { method: 'POST', body: arg })
  );

  // Update user mutation
  const { trigger: updateUser, isMutating: isUpdating } = useSWRMutation(
    initialValues?.id ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/users/${initialValues.id}` : null,
    (url: string, { arg }: { arg: any }) => fetcher(url, { method: 'PATCH', body: arg })
  );

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          email: initialValues.email,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, mode, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const userData = {
        user: {
          name: values.name,
          email: values.email,
          ...(mode === 'add' && {
            password: values.password,
            password_confirmation: values.password_confirmation,
          }),
        },
      };

      if (mode === 'add') {
        await createUser(userData);
        toast.success('Usuario creado exitosamente');
      } else {
        if (initialValues?.id) {
          await updateUser(userData);
          toast.success('Usuario actualizado exitosamente');
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting user:', error);
      toast.error(error?.message || `Error al ${mode === 'add' ? 'crear' : 'actualizar'} usuario`);
    }
  };

  const validatePasswordConfirmation = (_: any, value: string) => {
    if (!value || value === form.getFieldValue('password')) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Las contraseñas no coinciden'));
  };

  return (
    <Modal
      title={mode === 'add' ? 'Añadir Usuario' : 'Editar Usuario'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[
            { required: true, message: 'Por favor ingrese el nombre' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Ingrese el nombre del usuario"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Por favor ingrese el email' },
            { type: 'email', message: 'Por favor ingrese un email válido' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="usuario@ejemplo.com"
            size="large"
            autoComplete="email"
          />
        </Form.Item>

        {mode === 'add' && (
          <>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                { required: true, message: 'Por favor ingrese la contraseña' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Ingrese la contraseña"
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="password_confirmation"
              label="Confirmación de contraseña"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Por favor confirme la contraseña' },
                { validator: validatePasswordConfirmation },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirme la contraseña"
                size="large"
                autoComplete="new-password"
              />
            </Form.Item>
          </>
        )}

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
            >
              {mode === 'add' ? 'Crear Usuario' : 'Actualizar Usuario'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;
