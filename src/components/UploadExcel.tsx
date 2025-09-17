import { Button, type ButtonProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useRef, type ChangeEvent } from 'react';

interface UploadExcelProps extends ButtonProps {
  url: string;
  title?: string;
}

const UploadExcel: React.FC<UploadExcelProps> = ({ url, title = 'Importar Excel', ...props }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log('File selected:', e.target.files);
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'access-token': localStorage.getItem('access-token') || '',
          'client': localStorage.getItem('client') || '',
          'uid': localStorage.getItem('uid') || ''
        },
        body: formData,
      });
      if (!res.ok) throw new Error('Error al importar el archivo');
      // toast.success('Archivo importado correctamente');
    } catch (err) {
      // toast.error('No se pudo importar el archivo.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        icon={<UploadOutlined />}
        onClick={() => inputRef.current && inputRef.current.click()}
        {...props}
      >
        {title}
      </Button>
    </>
  );
};

export default UploadExcel;
