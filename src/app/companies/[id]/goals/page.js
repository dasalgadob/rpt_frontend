"use client";

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Tabs } from 'antd';
import CorporateGoals from './components/CorporateGoals';
import AreaGoals from './components/AreaGoals';
import IndividualGoals from './components/IndividualGoals';

const GoalsPage = () => {
  const params = useParams();
  const companyId = params.id;

  const tabItems = useMemo(() => [
    {
      key: 'corporativas',
      label: 'Corporativas',
      children: <CorporateGoals companyId={companyId} />,
    },
    {
      key: 'area',
      label: 'Area',
      children: <AreaGoals companyId={companyId} />,
    },
    {
      key: 'individuales',
      label: 'Individuales',
      children: <IndividualGoals companyId={companyId} />,
    },
  ], [companyId]);

  return (
    <div>
      <Tabs
        defaultActiveKey="corporativas"
        items={tabItems}
        size="large"
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

export default GoalsPage;
