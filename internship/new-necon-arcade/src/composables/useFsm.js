import { ref} from 'vue';
import { sendFsmTransition } from '../api/fsm';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/fsm';

export function useFsm() {
  const state = ref(null);
  const context = ref(null);
  const nextEvents = ref([]);
  const error = ref(null);

  async function fetchInitialState(key) {
    try {
      const response = await axios.get(`${API_BASE_URL}/machine`, {
        params: { key },
      });
      state.value = response.data.state;
      context.value = response.data.context;
      nextEvents.value = response.data.nextEvents;
    } catch (err) {
      error.value = err.message || 'Failed to fetch initial FSM state';
    }
  }

  async function sendTransition(key, transition, data = {}) {
    error.value = null;
    try {
      // Ensure FSM state is initialized before sending transitions
      if (state.value === null) {
        await fetchInitialState(key);
      }
      const response = await sendFsmTransition(key, transition, data);
      if (response.errorMessage) {
        error.value = response.errorMessage;
      } else {
        state.value = response.state;
        context.value = response.context;
        nextEvents.value = response.nextEvents;
      }
      return response;
    } catch (err) {
      error.value = err.message || 'Unknown error';
      throw err;
    }
  }

  return {
    state,
    context,
    nextEvents,
    error,
    sendTransition,
    fetchInitialState,
  };
}
