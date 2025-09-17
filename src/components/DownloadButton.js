import React from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const DownloadButton = ({ url, filename = 'archivo.xlsx', title = 'Descargar', ...props }) => {
  const handleDownload = async () => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'access-token': localStorage.getItem('access-token'),
          'client': localStorage.getItem('client'),
          'uid': localStorage.getItem('uid')
        },
      });
      if (!res.ok) throw new Error('Error al descargar el archivo');
      
      // Create blob with explicit XLSX MIME type
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Ensure filename has .xlsx extension
      let finalFilename = filename;
      if (!finalFilename.toLowerCase().endsWith('.xlsx')) {
        finalFilename = finalFilename.replace(/\.[^/.]+$/, '') + '.xlsx';
      }
      
      // Get filename from Content-Disposition header if available
      const contentDisposition = res.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          let serverFilename = filenameMatch[1].replace(/['"]/g, '');
          if (!serverFilename.toLowerCase().endsWith('.xlsx')) {
            serverFilename = serverFilename.replace(/\.[^/.]+$/, '') + '.xlsx';
          }
          finalFilename = serverFilename;
        }
      }
      
      // Force download using URL.createObjectURL
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = finalFilename;
      
      // Ensure the link is hidden and force the click
      link.style.display = 'none';
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      
      // Force click with a small delay
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }, 100);
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
