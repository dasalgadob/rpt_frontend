"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Card, Progress } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const Evaluations = ({ companyId }) => {
  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add', // 'add' or 'edit'
    selectedRecord: null
  });

  // Test data for the evaluations table
  const testEvaluations = [
    {
      id: 1,
      employee_id: 'EMP001',
      nombre: 'Juan Pérez',
      area: 'Recursos Humanos',
      cargo: 'Gerente de RRHH',
      tipo_posicion: 'Gerencial',
      porcentaje_metas_corporativas: 85,
      puntuacion_metas_corporativas: 84,
      porcentaje_metas_area: 90,
      evaluacion_metas_area: 89,
      porcentaje_metas_individuales: 88,
      evaluacion_metas_individuales: 87,
      puntuacion_total: 87,
      compensacion_variable: 1.45
    },
    {
      id: 2,
      employee_id: 'EMP002',
      nombre: 'María García',
      area: 'Ventas',
      cargo: 'Ejecutiva de Ventas',
      tipo_posicion: 'Operativo',
      porcentaje_metas_corporativas: 92,
      puntuacion_metas_corporativas: 91,
      porcentaje_metas_area: 95,
      evaluacion_metas_area: 94,
      porcentaje_metas_individuales: 91,
      evaluacion_metas_individuales: 90,
      puntuacion_total: 92,
      compensacion_variable: 2.15
    },
    {
      id: 3,
      employee_id: 'EMP003',
      nombre: 'Carlos López',
      area: 'Tecnología',
      cargo: 'Desarrollador Senior',
      tipo_posicion: 'Técnico',
      porcentaje_metas_corporativas: 78,
      puntuacion_metas_corporativas: 76,
      porcentaje_metas_area: 82,
      evaluacion_metas_area: 81,
      porcentaje_metas_individuales: 85,
      evaluacion_metas_individuales: 84,
      puntuacion_total: 80,
      compensacion_variable: 0.98
    },
    {
      id: 4,
      employee_id: 'EMP004',
      nombre: 'Ana Rodríguez',
      area: 'Marketing',
      cargo: 'Coordinadora de Marketing',
      tipo_posicion: 'Supervisorio',
      porcentaje_metas_corporativas: 87,
      puntuacion_metas_corporativas: 86,
      porcentaje_metas_area: 89,
      evaluacion_metas_area: 88,
      porcentaje_metas_individuales: 86,
      evaluacion_metas_individuales: 85,
      puntuacion_total: 86,
      compensacion_variable: 1.78
    },
    {
      id: 5,
      employee_id: 'EMP005',
      nombre: 'Luis Martínez',
      area: 'Finanzas',
      cargo: 'Analista Financiero',
      tipo_posicion: 'Operativo',
      porcentaje_metas_corporativas: 83,
      puntuacion_metas_corporativas: 82,
      porcentaje_metas_area: 86,
      evaluacion_metas_area: 85,
      porcentaje_metas_individuales: 89,
      evaluacion_metas_individuales: 88,
      puntuacion_total: 85,
      compensacion_variable: 1.32
    }
  ];

  const handleEdit = (record) => {
    setModalState({
      visible: true,
      mode: 'edit',
      selectedRecord: record
    });
    toast.info(`Editando evaluación de: ${record.nombre}`);
  };

  const handleDelete = (record) => {
    toast.info(`Eliminando evaluación de: ${record.nombre}`);
    // TODO: Implement delete functionality
  };

  // Helper function to get color based on score (1-100 scale)
  const getScoreColor = (score) => {
    if (score >= 90) return '#52c41a'; // Green
    if (score >= 80) return '#faad14'; // Orange
    if (score >= 70) return '#fa8c16'; // Orange-red
    return '#f5222d'; // Red
  };

  // Helper function to render percentage with progress bar
  const renderPercentage = (percentage) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Progress 
        percent={percentage} 
        size="small" 
        style={{ width: 60 }} 
        strokeColor={percentage >= 90 ? '#52c41a' : percentage >= 80 ? '#faad14' : '#f5222d'}
      />
    </div>
  );

  // Helper function to render score with color
  const renderScore = (score) => (
    <span style={{ color: getScoreColor(score), fontWeight: 'bold' }}>
      {score || 'N/A'}
    </span>
  );

  // Helper function to render compensation variable with color coding
  const renderCompensationVariable = (compensation) => {
    if (!compensation) return 'N/A';
    
    let color = '#1890ff'; // Default blue
    
    if (compensation >= 2.0) color = '#52c41a'; // Green for high compensation
    else if (compensation >= 1.5) color = '#faad14'; // Orange for medium compensation
    else if (compensation >= 1.0) color = '#fa8c16'; // Orange-red for low compensation
    else color = '#f5222d'; // Red for very low compensation

    return (
      <span style={{ 
        color, 
        fontWeight: 'bold', 
        fontSize: '14px',
        padding: '2px 6px',
        backgroundColor: `${color}15`,
        borderRadius: '4px',
        border: `1px solid ${color}30`
      }}>
        {compensation.toFixed(2)}
      </span>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'employee_id',
      key: 'employee_id',
      width: 80,
      fixed: 'left',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 150,
      fixed: 'left',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Área',
      dataIndex: 'area',
      key: 'area',
      width: 120,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
      width: 150,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Tipo de Posición',
      dataIndex: 'tipo_posicion',
      key: 'tipo_posicion',
      width: 130,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Porcentaje Metas Corporativas',
      dataIndex: 'porcentaje_metas_corporativas',
      key: 'porcentaje_metas_corporativas',
      width: 180,
      render: renderPercentage,
      sorter: (a, b) => (a.porcentaje_metas_corporativas || 0) - (b.porcentaje_metas_corporativas || 0),
    },
    {
      title: 'Puntuación Metas Corporativas',
      dataIndex: 'puntuacion_metas_corporativas',
      key: 'puntuacion_metas_corporativas',
      width: 180,
      render: renderScore,
      sorter: (a, b) => (a.puntuacion_metas_corporativas || 0) - (b.puntuacion_metas_corporativas || 0),
    },
    {
      title: 'Porcentaje Metas de Área',
      dataIndex: 'porcentaje_metas_area',
      key: 'porcentaje_metas_area',
      width: 160,
      render: renderPercentage,
      sorter: (a, b) => (a.porcentaje_metas_area || 0) - (b.porcentaje_metas_area || 0),
    },
    {
      title: 'Evaluación de Metas de Área',
      dataIndex: 'evaluacion_metas_area',
      key: 'evaluacion_metas_area',
      width: 180,
      render: renderScore,
      sorter: (a, b) => (a.evaluacion_metas_area || 0) - (b.evaluacion_metas_area || 0),
    },
    {
      title: 'Porcentaje Metas Individuales',
      dataIndex: 'porcentaje_metas_individuales',
      key: 'porcentaje_metas_individuales',
      width: 180,
      render: renderPercentage,
      sorter: (a, b) => (a.porcentaje_metas_individuales || 0) - (b.porcentaje_metas_individuales || 0),
    },
    {
      title: 'Evaluación Metas Individuales',
      dataIndex: 'evaluacion_metas_individuales',
      key: 'evaluacion_metas_individuales',
      width: 180,
      render: renderScore,
      sorter: (a, b) => (a.evaluacion_metas_individuales || 0) - (b.evaluacion_metas_individuales || 0),
    },
    {
      title: 'Puntuación Total',
      dataIndex: 'puntuacion_total',
      key: 'puntuacion_total',
      width: 120,
      render: (score) => (
        <span style={{ 
          color: getScoreColor(score), 
          fontWeight: 'bold', 
          fontSize: '16px'
        }}>
          {score || 'N/A'}
        </span>
      ),
      sorter: (a, b) => (a.puntuacion_total || 0) - (b.puntuacion_total || 0),
    },
    {
      title: 'Compensación Variable',
      dataIndex: 'compensacion_variable',
      key: 'compensacion_variable',
      width: 150,
      render: renderCompensationVariable,
      sorter: (a, b) => (a.compensacion_variable || 0) - (b.compensacion_variable || 0),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            title="Editar evaluación"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
            title="Eliminar evaluación"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Evaluaciones de Desempeño</h3>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Total de evaluaciones: {testEvaluations.length}
        </div>
      </div>
      
      <Card>
        <Table
          columns={columns}
          dataSource={testEvaluations}
          rowKey="id"
          scroll={{ x: 1650 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} evaluaciones`,
          }}
          size="small"
        />
      </Card>

      {/* TODO: Add EvaluationForm modal component */}
      {modalState.visible && (
        <div>Evaluation form modal placeholder</div>
      )}
    </div>
  );
};

export default Evaluations;
