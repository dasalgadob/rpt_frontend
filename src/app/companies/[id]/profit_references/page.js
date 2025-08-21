"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import ProfitReferences from './components/ProfitReferences';

const ProfitReferencesPage = () => {
  const params = useParams();
  const companyId = params?.id;

  if (!companyId) {
    return <div>Error: Company ID not found</div>;
  }

  return <ProfitReferences companyId={companyId} />;
};

export default ProfitReferencesPage;
