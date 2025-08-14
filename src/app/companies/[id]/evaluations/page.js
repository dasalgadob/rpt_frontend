"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Evaluations from './components/Evaluations';

const EvaluationsPage = () => {
  const params = useParams();
  const companyId = params?.id;

  if (!companyId) {
    return <div>Error: Company ID not found</div>;
  }

  return <Evaluations companyId={companyId} />;
};

export default EvaluationsPage;
