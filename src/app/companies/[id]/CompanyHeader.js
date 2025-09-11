"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, theme } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import useSWRMutation from 'swr/mutation';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';

const CompanyHeader = () => {
  const router = useRouter();
  const { token: { colorBgContainer } } = theme.useToken();
  const auth = useAuth();

  const fetcher = async (url) => {
    const accessToken = localStorage.getItem('access-token');
    const client = localStorage.getItem('client');
    const uid = localStorage.getItem('uid');

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'access-token': accessToken } : {}),
        ...(client ? { client } : {}),
        ...(uid ? { uid } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = (body && (body.error || body.errors || body.message)) || res.statusText || 'Logout failed';
      const error = new Error(Array.isArray(message) ? message.join(', ') : message);
      error.status = res.status;
      throw error;
    }

    // some backends return an empty body on sign out
    return res.json().catch(() => ({}));
  };

  const { trigger, isMutating } = useSWRMutation(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign_out`, fetcher);

  const handleLogout = async () => {
    try {
      await trigger();
      // clear tokens and auth state
      localStorage.removeItem('access-token');
      localStorage.removeItem('client');
      localStorage.removeItem('uid');
      if (auth && typeof auth.setAuth === 'function') auth.setAuth(null);
      toast.success('Sesión cerrada correctamente.');
      router.push('/');
    } catch (err) {
      if (err && err.status === 401) {
        toast.error('No autorizado. La sesión ya expiró o fue cerrada.');
        // still clear local tokens
        localStorage.removeItem('access-token');
        localStorage.removeItem('client');
        localStorage.removeItem('uid');
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
