import React, { useMemo } from 'react';
import { Select, Form } from 'antd';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';

const { Option } = Select;

const PositionFilterSelect = ({
  companyId,
  name = "position_id",
  placeholder = "Filtrar por posición",
  rules = [],
}) => {
  const swrKey = companyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/positions`
    : null;

  const { data: response, isLoading } = useSWR(
    swrKey,
    (url) => fetcher(url, { method: 'GET' })
  );

  const areas = useMemo(
    () =>
      response?.data?.map((item) => ({
        id: item.id,
        name: item.attributes.name,
      })) || [],
    [response?.data]
  );

  return (
    <Form.Item name={name} style={{ marginBottom: 0 }} rules={rules} label="Posición">
      <Select
        showSearch
        allowClear
        loading={isLoading}
        placeholder={placeholder}
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {areas.map((area) => (
          <Option key={area.id} value={area.id}>
            {area.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default PositionFilterSelect;