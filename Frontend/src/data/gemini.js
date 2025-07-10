const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error('API URL is required, are you missing a .env file?');
const baseURL = `${API_URL}/aiplan`;

const createChat = async body => {
  const response = await fetch(baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Something went wrong');
  }

  const data = await response.json();

  return data;
};
export { createChat };
