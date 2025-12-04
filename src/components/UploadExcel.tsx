import { Button, type ButtonProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import React, { useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'react-toastify';

interface UploadExcelProps extends ButtonProps {
  url: string;
  title?: string;
  onSuccess?: () => void;
}

const UploadExcel: React.FC<UploadExcelProps> = ({ url, title = 'Importar Excel', onSuccess, ...props }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    console.log('File selected:', e.target.files);
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('Authorization') || ''
        },
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Error al importar el archivo';
        throw new Error(errorMessage);
      }
      
      toast.success('Archivo importado correctamente');
      onSuccess?.();
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'No se pudo importar el archivo.');
    } finally {
      setIsLoading(false);
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
        loading={isLoading}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? 'Importando...' : title}
      </Button>
    </>
  );
};

export default UploadExcel;
