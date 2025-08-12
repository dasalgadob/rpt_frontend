"use client";

import React, { useState, useEffect } from "react";
import { Card, Typography, Table, Button, Row, Col, Divider, Space, message, Modal } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCompanies, useCompanyOperations } from '../../hooks/useCompanies';
import CompanyForm from "./CompanyForm";

const { Title, Text } = Typography;

const CompaniesPage = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Usar hooks personalizados de SWR
  const { companies: companiesData, isLoading, isError, mutate, refreshAfterDelete } = useCompanies();
  const { deleteCompany } = useCompanyOperations(); // Solo necesitamos delete aquí

  // Mostrar error si ocurre (solo una vez)
  useEffect(() => {
    if (isError) {
      message.error('No se pudo conectar con el servidor. Verifique que la API esté funcionando en http://localhost:3010');
    }
  }, [isError]);

  const handleCompanySelect = (companyId) => {
    router.push(`/companies/${companyId}/periods`);
  };

  const handleView = (record) => {
    handleCompanySelect(record.id);
  };

  const handleAddCompany = () => {
    setModalMode('add');
    setSelectedCompany(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setSelectedCompany(record);
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    // Usar confirmación nativa del navegador en lugar del Modal de Ant Design
    const confirmDelete = window.confirm(
      `¿Está seguro de eliminar la empresa "${record.name}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (confirmDelete) {
      try {
        const result = await deleteCompany(record.id);
        
        if (result.success) {
          message.success(`Empresa "${record.name}" eliminada correctamente`);
          
          // Recargar los datos después de eliminar
          const reloaded = await refreshAfterDelete();
          if (!reloaded) {
            // Fallback: usar mutate si refreshAfterDelete falla
            await mutate();
          }
        } else {
          message.error(result.error || 'Error al eliminar la empresa');
        }
      } catch (error) {
        console.error('Error inesperado en eliminación:', error);
        message.error('Error inesperado al eliminar la empresa');
      }
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedCompany(null);
  };

  const handleFormSuccess = () => {
    // Revalidar los datos después de la operación exitosa
    mutate();
    setModalVisible(false);
    setSelectedCompany(null);
  };

  const columns = (handleView) => [
    {
      title: "Empresa",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ fontWeight: "bold" }}>{text}</div>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      align: "center",
      render: (text, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Ver
          </Button>
          <Button 
            type="default" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button 
            type="primary" 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Row justify="center" style={{ marginBottom: "40px", marginTop: "40px" }}>
      <Col span={18} lg={18} md={18} sm={24} xs={24}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Image
            src="/logoRPT.jpg"
            alt="RPT Logo"
            width={300}
            height={150}
            style={{ objectFit: "contain" }}
          />
        </div>
      </Col>
      <Col span={18} lg={18} md={18} sm={24} xs={24}>
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  display: "block",
                  fontSize: "20px",
                  flex: 1,
                }}
              >
                Listado de Empresas
              </span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddCompany}
                style={{ marginRight: 16 }}
              >
                Añadir
              </Button>
            </div>
          }
          style={{
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.4)",
            width: "100%",
            marginTop: "20px",
            borderRadius: 20,
            marginLeft: "30px",
            marginRight: "30px",
          }}
        >
          <Table
            columns={columns(handleView)}
            dataSource={companiesData}
            loading={isLoading}
            rowKey="id"
            locale={{
              emptyText: isLoading 
                ? 'Cargando...' 
                : isError 
                  ? 'No se pudo cargar los datos. Verifique la conexión con el servidor.'
                  : 'No hay empresas registradas. Haga clic en "Añadir" para crear la primera empresa.'
            }}
            components={{
              header: {
                cell: (props) => (
                  <th
                    {...props}
                    style={{
                      ...props.style,
                      backgroundColor: "#002766",
                      color: "white",
                      fontWeight: "bold",
                      borderBottom: "1px solid #002766",
                    }}
                  />
                ),
              },
            }}
          />
        </Card>

        <CompanyForm
          visible={modalVisible}
          onCancel={handleModalCancel}
          onSuccess={handleFormSuccess}
          initialValues={selectedCompany}
          mode={modalMode}
        />
      </Col>
    </Row>
  );
};

export default CompaniesPage;
