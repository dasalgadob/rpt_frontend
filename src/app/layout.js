"use client";

import React, { useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import {
  DashboardOutlined,
  CalendarOutlined,
  TrophyOutlined,
  PercentageOutlined,
  TeamOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem('Panel', '1', <DashboardOutlined />),
  getItem('Periodo', '2', <CalendarOutlined />),
  getItem('Metas', '3', <TrophyOutlined />),
  getItem('Ponderación de pesos', '4', <PercentageOutlined />),
  getItem('Empleados', '5', <TeamOutlined />),
  getItem('Evaluaciones', '6', <FileSearchOutlined />),
];

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'User' }, { title: 'Bill' }]} />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body style={{ margin: 0, padding: 0 }}>
      <AntdRegistry>
        <AppLayout>{children}</AppLayout>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;