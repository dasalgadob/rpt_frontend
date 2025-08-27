"use client";

import React, { useState } from "react";
import { Table, Button, Modal, message, Popconfirm } from "antd";
import useSWR, { mutate } from "swr";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import PositionFormModal from "./PositionFormModal";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function PositionsPage() {
  const { data, error, isLoading } = useSWR("/companies/2/positions", fetcher);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleEdit = (record) => {
    setEditing(record);
    setModalOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      const res = await fetch(`/api/companies/2/positions/${record.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      message.success("Posición eliminada");
      mutate("/api/companies/2/positions");
    } catch (e) {
      message.error("No se pudo eliminar");
    }
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: ["attributes", "name"],
      key: "name",
      render: (_, record) => record.attributes?.name,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="¿Eliminar posición?"
            onConfirm={() => handleDelete(record)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Posiciones</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Nueva posición
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.data || []}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
      <PositionFormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        editing={editing}
        onSuccess={() => {
          setModalOpen(false);
          mutate("/api/companies/2/positions");
        }}
      />
    </div>
  );
}
