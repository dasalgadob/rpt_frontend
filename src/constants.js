export const fetcher = async (url, params) => {
  console.log('Fetching from:', url, 'with params:', params);
  console.log('Request body:', params.body ? JSON.stringify(params.body, null, 2) : 'No body');
  
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Comentado temporalmente mientras no hay tokens configurados
      // 'access-token': localStorage.getItem('access-token'),
      // client: localStorage.getItem('client'),
      // uid: localStorage.getItem('uid')
    },
    method: params.method,
    body: params.body !== undefined ? JSON.stringify(params.body) : undefined
  });
  
  console.log('Response status:', res.status);
  
  if (!res.ok) {
    let error = {};
    // Attach extra info to the error object.
    const response = await res.json();
    error.message = response.message || response.error || 'Error desconocido';
    error.status = res.status;
    error.details = response; // Agregar detalles completos del error
    console.error('API Error:', error);
    throw error;
  }

  // Para respuestas 204 No Content (como DELETE exitoso), no hay contenido JSON
  if (res.status === 204) {
    console.log('Respuesta 204 No Content - operación exitosa sin contenido');
    return null;
  }

  const data = await res.json();
  console.log('API Response data:', data);
  
  // Comentado temporalmente mientras no hay tokens configurados
  // const accessToken = res.headers.get('access-token');
  // const client = res.headers.get('client');
  // const uid = res.headers.get('uid');
  // if (accessToken && client && uid) {
  //   localStorage.setItem('access-token', accessToken);
  //   localStorage.setItem('client', client);
  //   localStorage.setItem('uid', uid);
  // }
  
  return data;
};