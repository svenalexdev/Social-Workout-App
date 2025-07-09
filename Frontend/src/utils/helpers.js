// Helper functions
// Capitalizing first letter of every word w/ regular expression (after spaces, parantheses, dashes etc.)
const capitalizeWords = str => {
  // return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  if (!str) return '';
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

export default capitalizeWords;