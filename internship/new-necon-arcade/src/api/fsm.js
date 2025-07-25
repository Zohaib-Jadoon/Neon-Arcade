import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/fsm';

export async function sendFsmTransition(key, transition, data = {}) {
  try {
    const response = await axios.post(`${API_BASE_URL}/machine`, {
      key,
      transition,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('FSM API error:', error);
    throw error;
  }
}
