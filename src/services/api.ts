import axios from 'axios';

export const fetchHoldings = async () => {
  const response = await axios.get('https://json-jvjm.onrender.com/test');
  return response.data;
};
