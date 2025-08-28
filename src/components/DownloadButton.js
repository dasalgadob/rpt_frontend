import React from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const DownloadButton = ({ url, filename = 'archivo.xlsx', title = 'Descargar', ...props }) => {
  const handleDownload = async () => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/octet-stream' },
      });
      if (!res.ok) throw new Error('Error al descargar el archivo');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('No se pudo descargar el archivo.');
    }
  };

  return (
    <Button
      type="default"
      icon={<DownloadOutlined />}
      onClick={handleDownload}
      {...props}
    >
      {title}
    </Button>
  );
};

export default DownloadButton;
