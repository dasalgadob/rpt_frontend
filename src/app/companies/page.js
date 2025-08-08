"use client";

import React from 'react';
import { Card, Typography, List, Button } from 'antd';
import { BankOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

const CompaniesPage = () => {
  const router = useRouter();

  const companies = [
    {
      id: '1',
      name: 'Empresa Demo 1',
      description: 'Primera empresa de demostración',
    },
    {
      id: '2',
      name: 'Empresa Demo 2',
      description: 'Segunda empresa de demostración',
    },
    {
      id: '3',
      name: 'Empresa Demo 3',
      description: 'Tercera empresa de demostración',
    },
  ];

  const handleCompanySelect = (companyId) => {
    router.push(`/companies/${companyId}/periods`);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '40px 20px'
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Title level={2}>Seleccionar Empresa</Title>
        <Text type="secondary">
          Seleccione una empresa para acceder a sus módulos de gestión.
        </Text>
        
        <div style={{ marginTop: 32 }}>
          <List
            grid={{
              gutter: 24,
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 4,
            }}
            dataSource={companies}
            renderItem={(company) => (
              <List.Item>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Button
                      key="access"
                      type="primary"
                      icon={<ArrowRightOutlined />}
                      onClick={() => handleCompanySelect(company.id)}
                      block
                    >
                      Acceder
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    avatar={<BankOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                    title={<span style={{ fontSize: 18 }}>{company.name}</span>}
                    description={company.description}
                  />
                </Card>
              </List.Item>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
