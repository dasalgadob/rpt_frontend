import { Spin } from 'antd';
import React from 'react';

const contentStyle = {
  padding: 50,
  background: 'rgba(0, 0, 0, 0.05)',
  borderRadius: 4
};

const Loading = () => {
  return (
    <Spin tip="Loading" size="large">
      <div style={contentStyle} />
    </Spin>
  );
};

export default Loading;