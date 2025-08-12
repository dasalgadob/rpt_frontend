"use client";

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ToastContainer } from 'react-toastify';

const RootLayout = ({ children }) => (
  <html lang="en">
    <body style={{ margin: 0, padding: 0 }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <AntdRegistry>
        {children}
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;