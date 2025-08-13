"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Employees from './components/Employees';

const EmployeesPage = () => {
  const params = useParams();
  const companyId = params?.id;

  if (!companyId) {
    return <div>Error: Company ID not found</div>;
  }

  return <Employees companyId={companyId} />;
};

export default EmployeesPage;
