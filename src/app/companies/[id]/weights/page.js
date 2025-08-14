"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Weights from './components/Weights';

const WeightsPage = () => {
  const params = useParams();
  const companyId = params?.id;

  if (!companyId) {
    return <div>Error: Company ID not found</div>;
  }

  return <Weights companyId={companyId} />;
};

export default WeightsPage;
