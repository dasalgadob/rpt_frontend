import React, { useRef } from 'react';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const UploadExcel = ({ url, title = 'Importar Excel', ...props }) => {
  const inputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error al importar el archivo');
      toast.success('Archivo importado correctamente');
    } catch (err) {
      toast.error('No se pudo importar el archivo.');
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
