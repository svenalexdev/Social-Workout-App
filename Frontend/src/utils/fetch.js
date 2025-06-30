const url = 'https://finalproject-backend-y98m.onrender.com/exercises/exercise/';

export const getExercise = async id => {
  try {
    if (id) {
      const response = await fetch(`${url}${id}`);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
    {
      const response = await fetch(`${url}`);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error(error.message);
  }
};
