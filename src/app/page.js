"use client";

import React from 'react';
import { Button, Typography, Card, Row, Col } from 'antd';
import { BankOutlined, DashboardOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

const Home = () => {
  const router = useRouter();

  const handleNavigateToCompanies = () => {
    router.push('/companies');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          maxWidth: 600, 
          width: '100%',
          textAlign: 'center',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ padding: '40px 20px' }}>
          <DashboardOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
          
          <Title level={1} style={{ marginBottom: 16, color: '#1f1f1f' }}>
            RPT Consultants
          </Title>
          
          <Paragraph style={{ fontSize: 18, color: '#666', marginBottom: 32 }}>
            Sistema de Gestión de Evaluaciones de Desempeño
          </Paragraph>
          
          <Row gutter={16} justify="center">
            <Col>
              <Button
                type="primary"
                size="large"
                icon={<BankOutlined />}
                onClick={handleNavigateToCompanies}
                style={{ 
                  height: 48,
                  fontSize: 16,
                  borderRadius: 8,
                  paddingLeft: 32,
                  paddingRight: 32
                }}
              >
                Acceder al Sistema
              </Button>
            </Col>
          </Row>
          
          <div style={{ marginTop: 32, color: '#999' }}>
            <Paragraph style={{ margin: 0, fontSize: 14 }}>
              Gestiona períodos, metas, empleados y evaluaciones de manera eficiente
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Home;