<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useFsm } from '../composables/useFsm'

const store = useStore()
const user = computed(() => store.getters.user)
const userOrders = computed(() => store.getters.userOrders)
const isEditing = ref(false)
const editableName = ref('')
const editableEmail = ref('')
const editableUsername = ref('')

// Get FSM composable functions
const { state, context, nextEvents, error, sendTransition } = useFsm()

// Initialize editable values
editableName.value = user.value?.name || ''
editableEmail.value = user.value?.email || ''
editableUsername.value = user.value?.profile?.username || ''

const startEditing = () => {
  isEditing.value = true
}

const saveProfile = async () => {
  const updatedProfile = {
    name: editableName.value,
    email: editableEmail.value,
    profile: {
      username: editableUsername.value
    }
  }

  try {
    await sendTransition('globalKey', 'SAVE_PROFILE', updatedProfile);
  } catch (error) {
    console.error('FSM transition error:', error);
  }

  store.dispatch('updateUserProfile', updatedProfile)
  isEditing.value = false
  alert('Profile updated successfully!')
}

const cancelEditing = () => {
  editableName.value = user.value?.name || ''
  editableEmail.value = user.value?.email || ''
  editableUsername.value = user.value?.profile?.username || ''
  isEditing.value = false
}

const logout = async () => {
  try {
    await sendTransition('globalKey', 'LOGOUT');
  } catch (error) {
    console.error('FSM transition error:', error);
  }

  store.dispatch('logout')
  // Redirect to home or login page after logout
  window.location.href = '/login'
}

// FSM transition handling
const fsmKey = 'globalKey' // Example key, can be dynamic
const fsmTransition = ref('START') // Example transition event
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
  <div class="profile-view container">
    <h1 class="page-title">Your Profile</h1>
    <div v-if="user" class="profile-content cyber-card-base">
      <div class="profile-section cyber-panel">
        <h2 class="section-heading">Personal Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Name:</span>
            <span v-if="!isEditing" class="value">{{ user.name }}</span>
            <input v-else type="text" v-model="editableName" class="cyber-input" />
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span v-if="!isEditing" class="value">{{ user.email }}</span>
            <input v-else type="email" v-model="editableEmail" class="cyber-input" />
          </div>
          <div class="info-item" v-if="user.profile && user.profile.username">
            <span class="label">Username:</span>
            <span v-if="!isEditing" class="value">{{ user.profile.username }}</span>
            <input v-else type="text" v-model="editableUsername" class="cyber-input" />
          </div>
          <div class="info-item">
            <span class="label">Role:</span>
            <span class="value role-tag">{{ user.role }}</span>
          </div>
        </div>
        <div class="profile-actions">
          <button v-if="!isEditing" @click="startEditing" class="cyber-button secondary">Edit Profile</button>
          <div v-else class="edit-buttons">
            <button @click="saveProfile" class="cyber-button primary">Save Changes</button>
            <button @click="cancelEditing" class="cyber-button secondary">Cancel</button>
          </div>
        </div>
      </div>

      <div class="profile-section cyber-panel">
        <h2 class="section-heading">Your Orders</h2>
        <div v-if="userOrders.length === 0" class="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
        <div v-else class="orders-list">
          <div v-for="order in userOrders" :key="order.id" class="order-item">
            <div class="order-header">
              <span class="order-id">Order ID: {{ order.id }}</span>
              <span class="order-date">{{ new Date(order.createdAt).toLocaleDateString() }}</span>
            </div>
            <div class="order-details">
              <p>Total: ₨{{ order.totalAmount.toLocaleString() }}</p>
              <p>Status: <span :class="['status-tag', order.status]">{{ order.status }}</span></p>
              <p>Items: {{ order.items.map(item => item.title).join(', ') }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-section logout-section cyber-panel">
        <button @click="logout" class="cyber-button logout-button">Logout</button>
      </div>
    </div>

    <div v-else class="not-logged-in cyber-panel">
      <p>Please log in to view your profile.</p>
      <button @click="$router.push('/login')" class="cyber-button primary">Go to Login</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

/* General Cyberpunk Theme Variables */
:root {
  --cyber-dark-bg: #0a0a0a;
  --cyber-panel-bg: #1a1a1a;
  --cyber-border-color: #00f0ff; /* Neon Cyan */
  --cyber-accent-green: #00ff66; /* Neon Green */
  --cyber-accent-purple: #9900ff;
  --cyber-text-primary: #e0e0e0;
  --cyber-text-secondary: #a0a0a0;
  --cyber-glow-intensity: 0 0 15px var(--cyber-border-color), 0 0 30px var(--cyber-border-color);
  --cyber-glow-green: 0 0 15px var(--cyber-accent-green), 0 0 30px var(--cyber-accent-green);
  --cyber-glow-purple: 0 0 15px var(--cyber-accent-purple), 0 0 30px var(--cyber-accent-purple);
  --cyber-shadow-offset: 5px;
  --neon-red: #ff3366;
  --neon-yellow: #ffff00;
}

.profile-view {
  padding-top: 90px; /* Adjust for fixed navbar */
  min-height: 100vh;
  padding-bottom: 50px;
  background-color: var(--cyber-dark-bg);
  color: var(--cyber-text-primary);
  font-family: 'Rajdhani', sans-serif;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 50px;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  animation: glitch-text 4s infinite alternate;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.cyber-panel {
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  padding: 30px;
  position: relative;
  overflow: hidden;
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
}

.cyber-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.05), transparent);
  animation: shimmer 5s infinite;
  transform: translateX(-100%);
  z-index: 1;
}

.cyber-panel:hover::before {
  animation-play-state: paused; /* Pause shimmer on hover */
  transform: translateX(0);
}

.profile-section {
  margin-bottom: 0; /* Handled by gap in profile-content */
  padding-bottom: 0; /* Handled by padding in cyber-panel */
  border-bottom: none;
}

.section-heading {
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
  margin-bottom: 30px;
  text-align: center;
  position: relative; /* For z-index over shimmer */
  z-index: 2;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 35px;
  position: relative; /* For z-index over shimmer */
  z-index: 2;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 240, 255, 0.2);
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
}
.info-item:hover {
  border-color: var(--cyber-accent-green);
  box-shadow: 0 0 10px rgba(0, 255, 102, 0.3);
}

.info-item .label {
  font-size: 0.95rem;
  color: var(--cyber-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-item .value {
  font-size: 1.2rem;
  color: var(--cyber-text-primary);
  font-weight: 600;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.1);
}

.cyber-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 1.1rem;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--cyber-text-secondary);
  color: var(--cyber-text-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Rajdhani', sans-serif;
  box-shadow: inset 0 0 5px rgba(0, 240, 255, 0.1);
}
.cyber-input:focus {
  outline: none;
  border-color: var(--cyber-accent-green);
  box-shadow: 0 0 10px var(--cyber-accent-green), inset 0 0 5px var(--cyber-accent-green);
}

.role-tag {
  background-color: var(--cyber-accent-purple);
  color: var(--cyber-dark-bg);
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: capitalize;
  display: inline-block;
  width: fit-content;
  box-shadow: 0 0 8px var(--cyber-accent-purple);
}

.profile-actions {
  text-align: center;
  position: relative;
  z-index: 2;
}

/* Cyber Button Styling */
.cyber-button {
  font-family: 'Orbitron', monospace;
  font-size: 1rem;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-out;
  padding: 12px 25px;
  border: 2px solid;
  border-radius: 8px; /* Slightly rounded for button */
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
}

.cyber-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.5s ease;
}

.cyber-button:hover::before {
  left: 100%;
}

.cyber-button.primary {
  background-color: var(--cyber-accent-green);
  border-color: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-green);
}
.cyber-button.primary:hover {
  background-color: var(--cyber-border-color);
  border-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity);
  transform: translateY(-3px) scale(1.02);
}

.cyber-button.secondary {
  background-color: transparent;
  border-color: var(--cyber-border-color);
  color: var(--cyber-border-color);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
.cyber-button.secondary:hover {
  background-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity);
  transform: translateY(-3px) scale(1.02);
}

.edit-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.no-orders {
  text-align: center;
  font-size: 1.1rem;
  color: var(--cyber-text-secondary);
  padding: 30px;
  border: 1px dashed var(--cyber-text-secondary);
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 2;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 2;
}

.order-item {
  background-color: rgba(0, 255, 102, 0.08); /* Green tint for order items */
  border: 1px solid var(--cyber-accent-green);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 255, 102, 0.2);
  transition: all 0.3s ease;
}
.order-item:hover {
  background-color: rgba(0, 255, 102, 0.15);
  box-shadow: 0 0 20px rgba(0, 255, 102, 0.5);
  transform: translateY(-3px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
}

.order-id {
  font-weight: 600;
  color: var(--cyber-border-color);
  text-shadow: 0 0 5px var(--cyber-border-color);
}

.order-details p {
  margin: 8px 0;
  font-size: 1rem;
  color: var(--cyber-text-primary);
}

.status-tag {
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.status-tag.pending {
  background-color: var(--neon-yellow);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 10px var(--neon-yellow);
}
.status-tag.completed {
  background-color: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 10px var(--cyber-accent-green);
}
.status-tag.cancelled {
  background-color: var(--neon-red);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 10px var(--neon-red);
}

.logout-section {
  text-align: center;
  border-bottom: none;
}

.logout-button {
  background-color: var(--neon-red);
  border-color: var(--neon-red);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 15px var(--neon-red);
}
.logout-button:hover {
  background-color: darken(var(--neon-red), 10%); /* Adjust color slightly on hover */
  border-color: darken(var(--neon-red), 10%);
  box-shadow: 0 0 25px var(--neon-red);
}

.not-logged-in {
  text-align: center;
  padding: 50px;
  font-size: 1.5rem;
  color: var(--cyber-text-secondary);
  border: 2px dashed var(--cyber-text-secondary);
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

/* Animations from previous components for consistency */
@keyframes glitch-text {
  0% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(0, 0);
  }
  20% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(-1px, 1px);
  }
  40% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(1px, -1px);
  }
  60% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(-0.5px, 0.5px);
  }
  80% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(0.5px, -0.5px);
  }
  100% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(0, 0);
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .page-title {
    font-size: 3rem;
  }
  .cyber-panel {
    padding: 25px;
  }
  .section-heading {
    font-size: 1.8rem;
  }
  .info-grid {
    gap: 20px;
  }
  .info-item .value, .info-item input.cyber-input {
    font-size: 1.1rem;
  }
  .cyber-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .profile-view {
    padding-top: 80px;
  }
  .page-title {
    font-size: 2.5rem;
  }
  .cyber-panel {
    padding: 20px;
    clip-path: polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%); /* Adjust angular shape for smaller screens */
  }
  .section-heading {
    font-size: 1.5rem;
  }
  .info-grid {
    grid-template-columns: 1fr; /* Single column on small screens */
    gap: 15px;
  }
  .edit-buttons {
    flex-direction: column;
    gap: 10px;
  }
  .order-item {
    padding: 15px;
  }
  .order-details p {
    margin: 6px 0;
  }
  .status-tag {
    padding: 3px 8px;
    font-size: 0.8rem;
  }
  .not-logged-in {
    padding: 30px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .profile-view {
    padding-top: 70px;
  }
  .page-title {
    font-size: 2rem;
  }
  .section-heading {
    font-size: 1.3rem;
  }
  .info-item .label {
    font-size: 0.85rem;
  }
  .info-item .value, .info-item input.cyber-input {
    font-size: 1rem;
  }
  .cyber-button {
    padding: 8px 15px;
    font-size: 0.8rem;
  }
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>