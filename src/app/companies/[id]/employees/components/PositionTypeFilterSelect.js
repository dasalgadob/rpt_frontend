"use client";

import React, { useMemo } from 'react';
import { Select, Form } from 'antd';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';

const { Option } = Select;

const PositionTypeFilterSelect = ({
  companyId,
  name = "position_type_id",
  placeholder = "Filtrar por tipo de posición",
  rules = [],
}) => {
  const swrKey = companyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/position_types`
    : null;

  const { data: response, isLoading } = useSWR(
    swrKey,
    (url) => fetcher(url, { method: 'GET' })
  );

  const positionTypes = useMemo(
    () =>
      response?.data?.map((item) => ({
        id: item.id,
        name: item.attributes.name,
      })) || [],
    [response?.data]
  );

  return (
    <Form.Item name={name} style={{ marginBottom: 0 }} rules={rules}>
      <Select
        showSearch
        allowClear
        loading={isLoading}
        placeholder={placeholder}
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {positionTypes.map((positionType) => (
          <Option key={positionType.id} value={positionType.id}>
            {positionType.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default PositionTypeFilterSelect;
