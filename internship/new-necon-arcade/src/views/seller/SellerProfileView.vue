<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useFsm } from '../../composables/useFsm'

const store = useStore()
const user = computed(() => store.getters.user)
const sellerProfile = computed(() => user.value?.sellerProfile)
const isEditing = ref(false)
const editableCompanyName = ref('')
const editableContactEmail = ref('')
const editableContactPhone = ref('')
const editableAddress = ref('')

const { state, context, sendTransition, fetchInitialState } = useFsm()

onMounted(async () => {
  await fetchInitialState('globalKey')
  try {
    await sendTransition('globalKey', 'GO_PROFILE')
    console.log('FSM transitioned to GO_PROFILE')
  } catch (error) {
    console.error('FSM transition error:', error)
  }
})

watch(state, (newState) => {
  console.log('FSM state changed to:', newState)
})

const startEditing = () => {
  isEditing.value = true
}

const saveProfile = () => {
  const updatedSellerProfile = {
    companyName: editableCompanyName.value,
    contactEmail: editableContactEmail.value,
    contactPhone: editableContactPhone.value,
    address: editableAddress.value,
    gamesListed: sellerProfile.value?.gamesListed || 0, // Preserve existing count
  }

  // Update the user object in the store
  const updatedUser = {
    ...user.value,
    sellerProfile: updatedSellerProfile
  }
  store.dispatch('updateUserProfile', updatedUser)
  isEditing.value = false
  alert('Seller profile updated successfully!')
}

const cancelEditing = () => {
  editableCompanyName.value = sellerProfile.value?.companyName || ''
  editableContactEmail.value = sellerProfile.value?.contactEmail || ''
  editableContactPhone.value = sellerProfile.value?.contactPhone || ''
  editableAddress.value = sellerProfile.value?.address || ''
  isEditing.value = false
}

if (user.value && user.value.role === 'seller') {
  editableCompanyName.value = sellerProfile.value?.companyName || ''
  editableContactEmail.value = sellerProfile.value?.contactEmail || ''
  editableContactPhone.value = sellerProfile.value?.contactPhone || ''
  editableAddress.value = sellerProfile.value?.address || ''
}
</script>

<template>
  <div class="seller-profile-view container">
    <h1 class="page-title">Seller Profile</h1>
    <p class="page-subtitle">Manage your public seller information.</p>

    <div v-if="user && user.role === 'seller'" class="profile-content cyber-panel">
      <div class="profile-section">
        <h2 class="section-heading">Company Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Company Name:</span>
            <span v-if="!isEditing" class="value">{{ sellerProfile?.companyName || 'N/A' }}</span>
            <input v-else type="text" v-model="editableCompanyName" class="cyber-input" />
          </div>
          <div class="info-item">
            <span class="label">Contact Email:</span>
            <span v-if="!isEditing" class="value">{{ sellerProfile?.contactEmail || 'N/A' }}</span>
            <input v-else type="email" v-model="editableContactEmail" class="cyber-input" />
          </div>
          <div class="info-item">
            <span class="label">Contact Phone:</span>
            <span v-if="!isEditing" class="value">{{ sellerProfile?.contactPhone || 'N/A' }}</span>
            <input v-else type="tel" v-model="editableContactPhone" class="cyber-input" />
          </div>
          <div class="info-item full-width">
            <span class="label">Address:</span>
            <span v-if="!isEditing" class="value">{{ sellerProfile?.address || 'N/A' }}</span>
            <textarea v-else v-model="editableAddress" rows="3" class="cyber-input"></textarea>
          </div>
          <div class="info-item">
            <span class="label">Games Listed:</span>
            <span class="value">{{ sellerProfile?.gamesListed || 0 }}</span>
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
    </div>

    <div v-else class="not-authorized cyber-panel">
      <p>You must be logged in as a seller to view this page.</p>
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

.seller-profile-view {
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
  margin-bottom: 15px;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  animation: glitch-text 4s infinite alternate;
}

.page-subtitle {
  font-size: 1.3rem;
  text-align: center;
  color: var(--cyber-text-secondary);
  margin-bottom: 40px;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
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
  margin-bottom: 0; /* Handled by panel padding */
  padding-bottom: 0; /* Handled by panel padding */
  border-bottom: none;
}

.section-heading {
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
  margin-bottom: 30px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 35px;
  position: relative;
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

.info-item.full-width {
  grid-column: 1 / -1; /* Spans full width */
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

.not-authorized {
  text-align: center;
  padding: 50px;
  font-size: 1.5rem;
  color: var(--cyber-text-secondary);
  border: 2px dashed var(--neon-red);
  border-radius: 15px;
  background-color: rgba(255, 51, 102, 0.1);
  box-shadow: 0 0 10px rgba(255, 51, 102, 0.3);
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
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
  .page-subtitle {
    font-size: 1.1rem;
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
  .info-item .value, .info-item input.cyber-input, .info-item textarea.cyber-input {
    font-size: 1.1rem;
  }
  .cyber-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .seller-profile-view {
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
    grid-template-columns: 1fr;
  }
  .edit-buttons {
    flex-direction: column;
    gap: 10px;
  }
  .not-authorized {
    font-size: 1.2rem;
    padding: 30px;
  }
}

@media (max-width: 480px) {
  .seller-profile-view {
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
  .info-item .value, .info-item input.cyber-input, .info-item textarea.cyber-input {
    font-size: 1rem;
  }
  .cyber-button {
    padding: 8px 15px;
    font-size: 0.8rem;
  }
}
</style>