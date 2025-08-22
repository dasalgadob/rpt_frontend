"use client";

import React, { useEffect, useMemo } from 'react';
import { Modal, Form, InputNumber, Descriptions, Button } from 'antd';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcher } from '../../../../../constants';

const EvaluationEditModal = ({ visible, onCancel, onSuccess, evaluation, companyId }) => {
  const [form] = Form.useForm();

  // Fetch the latest evaluation data when modal is open
  const { data: evalResponse, isLoading } = useSWR(
    visible && evaluation?.id
      ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employee_evaluations/${evaluation.id}`
      : null,
    (url) => fetcher(url, { method: 'GET' }),
    { refreshInterval: 0 }
  );

  const evalData = useMemo(() => evalResponse?.data?.attributes || {}, [evalResponse]);

  useEffect(() => {
    if (visible && (evalData || evaluation)) {
      form.setFieldsValue({ job_competencies_score: evalData.job_competencies_score ?? evaluation.job_competencies_score });
    }
  }, [visible, evalData, evaluation, form]);

  const updateUrl = evaluation?.id ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${companyId}/employee_evaluations/${evaluation.id}` : null;
  // SWR mutation for updating the evaluation
  const { trigger: updateEvaluation, isMutating } = useSWRMutation(
    updateUrl,
    async (url, { arg }) => {
      return fetcher(url, {
        method: 'PUT',
        body: { employee_evaluation: { job_competencies_score: arg.job_competencies_score } },
        headers: { 'Content-Type': 'application/json' },
      });
    }
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await updateEvaluation({ job_competencies_score: values.job_competencies_score });
      onSuccess();
      form.resetFields();
    } catch (err) {
      // Validation or API error
    }
  };

  return (
    <Modal
      open={visible}
      title={`Editar Evaluación de ${evaluation?.nombre || ''}`}
      onCancel={() => { form.resetFields(); onCancel(); }}
      onOk={handleOk}
      footer={[
        <Button key="back" onClick={() => { form.resetFields(); onCancel(); }}>
          Cancelar
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk} loading={isMutating}>
          Guardar
        </Button>,
      ]}
    >
      {(evalData && evaluation) && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="ID">{evaluation.employee_id}</Descriptions.Item>
          <Descriptions.Item label="Nombre">{evaluation.nombre}</Descriptions.Item>
          <Descriptions.Item label="Área">{evaluation.area}</Descriptions.Item>
          <Descriptions.Item label="Cargo">{evaluation.cargo}</Descriptions.Item>
          <Descriptions.Item label="Tipo de Posición">{evaluation.tipo_posicion}</Descriptions.Item>
          <Descriptions.Item label="% Metas Corporativas">{`${evaluation.corporate_percentage_result?.toFixed(1)}% / ${evaluation.corporate_percentage_target?.toFixed(0)}%`}</Descriptions.Item>
          <Descriptions.Item label="Puntuación Metas Corporativas">{evaluation.corporate_score?.toFixed(1)}</Descriptions.Item>
          <Descriptions.Item label="% Metas de Área">{`${evaluation.department_percentage_result?.toFixed(1)}% / ${evaluation.department_percentage_target?.toFixed(0)}%`}</Descriptions.Item>
          <Descriptions.Item label="Evaluación de Metas de Área">{evaluation.department_score_result?.toFixed(1)}</Descriptions.Item>
          <Descriptions.Item label="% Metas Individuales">{`${evaluation.position_percentage_result?.toFixed(1)}% / ${evaluation.position_percentage_target?.toFixed(0)}%`}</Descriptions.Item>
          <Descriptions.Item label="Evaluación Metas Individuales">{evaluation.position_score_result?.toFixed(1)}</Descriptions.Item>
          <Descriptions.Item label="% Competencias">{evaluation.job_competencies_percentage !== null && evaluation.job_competencies_percentage !== undefined ? `${evaluation.job_competencies_percentage.toFixed(1)}%` : 'N/A'}</Descriptions.Item>
        </Descriptions>
      )}
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="job_competencies_score"
          label="Puntuación competencias"
          rules={[{ required: true, message: 'Por favor ingresa la puntuación de competencias' }]}
        >
          <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} placeholder="Puntuación competencias" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EvaluationEditModal;
