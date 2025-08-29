"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Select, Form } from "antd";
import useSWR from "swr";
import { fetcher } from "../constants";
import type { Rule } from "antd/es/form";

const { Option } = Select;

interface Period {
  id: string | number;
  name: string;
}

interface PeriodSelectProps {
  companyId: string | number;
  placeholder?: string;
  rules?: Rule[];
  name: string;
}

const PeriodSelect: React.FC<PeriodSelectProps> = ({
  companyId,
  placeholder = "Seleccionar periodo",
  rules = [],
  name,
}) => {
  const swrKey = companyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods`
    : null;

  const {
    data: response,
    error,
    isLoading,
  } = useSWR(swrKey, (url: string) => fetcher(url, { method: "GET" }));

  const periods: Period[] = useMemo(() => {
    return (
      response?.data?.map((item: any) => ({
        id: item.id,
        name: item.attributes.name,
      })) || []
    );
  }, [response?.data]);

  const PeriodSelectField: React.FC<any> = (props) => {
    const { value, onChange } = props;
    const [displayValue, setDisplayValue] = useState<any>(null);

    useEffect(() => {
      if (!value) {
        setDisplayValue(null);
        return;
      }
      const period = periods.find((p) => String(p.id) === String(value));
      if (period) {
        setDisplayValue({ value: period.id, label: period.name });
      } else {
        setDisplayValue({
          value: value,
          label: isLoading ? "Cargando..." : `Periodo ${value}`,
        });
      }
    }, [value]);

    if (value && periods.length > 0) {
      const period = periods.find((p) => String(p.id) === String(value));
      if (
        period &&
        (!displayValue || displayValue.label !== period.name)
      ) {
        setDisplayValue({ value: period.id, label: period.name });
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
        value={displayValue}
        filterOption={(input, option) =>
          (option?.children as unknown as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        onChange={(selected) => {
          onChange(selected?.value);
        }}
        notFoundContent={
          isLoading ? "Cargando..." : "No hay periodos disponibles"
        }
      >
        {periods.map((period) => (
          <Option key={period.id} value={period.id}>
            {period.name}
          </Option>
        ))}
      </Select>
    );
  };

  if (isLoading) {
    return <div>Cargando periodos...</div>;
  }
  if (error) {
    return <div>Error cargando periodos</div>;
  }

  return (
    <Form.Item
      label="Periodo"
      name={name}
      style={{ marginBottom: 0 }}
      rules={rules}
    >
      <PeriodSelectField />
    </Form.Item>
  );
};

export default PeriodSelect;
