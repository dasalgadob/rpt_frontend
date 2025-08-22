"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  CalendarOutlined,
  TrophyOutlined,
  PercentageOutlined,
  TeamOutlined,
  FileSearchOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children, path) {
  return {
    key,
    icon,
    children,
    label,
    path,
  };
}

const items = [
  getItem('Panel', '1', <DashboardOutlined />, null, '/'),
  getItem('Periodo', '2', <CalendarOutlined />, null, '/companies/2/periods'),
  getItem('Areas', '8', <TeamOutlined />, null, '/companies/2/departments'), // New menu item
  getItem('Metas', '3', <TrophyOutlined />, null, '/companies/2/goals'),
  getItem('Ponderación de pesos', '4', <PercentageOutlined />, null, '/companies/2/position-type-weights'),
  getItem('Empleados', '5', <TeamOutlined />, null, '/companies/2/employees'),
  getItem('Evaluaciones', '6', <FileSearchOutlined />, null, '/companies/2/evaluations'),
  getItem('Referencia de compensación', '7', <DollarCircleOutlined />, null, '/companies/2/profit_references'),
];

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Get current selected key based on pathname
  const getSelectedKey = () => {
    const item = items.find(item => item.path === pathname);
    return item ? [item.key] : ['1'];
  };

  const handleMenuClick = ({ key }) => {
    const item = items.find(item => item.key === key);
    if (item && item.path) {
      router.push(item.path);
    }
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu 
          theme="dark" 
          selectedKeys={getSelectedKey()} 
          mode="inline" 
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb 
            style={{ margin: '16px 0' }} 
            items={[
              { title: 'RPT Consultants' }, 
              { title: items.find(item => item.path === pathname)?.label || 'Dashboard' }
            ]} 
          />
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

export default function CompanyLayout({ children }) {
  return <AppLayout>{children}</AppLayout>;
}
