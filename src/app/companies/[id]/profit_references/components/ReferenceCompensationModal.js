"use client";

import React from 'react';
import { Modal, Table, Spin, Alert, Tag } from 'antd';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';

const ReferenceCompensationModal = ({ visible, onCancel, profitReferenceId, companyId }) => {
  const { data: response, error, isLoading } = useSWR(
    visible && profitReferenceId && companyId
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/reference_compensations?profit_reference_id=${profitReferenceId}`
      : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  const compensationData = response?.data || [];

  // Helper function to render percentage with color coding
  const renderPercentage = (percentage) => {
    if (!percentage) return 'N/A';
    
    const numPercentage = parseFloat(percentage);
    let color = '#1890ff'; // Default blue
    
    if (numPercentage >= 90) color = '#52c41a'; // Green for high percentage
    else if (numPercentage >= 75) color = '#faad14'; // Orange for medium percentage
    else if (numPercentage >= 50) color = '#fa8c16'; // Orange-red for low percentage
    else color = '#f5222d'; // Red for very low percentage

    return (
      <Tag color={color} style={{ fontSize: '14px', padding: '4px 8px' }}>
        {numPercentage}%
      </Tag>
    );
  };

  // Helper function to render compensation
  const renderCompensation = (compensation) => {
    if (!compensation) return 'N/A';
    
    const numCompensation = parseFloat(compensation);
    return (
      <Tag color="#722ed1" style={{ fontSize: '14px', padding: '4px 8px' }}>
        {numCompensation.toFixed(2)}
      </Tag>
    );
  };

  // Transform data for table
  const tableData = compensationData.map((item, index) => ({
    key: item.id || index,
    id: item.id,
    percentage: item.attributes?.percentage,
    compensation: item.attributes?.compensation,
  }));

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => parseInt(a.id) - parseInt(b.id),
    },
    {
      title: 'Porcentaje',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 150,
      render: renderPercentage,
      sorter: (a, b) => parseFloat(a.percentage || 0) - parseFloat(b.percentage || 0),
    },
    {
      title: 'Compensación',
      dataIndex: 'compensation',
      key: 'compensation',
      width: 150,
      render: renderCompensation,
      sorter: (a, b) => parseFloat(a.compensation || 0) - parseFloat(b.compensation || 0),
    },
  ];

  return (
    <Modal
      title="Compensaciones de Referencia"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Cargando compensaciones...</p>
        </div>
      )}

      {error && (
        <Alert
          message="Error"
          description="No se pudieron cargar las compensaciones de referencia"
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {!isLoading && !error && (
        <div>
          <div style={{ marginBottom: 24, padding: '16px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#389e0d' }}>💰 Compensaciones de Referencia</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#52c41a' }}>
              Esta tabla muestra los porcentajes y compensaciones asociados a la referencia de ganancia seleccionada.
            </p>
          </div>

          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Detalles de Compensación</h4>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Total: {tableData.length} registros
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            size="middle"
            bordered
            scroll={{ y: 400 }}
          />

          {tableData.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              No hay compensaciones disponibles para esta referencia
            </div>
          )}

          <div style={{ marginTop: 24, padding: '16px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>📊 Información</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Los porcentajes representan el nivel de cumplimiento y las compensaciones indican el factor multiplicador aplicable.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReferenceCompensationModal;
