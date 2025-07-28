<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useFsm } from '../composables/useFsm'

const store = useStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const role = ref('gamer') // Default role
const errorMessage = ref('')

// Validation state
const emailError = ref('')
const passwordError = ref('')

// FSM integration
const { state, context, nextEvents, error: fsmError, sendTransition, fetchInitialState } = useFsm()
const fsmKey = 'globalKey'
const fsmTransition = ref('START')

// Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return 'Email is required'
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return ''
}

// Password validation function
const validatePassword = (password) => {
  if (!password) {
    return 'Password is required'
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number'
  }
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'Password must contain at least one special character (@$!%*?&)'
  }
  return ''
}

// Validate form
const validateForm = () => {
  emailError.value = validateEmail(email.value)
  passwordError.value = validatePassword(password.value)
  
  return !emailError.value && !passwordError.value
}

// Real-time validation watchers
watch(email, (newEmail) => {
  emailError.value = validateEmail(newEmail)
})

watch(password, (newPassword) => {
  passwordError.value = validatePassword(newPassword)
})

watch(() => state.value, (newState, oldState) => {
  console.log('FSM state changed from:', oldState, 'to:', newState)
  console.log('Current context:', context.value)
  if (newState === 'customerView') {
    console.log('Navigating to profile...')
    router.push('/profile')
  } else if (newState === 'sellerView') {
    console.log('Navigating to seller dashboard...')
    router.push('/seller/dashboard')
  } else {
    console.log('State is:', newState, '- no navigation triggered')
  }
}, { immediate: true })

const handleLogin = async () => {
  errorMessage.value = ''
  emailError.value = ''
  passwordError.value = ''
  
  // Validate form before proceeding
  if (!validateForm()) {
    return
  }
  
  try {
    console.log('Starting login process...')
    // Ensure FSM state is initialized before sending transitions
    if (state.value === null) {
      await fetchInitialState('globalKey')
    }

    // Send FSM transition for login
    const response = await sendTransition('globalKey', 'LOGIN', {
      email: email.value,
      password: password.value,
      role: role.value
    })

    console.log('LOGIN response:', response)
    if (response.errorMessage) {
      errorMessage.value = response.errorMessage
      console.log('Login failed, sending FAILURE transition')
      // Send FAILURE transition to FSM
      await sendTransition('globalKey', 'FAILURE')
      return
    }

    // After LOGIN, send CHOOSE_CUSTOMER or CHOOSE_SELLER based on role
    if (role.value === 'gamer') {
      console.log('Sending CHOOSE_CUSTOMER transition')
      await sendTransition('globalKey', 'CHOOSE_CUSTOMER')
    } else if (role.value === 'seller') {
      console.log('Sending CHOOSE_SELLER transition')
      await sendTransition('globalKey', 'CHOOSE_SELLER')
    }

    // Then send SUCCESS transition
    console.log('Login successful, sending SUCCESS transition with role:', role.value)
    const successResponse = await sendTransition('globalKey', 'SUCCESS', { role: role.value })
    console.log('SUCCESS response:', successResponse)

    // Update Vuex store with user data
    const userData = {
      email: email.value,
      role: role.value
    }
    console.log('Updating Vuex store with user data:', userData)
    // Dispatch login action to store
    store.dispatch('login', userData)
    console.log('Store state after update:', {
      isAuthenticated: store.getters.isAuthenticated,
      user: store.getters.user
    })

    // Check if state changed after SUCCESS transition
    console.log('Current FSM state after SUCCESS:', state.value)
    // Navigate based on FSM state
    if (state.value === 'customerView') {
      console.log('Navigating to games page for gamer role')
      router.push('/games')
    } else if (state.value === 'sellerDashboard') {
      console.log('Navigating to seller dashboard for seller role')
      router.push('/seller/dashboard')
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.message || 'Login failed. Please check your credentials.'
    // Send FAILURE transition to FSM
    await sendTransition('globalKey', 'FAILURE')
  }
}

const triggerFsmTransition = async () => {
  try {
    const response = await sendTransition(fsmKey, fsmTransition.value)
    console.log('FSM Response:', response)
  } catch (err) {
    console.error('FSM Error:', err)
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-container cyber-card" :class="{ 'has-error': errorMessage || emailError || passwordError }">
      <h1 class="login-title neon-glow">Login</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            class="cyber-input"
            :class="{ 'error': emailError }"
          />
          <p v-if="emailError" class="validation-error">{{ emailError }}</p>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            class="cyber-input"
            :class="{ 'error': passwordError }"
          />
          <p v-if="passwordError" class="validation-error">{{ passwordError }}</p>
        </div>
        <div class="form-group">
          <label for="role">Login As:</label>
          <select id="role" v-model="role" class="cyber-input">
            <option value="gamer">Gamer</option>
            <option value="seller">Seller</option>
          </select>
        </div>
        <p v-if="errorMessage" class="error-message animate-shake">{{ errorMessage }}</p>
        <button type="submit" class="login-button cyber-button">Login</button>
      </form>
      <div class="links">
        <router-link to="/signup" class="link">Don't have an account? Sign Up</router-link>
        <router-link to="/forgot-password" class="link">Forgot Password?</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Define additional CSS variables for consistent theming */
:root {
  --card-bg: #1a1a2e;
  --card-border: #00f0ff;
  --neon-green: #00ff99;
  --neon-cyan: #00f0ff;
  --error-color: #ff4d4d;
  --text-color: #e0e0e0;
  --input-bg: #0f0f1a;
  --input-border-focus: #00ff99;
  --button-hover-bg: #000000;
  --button-active-bg: #333333;
  --link-hover-color: #00ff99;
  --button-text-color-hover: #00ff99;
}

.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: 20px;
  background: linear-gradient(135deg, #0a0a1a, #1a1a2e);
}

.login-container {
  background-color: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 8px;
  padding: 40px;
  box-shadow: 
    0 5px 20px rgba(0, 240, 255, 0.5),
    0 10px 30px rgba(0, 240, 255, 0.3),
    0 15px 40px rgba(0, 240, 255, 0.1);
  text-align: center;
  max-width: 450px;
  width: 100%;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  transform-style: preserve-3d;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 240, 255, 0.05),
    rgba(0, 240, 255, 0.05) 2px,
    transparent 2px,
    transparent 4px
  );
  z-index: 0;
  opacity: 0.1;
}

.login-container:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 8px 25px rgba(0, 240, 255, 0.7),
    0 15px 40px rgba(0, 240, 255, 0.5),
    0 20px 50px rgba(0, 240, 255, 0.2);
}

.login-container.has-error {
  box-shadow: 
    0 5px 20px var(--error-color),
    0 10px 30px rgba(255, 77, 77, 0.7),
    0 15px 40px rgba(255, 77, 77, 0.4);
  animation: pulse-red 0.5s ease-in-out;
}

.login-title {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: var(--neon-green);
  text-shadow: 0 0 10px var(--neon-green), 0 0 20px var(--neon-green);
  animation: neon-flicker 1.5s infinite alternate;
  position: relative;
  z-index: 1;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.form-group {
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--neon-cyan);
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
}

.cyber-input {
  width: calc(100% - 24px);
  padding: 12px;
  font-size: 1rem;
  background-color: var(--input-bg);
  border: 1px solid var(--card-border);
  border-radius: 4px;
  color: var(--text-color);
  outline: none;
  box-shadow: 
    inset 0 0 8px rgba(0, 240, 255, 0.3),
    0 1px 0 rgba(0, 240, 255, 0.1),
    0 -1px 0 rgba(0, 240, 255, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.cyber-input:focus {
  border-color: var(--input-border-focus);
  box-shadow: 
    0 0 15px var(--input-border-focus), 
    inset 0 0 10px rgba(0, 240, 255, 0.6);
}

.cyber-input.error {
  border-color: var(--error-color);
  box-shadow: 
    0 0 10px var(--error-color),
    inset 0 0 8px rgba(255, 77, 77, 0.6);
}

.login-container.has-error .cyber-input {
  border-color: var(--error-color);
  box-shadow: 
    0 0 10px var(--error-color),
    inset 0 0 8px rgba(255, 77, 77, 0.6);
}

.error-message {
  color: var(--error-color);
  margin-top: -10px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(255, 77, 77, 0.5);
}

.validation-error {
  color: var(--error-color);
  font-size: 0.8rem;
  margin-top: 5px;
  margin-bottom: 0;
  text-shadow: 0 0 3px rgba(255, 77, 77, 0.5);
  animation: fadeIn 0.3s ease-in;
}

.cyber-button {
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  background-color: var(--neon-green);
  color: var(--card-bg);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 
    0 5px 15px rgba(0, 255, 153, 0.7),
    0 2px 5px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.1s ease, color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cyber-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.cyber-button:hover::before {
  transform: translateX(100%);
}

.cyber-button:hover {
  background-color: var(--button-hover-bg);
  color: var(--button-text-color-hover);
  box-shadow: 
    0 0 20px rgba(0, 255, 153, 0.9),
    0 0 30px rgba(0, 255, 153, 0.5),
    0 8px 20px rgba(0, 0, 0, 0.7);
  transform: translateY(-3px);
}

.cyber-button:active {
  background-color: var(--button-active-bg);
  color: var(--button-text-color-hover);
  box-shadow: 
    0 2px 5px rgba(0, 255, 153, 0.5),
    0 1px 2px rgba(0, 0, 0, 0.5);
  transform: translateY(2px);
}

.links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
}

.link {
  color: var(--neon-cyan);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.link:hover {
  color: var(--link-hover-color);
  text-shadow: 0 0 8px var(--link-hover-color);
}

/* Animations */
@keyframes neon-flicker {
  0%, 100% {
    text-shadow: 0 0 10px var(--neon-green), 0 0 20px var(--neon-green);
  }
  50% {
    text-shadow: 0 0 5px var(--neon-green), 0 0 10px var(--neon-green);
  }
}

@keyframes pulse-red {
  0% {
    box-shadow: 0 5px 20px rgba(0, 240, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 35px var(--error-color);
  }
  100% {
    box-shadow: 0 5px 20px rgba(0, 240, 255, 0.5);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    padding: 30px;
  }
  .login-title {
    font-size: 2rem;
  }
  .cyber-button {
    font-size: 1rem;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }
  .login-title {
    font-size: 1.8rem;
  }
  .form-group label {
    font-size: 1rem;
  }
  .cyber-input {
    padding: 10px;
  }
}
</style>
