"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Card, Progress, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const Weights = ({ companyId }) => {
  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add', // 'add' or 'edit'
    selectedRecord: null
  });

  // Test data for the weights table
  const testWeights = [
    {
      id: 1,
      tipo_posicion: 'Gerencial',
      porcentaje_corporativo: 40,
      porcentaje_area: 30,
      porcentaje_cargo: 30,
      total: 100
    },
    {
      id: 2,
      tipo_posicion: 'Supervisorio',
      porcentaje_corporativo: 35,
      porcentaje_area: 35,
      porcentaje_cargo: 30,
      total: 100
    },
    {
      id: 3,
      tipo_posicion: 'Técnico',
      porcentaje_corporativo: 30,
      porcentaje_area: 40,
      porcentaje_cargo: 30,
      total: 100
    },
    {
      id: 4,
      tipo_posicion: 'Operativo',
      porcentaje_corporativo: 25,
      porcentaje_area: 35,
      porcentaje_cargo: 40,
      total: 100
    },
    {
      id: 5,
      tipo_posicion: 'Administrativo',
      porcentaje_corporativo: 20,
      porcentaje_area: 30,
      porcentaje_cargo: 50,
      total: 100
    }
  ];

  const handleEdit = (record) => {
    setModalState({
      visible: true,
      mode: 'edit',
      selectedRecord: record
    });
    toast.info(`Editando pesos para: ${record.tipo_posicion}`);
  };

  const handleDelete = (record) => {
    toast.info(`Eliminando pesos para: ${record.tipo_posicion}`);
    // TODO: Implement delete functionality
  };

  const handleAdd = () => {
    setModalState({
      visible: true,
      mode: 'add',
      selectedRecord: null
    });
  };

  // Helper function to render percentage with color coding
  const renderPercentage = (percentage, type) => {
    let color = '#1890ff'; // Default blue
    
    // Color coding based on percentage ranges
    if (percentage >= 40) color = '#52c41a'; // Green for high percentages
    else if (percentage >= 30) color = '#faad14'; // Orange for medium percentages
    else if (percentage >= 20) color = '#fa8c16'; // Orange-red for low percentages
    else color = '#f5222d'; // Red for very low percentages

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress 
          percent={percentage} 
          size="small" 
          style={{ width: 80 }} 
          strokeColor={color}
          showInfo={false}
        />
        <span style={{ fontWeight: 'bold' }}>{percentage}%</span>
      </div>
    );
  };

  // Helper function to render total with validation
  const renderTotal = (total) => {
    const isValid = total === 100;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tag color={isValid ? 'green' : 'red'}>
          {total}%
        </Tag>
        {!isValid && (
          <span style={{ color: '#f5222d', fontSize: '12px' }}>
            ⚠️ Debe sumar 100%
          </span>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: 'Tipo de Posición',
      dataIndex: 'tipo_posicion',
      key: 'tipo_posicion',
      width: 150,
      render: (text) => (
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
          {text}
        </Tag>
      ),
      sorter: (a, b) => a.tipo_posicion.localeCompare(b.tipo_posicion),
    },
    {
      title: 'Porcentaje Corporativo',
      dataIndex: 'porcentaje_corporativo',
      key: 'porcentaje_corporativo',
      width: 180,
      render: (percentage) => renderPercentage(percentage, 'corporativo'),
      sorter: (a, b) => a.porcentaje_corporativo - b.porcentaje_corporativo,
    },
    {
      title: 'Porcentaje de Área',
      dataIndex: 'porcentaje_area',
      key: 'porcentaje_area',
      width: 160,
      render: (percentage) => renderPercentage(percentage, 'area'),
      sorter: (a, b) => a.porcentaje_area - b.porcentaje_area,
    },
    {
      title: 'Porcentaje de Cargo',
      dataIndex: 'porcentaje_cargo',
      key: 'porcentaje_cargo',
      width: 160,
      render: (percentage) => renderPercentage(percentage, 'cargo'),
      sorter: (a, b) => a.porcentaje_cargo - b.porcentaje_cargo,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: renderTotal,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            title="Editar pesos"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
            title="Eliminar configuración"
          />
        </Space>
      ),
    },
  ];

  // Calculate summary statistics
  const totalRecords = testWeights.length;
  const validRecords = testWeights.filter(item => item.total === 100).length;
  const invalidRecords = totalRecords - validRecords;

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Configuración de Pesos por Tipo de Posición</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <span>Total: {totalRecords}</span>
            <span style={{ marginLeft: 8, color: '#52c41a' }}>Válidos: {validRecords}</span>
            {invalidRecords > 0 && (
              <span style={{ marginLeft: 8, color: '#f5222d' }}>Inválidos: {invalidRecords}</span>
            )}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Añadir Configuración
          </Button>
        </div>
      </div>
      
      <Card>
        <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#389e0d' }}>📋 Información Important</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#52c41a' }}>
            La suma de los porcentajes (Corporativo + Área + Cargo) debe ser exactamente <strong>100%</strong> para cada tipo de posición.
            Los pesos determinan la importancia relativa de cada tipo de meta en la evaluación final.
          </p>
        </div>
        
        <Table
          columns={columns}
          dataSource={testWeights}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} configuraciones`,
          }}
          size="middle"
        />
      </Card>

      {/* TODO: Add WeightForm modal component */}
      {modalState.visible && (
        <div>Weight configuration form modal placeholder</div>
      )}
    </div>
  );
};

export default Weights;
