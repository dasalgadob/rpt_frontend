"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Select, Form } from "antd";
import useSWR from "swr";
import { fetcher } from "@/constants";

const { Option } = Select;

const PeriodSelectFilter = ({
  companyId,
  placeholder = "Seleccionar periodo",
  rules = [],
  name,
  selectFirstAsDefault = false,
}) => {
  const swrKey = companyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/periods`
    : null;

  const {
    data: response,
    error,
    isLoading,
  } = useSWR(swrKey, (url) => fetcher(url, { method: "GET" }));

  const periods = useMemo(() => {
    return (
      response?.data?.map((item) => ({
        id: item.id,
        name: item.attributes.name,
      })) || []
    );
  }, [response?.data]);

  const PeriodSelectField = (props) => {
    const { value, onChange } = props;
    const [displayValue, setDisplayValue] = useState(null);

    // Auto-select first period if enabled and no value is set
    useEffect(() => {
      if (selectFirstAsDefault && periods.length > 0 && !value && onChange) {
        const firstPeriodId = periods[0].id;
        onChange(firstPeriodId);
      }
    }, [selectFirstAsDefault, periods, value, onChange]);

    // Update display value when periods load or value changes
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
    }, [value, periods, isLoading]);

    // Ensure displayValue is updated if periods change
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
          option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
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

export default PeriodSelectFilter;
