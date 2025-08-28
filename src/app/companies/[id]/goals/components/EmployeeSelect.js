"use client";

import React, { useEffect, useState, useMemo } from "react";
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
        name:
          item.attributes?.name,
      })) || [],
    [data]
  );

  const EmployeeSelectField = (props) => {
    const { value, onChange } = props;
    const [displayValue, setDisplayValue] = useState(null);

    useEffect(() => {
      if (!value) {
        setDisplayValue(null);
        return;
      }
      // If value is an object (labelInValue), extract value
      const id = typeof value === 'object' && value !== null ? value.value : value;
      const emp = employees.find((e) => String(e.id) === String(id));
      if (emp) {
        setDisplayValue({ value: emp.id, label: emp.name });
      } else {
        setDisplayValue({ value: id, label: isLoading ? "Cargando..." : `Empleado ${id}` });
      }
    }, [value, employees, isLoading]);

    if (value && employees.length > 0) {
      const emp = employees.find((e) => String(e.id) === String(value));
      if (emp && (!displayValue || displayValue.label !== emp.name)) {
        setDisplayValue({ value: emp.id, label: emp.name });
      }
    }

    return (
      <Select
        style={{ width: "100%" }}
        placeholder={placeholder}
        loading={isLoading}
        allowClear
        showSearch
        labelInValue
        optionLabelProp="label"
        value={displayValue}
        filterOption={(input, option) =>
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        onChange={(selected) => {
          onChange(selected?.value);
        }}
        notFoundContent={
          isLoading ? "Cargando..." : "No hay empleados disponibles"
        }
        {...props}
      >
        {employees.map((emp) => (
          <Option key={emp.id} value={emp.id} label={emp.name}>
            {emp.name}
          </Option>
        ))}
      </Select>
    );
  };

  return (
    <Form.Item label="Empleado" name={name} rules={rules}>
      <EmployeeSelectField />
    </Form.Item>
  );
};

export default EmployeeSelect;
