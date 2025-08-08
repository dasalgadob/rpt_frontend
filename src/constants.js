export const fetcher = async (url, params) => {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'access-token': localStorage.getItem('access-token'),
      client: localStorage.getItem('client'),
      uid: localStorage.getItem('uid')
    },
    method: params.method,
    body: params.body !== undefined ? JSON.stringify(params.body) : undefined
  });
  if (!res.ok) {
    let error = {};
    // Attach extra info to the error object.
    const response = await res.json();
    error.message = response.message;
    error.status = res.status;
    throw error;
  }

  const accessToken = res.headers.get('access-token');
  const client = res.headers.get('client');
  const uid = res.headers.get('uid');
  if (accessToken && client && uid) {
    localStorage.setItem('access-token', accessToken);
    localStorage.setItem('client', client);
    localStorage.setItem('uid', uid);
  }
  return res.json();
};