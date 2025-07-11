const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) throw new Error('API URL is required, are you missing a .env file?');
const baseURL = `${API_URL}/auth`;

export const me = async () => {
  const result = await fetch(`${baseURL}/me`, { credentials: 'include' });
  if (!result.ok) {
    const errorData = await result.json();
    if (!errorData.error) {
      throw new Error('An error occurred while fetching user data');
    }
    throw new Error(errorData.error);
  }

  const data = await result.json();

  return data;
};

export const signin = async formData => {
  const result = await fetch(`${baseURL}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
    credentials: 'include'
  });
  if (!result.ok) {
    const errorData = await result.json();
    if (!errorData.error) {
      throw new Error('An error occurred while fetching user data');
    }
    throw new Error(errorData.error);
  }

  const data = await result.json();
  
  return data;
};

export const signup = async formData => {
  const result = await fetch(`${baseURL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData),
    credentials: 'include'
  });
  if (!result.ok) {
    const errorData = await result.json();
    if (!errorData.error) {
      throw new Error('An error occurred while fetching user data');
    }
    throw new Error(errorData.error);
  }

  const data = await result.json();

  return data;
};

export const signout = async () => {
  const result = await fetch(`${baseURL}/signout`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!result.ok) {
    const errorData = await result.json();
    if (!errorData.error) {
      throw new Error('An error occurred while fetching user data');
    }
    throw new Error(errorData.error);
  }

  const data = await result.json();

  return data;
};
