// const BACKEND_URL = import.meta.env.VITE_API_URL;
// if (!BACKEND_URL) throw new Error('No Backend URL found, .env file?');
// // const baseURL = `${BACKEND_URL}/plans`;

// export const getExercise = async id => {
//   const res = await fetch(`${BACKEND_URL}/plans/${id}`);
//   if (!res.ok) {
//     const errorData = await res.json();
//     if (!errorData.error) {
//       throw new Error('An error occurred while fetching workout plan');
//     }
//     throw new Error(errorData.error);
//   }
//   const data = await res.json();

//   // Since the backend now stores enriched exercise data,
//   // we can return the data directly without additional API calls
//   return data;
// };
