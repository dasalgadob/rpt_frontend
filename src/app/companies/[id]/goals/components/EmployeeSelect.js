"use client";

import React from "react";
import { Select, Form } from "antd";
import useSWR from "swr";
import { fetcher } from "../../../../../constants";

const { Option } = Select;

const EmployeeSelect = ({
  name = "employee_id",
  companyId,
  placeholder = "Seleccionar empleado",
  rules = [],
  ...props
}) => {
  // Llama al endpoint de empleados de la compañía
  const { data, isLoading, error } = useSWR(
    companyId
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employees`
      : null,
    (url) => fetcher(url, { method: "GET" })
  );

  // Transforma los datos recibidos
  const employees =
    data?.data?.map((item) => ({
      id: item.id,
      name:
        item.attributes?.name ||
        item.attributes?.full_name ||
        item.attributes?.email ||
        `Empleado ${item.id}`,
    })) || [];

  return (
    <Form.Item label="Empleado" name={name} rules={rules}>
      <Select
        style={{ width: "100%" }}
        showSearch
        allowClear
        loading={isLoading}
        placeholder={placeholder}
        optionFilterProp="children"
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

export default EmployeeSelect;
