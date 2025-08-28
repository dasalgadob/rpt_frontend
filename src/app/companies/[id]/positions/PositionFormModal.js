"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import useSWRMutation from "swr/mutation";

async function postPosition(url, { arg }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error("Error al crear posición");
  return res.json();
}

async function patchPosition(url, { arg }) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error("Error al actualizar posición");
  return res.json();
}

export default function PositionFormModal({ open, onCancel, editing, onSuccess }) {
  const [form] = Form.useForm();

  const postMutation = useSWRMutation("/api/companies/2/positions", postPosition);
  const patchMutation = useSWRMutation(
    editing ? `/api/companies/2/positions/${editing.id}` : null,
    patchPosition
  );

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({ name: editing.attributes?.name });
    } else {
      form.resetFields();
    }
  }, [editing, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await patchMutation.trigger({
          data: {
            name: values.name,
          },
        });
        message.success("Posición actualizada");
      } else {
        await postMutation.trigger({
          data: {
            name: values.name,
          },
        });
        message.success("Posición creada");
      }
      onSuccess();
    } catch (e) {
      if (e?.errorFields) return; // validation error
      message.error(e.message || "Error");
    }
  };

  return (
    <Modal
      open={open}
      title={editing ? "Editar posición" : "Nueva posición"}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={postMutation.isMutating || patchMutation.isMutating}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ name: "" }}>
        <Form.Item
          label="Nombre"
          name="name"
          rules={[{ required: true, message: "Ingrese el nombre de la posición" }]}
        >
          <Input maxLength={100} autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
