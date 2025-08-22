"use client";

import React, { useState } from 'react';
import { Table, Button, Space, Card, Progress, Form, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { fetcher } from '../../../../../constants';
import { toast } from 'react-toastify';
import PeriodSelect from '../../goals/components/PeriodSelect';
import EvaluationEditModal from './EvaluationEditModal';

const Evaluations = ({ companyId }) => {
  const [filterForm] = Form.useForm();
  const [periodFilter, setPeriodFilter] = useState(null);
  
  const [modalState, setModalState] = useState({
    visible: false,
    mode: 'add', // 'add' or 'edit'
    selectedRecord: null
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const { data: response, error, isLoading, mutate } = useSWR(
    companyId && periodFilter
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employee_evaluations?period_id=${periodFilter}`
      : null,
    (url) => fetcher(url, { method: 'GET' })
  );

  // Watch for form changes and trigger SWR revalidation
  const onFilterFormChange = (changedValues, allValues) => {
    if ('period' in changedValues) {
      setPeriodFilter(allValues.period);
    }
  };

  // Transform the response data to component format
  const evaluations = response?.data?.map(item => ({
    id: item.id,
    employee_id: item.attributes?.employee?.employee_id,
    nombre: item.attributes?.employee?.name,
    area: item.attributes?.employee?.department_name,
    cargo: item.attributes?.employee?.position_name,
    tipo_posicion: item.attributes?.employee?.position_type_name,
    // Percentages with target values
    corporate_percentage_result: parseFloat(item.attributes?.corporate_percentage_result || 0),
    corporate_percentage_target: parseFloat(item.attributes?.position_type_weight_info?.corporate_percentage || 0),
    department_percentage_result: parseFloat(item.attributes?.department_percentage_result || 0),
    department_percentage_target: parseFloat(item.attributes?.position_type_weight_info?.department_percentage || 0),
    position_percentage_result: parseFloat(item.attributes?.position_percentage_result || 0),
    position_percentage_target: parseFloat(item.attributes?.position_type_weight_info?.position_percentage || 0),
    // Score results for evaluations
    department_score_result: parseFloat(item.attributes?.department_score_result || 0),
    position_score_result: parseFloat(item.attributes?.position_score_result || 0),
    // Competencies
    job_competencies_percentage: item.attributes?.position_type_weight_info?.job_competencies_percentage !== undefined && item.attributes?.position_type_weight_info?.job_competencies_percentage !== null ? parseFloat(item.attributes?.position_type_weight_info?.job_competencies_percentage) : null,
    job_competencies_score: item.attributes?.job_competencies_score !== undefined && item.attributes?.job_competencies_score !== null ? parseFloat(item.attributes?.job_competencies_score) : null,
    // Overall evaluation score
    evaluation_score: parseFloat(item.attributes?.evaluation_score || 0),
    // Corporate score comes from general response
    corporate_score: parseFloat(response?.corporate_score || 0),
    // Variable compensation
    variable_compensation: parseFloat(item.attributes?.variable_compensation || 0),
  })) || [];

  const handleEdit = (record) => {
    setSelectedEvaluation(record);
    setEditModalVisible(true);
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

  // Helper function to render percentage with progress bar and target
  const renderPercentageWithTarget = (result, target) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
        {result.toFixed(1)}% / {target.toFixed(0)}%
      </span>
    </div>
  );

  // Helper function to render score with color
  const renderScore = (score) => (
    <span style={{ color: getScoreColor(score), fontWeight: 'bold' }}>
      {score ? score.toFixed(1) : 'N/A'}
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
      width: 120,
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
      title: '% Metas Corporativas',
      key: 'corporate_percentage',
      width: 180,
      render: (_, record) => renderPercentageWithTarget(record.corporate_percentage_result, record.corporate_percentage_target),
      sorter: (a, b) => (a.corporate_percentage_result || 0) - (b.corporate_percentage_result || 0),
    },
    {
      title: 'Puntuación Metas Corporativas',
      key: 'corporate_score',
      width: 180,
      render: (_, record) => renderScore(record.corporate_score),
      sorter: (a, b) => (a.corporate_score || 0) - (b.corporate_score || 0),
    },
    {
      title: '% Metas de Área',
      key: 'department_percentage',
      width: 160,
      render: (_, record) => renderPercentageWithTarget(record.department_percentage_result, record.department_percentage_target),
      sorter: (a, b) => (a.department_percentage_result || 0) - (b.department_percentage_result || 0),
    },
    {
      title: 'Evaluación de Metas de Área',
      dataIndex: 'department_score_result',
      key: 'department_evaluation',
      width: 180,
      render: renderScore,
      sorter: (a, b) => (a.department_score_result || 0) - (b.department_score_result || 0),
    },
    {
      title: '% Metas Individuales',
      key: 'position_percentage',
      width: 180,
      render: (_, record) => renderPercentageWithTarget(record.position_percentage_result, record.position_percentage_target),
      sorter: (a, b) => (a.position_percentage_result || 0) - (b.position_percentage_result || 0),
    },
    {
      title: 'Evaluación Metas Individuales',
      dataIndex: 'position_score_result',
      key: 'position_evaluation',
      width: 180,
      render: renderScore,
      sorter: (a, b) => (a.position_score_result || 0) - (b.position_score_result || 0),
    },
    {
      title: '% Competencias',
      key: 'job_competencies_percentage',
      width: 150,
      render: (_, record) => {
        const value = record.job_competencies_percentage;
        return value !== undefined && value !== null ? (
          <span style={{ fontWeight: 'bold' }}>{Number(value).toFixed(1)}%</span>
        ) : 'N/A';
      },
      sorter: (a, b) => (a.job_competencies_percentage || 0) - (b.job_competencies_percentage || 0),
    },
    {
      title: 'Puntuación competencias',
      key: 'job_competencies_score',
      width: 170,
      render: (_, record) => {
        const value = record.job_competencies_score;
        return value !== undefined && value !== null ? (
          <span style={{ fontWeight: 'bold', color: getScoreColor(value) }}>{Number(value).toFixed(1)}</span>
        ) : 'N/A';
      },
      sorter: (a, b) => (a.job_competencies_score || 0) - (b.job_competencies_score || 0),
    },
    {
      title: 'Puntuación Total',
      dataIndex: 'evaluation_score',
      key: 'evaluation_score',
      width: 120,
      render: (score) => (
        <span style={{ 
          color: getScoreColor(score), 
          fontWeight: 'bold', 
          fontSize: '16px'
        }}>
          {score ? score.toFixed(1) : 'N/A'}
        </span>
      ),
      sorter: (a, b) => (a.evaluation_score || 0) - (b.evaluation_score || 0),
    },
    {
      title: 'Compensación Variable',
      dataIndex: 'variable_compensation',
      key: 'variable_compensation',
      width: 150,
      render: (value) => value !== undefined && value !== null ? (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{Number(value).toFixed(2)}</span>
      ) : 'N/A',
      sorter: (a, b) => (a.variable_compensation || 0) - (b.variable_compensation || 0),
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

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3 style={{ color: '#ff4d4f' }}>Error cargando evaluaciones</h3>
          <p>{error.message}</p>
          <Button onClick={() => mutate()}>Reintentar</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Form form={filterForm} onValuesChange={onFilterFormChange}>
        <Row gutter={16}>
          <Col span={6}>
            <PeriodSelect
              name="period"
              companyId={companyId}
              placeholder="Seleccionar periodo"
              selectFirstAsDefault={true}
            />
          </Col>
        </Row>
      </Form>
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Evaluaciones de Desempeño</h3>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Total de evaluaciones: {evaluations.length}
          {response?.corporate_score && (
            <span style={{ marginLeft: 16 }}>
              Puntuación Corporativa: <strong style={{ color: getScoreColor(response.corporate_score) }}>
                {parseFloat(response.corporate_score).toFixed(1)}
              </strong>
            </span>
          )}
        </div>
      </div>
      
      <Card>
        <Table
          columns={columns}
          dataSource={evaluations}
          loading={isLoading}
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

      <EvaluationEditModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={() => { setEditModalVisible(false); mutate(); }}
        evaluation={selectedEvaluation}
        companyId={companyId}
      />
    </div>
  );
};

export default Evaluations;
