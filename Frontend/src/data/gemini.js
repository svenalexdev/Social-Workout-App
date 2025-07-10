const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error('API URL is required, are you missing a .env file?');
const baseURL = `${API_URL}/aiplan`;

const fetchChat = async body => {
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

  return response;
};

const createChat = async body => {
  const response = await fetchChat(body);

  const data = await response.json();

  return data;
};
const fetchPersonalChat = async body => {
  const response = await fetch(`${baseURL}/personal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    credentials: 'include'
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Something went wrong');
  }

  return response;
};

const createPersonalChat = async body => {
  const response = await fetchChat(body);

  const data = await response.json();

  return data;
};

const getChatHistory = async chatId => {
  const response = await fetch(`${baseURL}/${chatId}`);

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || 'Something went wrong');
  }

  const data = await response.json();

  return data;
};

export { createChat, getChatHistory, fetchChat, fetchPersonalChat, createPersonalChat };
