"use client";

import React from 'react';
import useSWR from 'swr';
import { Spin, Alert, Form } from 'antd';
import { fetcher } from '../../../../../constants';

const DefaultPeriod = ({ companyId, name = "period_id", label = "Periodo por defecto" }) => {
  const { data, error, isLoading } = useSWR(
    companyId ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods/default_period` : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  if (isLoading) return <Spin size="small" />;
  if (error) return <Alert type="error" message="Error cargando el periodo por defecto" showIcon />;

  const period = data?.data;

  return (
    <Form.Item
      label={label}
      name={name}
      initialValue={period?.id}
      rules={[{ required: true, message: 'Por favor seleccione el periodo' }]}
    >
      <span>{period?.attributes?.name || <em>No hay periodo por defecto disponible.</em>}</span>
    </Form.Item>
  );
};

export default DefaultPeriod;