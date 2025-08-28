"use client";

import React, { useMemo } from "react";
import { Select, Form } from "antd";
import useSWR from "swr";
import { fetcher } from "@/constants";

const { Option } = Select;

const EmployeeFilterSelect = ({
  name = "employee_id",
  companyId,
  placeholder = "Filtrar por empleado",
  rules = [],
  ...props
}) => {
  const { data, isLoading, error } = useSWR(
    companyId
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employees`
      : null,
    (url) => fetcher(url, { method: "GET" })
  );

  const employees = useMemo(
    () =>
      data?.data?.map((item) => ({
        id: item.id,
        name: item.attributes?.name,
      })) || [],
    [data]
  );

  return (
    <Form.Item label="Empleado" name={name} rules={rules} style={{ marginBottom: 0 }}>
      <Select
        showSearch
        allowClear
        loading={isLoading}
        placeholder={placeholder}
        optionFilterProp="children"
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        {...props}
      >
        {employees.map((emp) => (
          <Option key={emp.id} value={emp.id}>
            {emp.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default EmployeeFilterSelect;
