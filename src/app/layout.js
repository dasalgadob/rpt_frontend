"use client";

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';

const RootLayout = ({ children }) => (
  <html lang="en">
    <body style={{ margin: 0, padding: 0 }}>
      <AntdRegistry>
        {children}
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;