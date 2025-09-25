"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, theme } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import useSWRMutation from 'swr/mutation';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import { fetcher } from '../../../constants';

const CompanyHeader = () => {
  const router = useRouter();
  const { token: { colorBgContainer } } = theme.useToken();
  const auth = useAuth();

  const { trigger, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/sign_out`, 
    (url) => fetcher(url, { method: 'DELETE' })
  );

  const handleLogout = async () => {
    try {
      await trigger();
      // clear Authorization header and auth state
      localStorage.removeItem('Authorization');
      if (auth && typeof auth.setAuth === 'function') auth.setAuth(null);
      toast.success('Sesión cerrada correctamente.');
      router.push('/');
    } catch (err) {
      if (err && err.status === 401) {
        toast.error('No autorizado. La sesión ya expiró o fue cerrada.');
        // still clear Authorization header
        localStorage.removeItem('Authorization');
        if (auth && typeof auth.setAuth === 'function') auth.setAuth(null);
        router.push('/');
      } else {
        toast.error(err?.message || 'Error al cerrar sesión. Intente de nuevo.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%', padding: '0 16px', background: colorBgContainer }}>
      <Button type="primary" danger icon={<LogoutOutlined />} loading={isMutating} onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default CompanyHeader;
