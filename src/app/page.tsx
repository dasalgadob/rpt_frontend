"use client";

import React, { useEffect } from 'react';
import { Button, Typography, Card, Row, Col, Form, Input } from 'antd';
import { BankOutlined, DashboardOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useSWRMutation from 'swr/mutation';
import { toast } from 'react-toastify';
import { fetcher } from '../constants';

const { Title, Paragraph } = Typography;

const loginFetcher = async (url: string, { arg }: { arg: { user: { email: string; password: string } } }) => {
  localStorage.clear();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(arg)
  });

  console.log('🚀 ~ loginFetcher ~ response:', response);

  if (!response.ok) {
    const error = new Error('Login failed');
    (error as any).status = response.status;
    throw error;
  }

  const headers = response.headers;
  console.log('🚀 ~ loginFetcher ~ headers:', headers);
  const authorization = headers.get('Authorization');

  // Get response data
  const data = await response.json();

  if (!authorization) {
    throw new Error('Missing Authorization header');
  }

  // Save Authorization header to localStorage
  localStorage.setItem('Authorization', authorization);

  return { authorization, data };
};

const Home: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  // Clear localStorage when component mounts
  useEffect(() => {
    localStorage.removeItem('Authorization');
  }, []);

  // SWR mutation for login
  const { trigger: login, isMutating, error } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/sign_in`,
    loginFetcher
  );

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      const authData = await login({user: { email: values.email, password: values.password }});
      console.log("🚀 ~ handleLogin ~ authData:", authData)
      
      // Fix the path to access company_id correctly
      const companyId = authData?.data?.status?.data?.user?.company_id;
      
      if (companyId) {
        toast.success('¡Inicio de sesión exitoso!');
        router.push(`/companies/${companyId}/goals`);
      } else {
        // Handle case where company_id is null or undefined
        toast.error('No se encontró una compañía asociada a este usuario');
        console.log('User data:', authData?.data?.status?.data?.user);
      }
    } catch (err: any) {
      console.log("🚀 ~ handleLogin ~ error:", err)
      if (err?.status === 401) {
        toast.error('Error de credenciales intentando autenticar');
      } else {
        console.error('Error inesperado ha sucedido:', err);
        toast.error('Error inesperado ha sucedido contacte con el administrador del sistema.');
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          maxWidth: 600, 
          width: '100%',
          textAlign: 'center',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ padding: '40px 20px' }}>
          <DashboardOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
          
          <Title level={1} style={{ marginBottom: 16, color: '#1f1f1f' }}>
            RPT Consultants
          </Title>
          
          <Paragraph style={{ fontSize: 18, color: '#666', marginBottom: 32 }}>
            Sistema de Gestión de Evaluaciones de Desempeño
          </Paragraph>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            style={{ maxWidth: 350, margin: '0 auto' }}
          >
            <Form.Item
              name="email"
              label="Correo electrónico"
              rules={[{ required: true, message: 'Ingrese su correo' }, { type: 'email', message: 'Correo inválido' }]}
            >
              <Input placeholder="user@example.com" size="large" autoComplete="email" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, message: 'Ingrese su contraseña' }]}
            >
              <Input.Password placeholder="Contraseña" size="large" autoComplete="current-password" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isMutating}
              block
              icon={<BankOutlined />}
              style={{ borderRadius: 8, fontSize: 16, height: 48 }}
            >
              Iniciar sesión
            </Button>
          </Form>
          
          <div style={{ marginTop: 32, color: '#999' }}>
            <Paragraph style={{ margin: 0, fontSize: 14 }}>
              Gestiona períodos, metas, empleados y evaluaciones de manera eficiente
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;
