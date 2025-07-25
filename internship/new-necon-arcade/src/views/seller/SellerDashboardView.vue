<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router' // Import useRouter for router-link
import { useFsm } from '../../composables/useFsm'

const store = useStore()
const router = useRouter() // Initialize useRouter
const user = computed(() => store.getters.user)
const sellerProfile = computed(() => user.value?.sellerProfile)
const sellerGames = computed(() => store.getters.getGamesBySeller(user.value?.id))
const sellerSales = computed(() => store.getters.getSalesBySeller(user.value?.id))
const totalRevenue = computed(() => store.getters.getSellerTotalRevenue(user.value?.id))
const totalUnitsSold = computed(() => store.getters.getSellerTotalUnitsSold(user.value?.id))
const pendingSales = computed(() => {
  if (!sellerSales.value) return 0
  return sellerSales.value.filter(sale => sale.status === 'pending').length
})

const { sendTransition, fetchInitialState, state } = useFsm()

onMounted(async () => {
  await fetchInitialState('globalKey')
  try {
    await sendTransition('globalKey', 'GO_HOME')
    console.log('FSM transitioned to GO_HOME')
  } catch (error) {
    console.error('FSM transition error:', error)
  }
})
</script>

<template>
  <div class="seller-dashboard-view container">
    <h1 class="page-title">Seller Dashboard</h1>
    <p class="page-subtitle">Welcome, {{ user?.name || 'Seller' }}! Here's an overview of your performance.</p>

    <div class="dashboard-grid">
      <div class="dashboard-card cyber-panel">
        <h2 class="card-title">Your Profile</h2>
        <div class="profile-info">
          <p><strong>Company:</strong> {{ sellerProfile?.companyName || 'N/A' }}</p>
          <p><strong>Email:</strong> {{ sellerProfile?.contactEmail || 'N/A' }}</p>
          <p><strong>Phone:</strong> {{ sellerProfile?.contactPhone || 'N/A' }}</p>
          <p><strong>Address:</strong> {{ sellerProfile?.address || 'N/A' }}</p>
        </div>
        <router-link to="/seller/profile" class="cyber-button secondary">Edit Profile</router-link>
      </div>

      <div class="dashboard-card cyber-panel">
        <h2 class="card-title">Sales Overview</h2>
        <div class="sales-stats">
          <div class="stat-item">
            <span class="stat-label">Total Revenue:</span>
            <span class="stat-value neon-green">₨{{ totalRevenue.toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Units Sold:</span>
            <span class="stat-value neon-cyan">{{ totalUnitsSold }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Games Listed:</span>
            <span class="stat-value neon-purple">{{ sellerGames.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Pending Sales:</span>
            <span class="stat-value neon-yellow">{{ pendingSales }}</span>
          </div>
        </div>
        <router-link to="/seller/sales" class="cyber-button primary">View Sales Report</router-link>
      </div>

      <div class="dashboard-card cyber-panel">
        <h2 class="card-title">Game Management</h2>
        <p class="card-description">Manage your game listings, add new titles, or update existing ones.</p>
        <div class="button-group">
          <router-link to="/seller/games" class="cyber-button secondary">Manage Games</router-link>
          <router-link to="/seller/games/new" class="cyber-button primary">Add New Game</router-link>
        </div>
      </div>

      <div class="dashboard-card cyber-panel">
        <h2 class="card-title">Quick Links</h2>
        <ul class="quick-links-list">
          <li><router-link to="/seller/sales">📊 Sales Tracking</router-link></li>
          <li><router-link to="/seller/games">🎮 Game Listings</router-link></li>
          <li><router-link to="/seller/profile">👤 My Profile</router-link></li>
          <li><router-link to="/">🏠 Back to Home</router-link></li>
        </ul>
      </div>
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

.seller-dashboard-view {
  padding-top: 90px; /* Adjust for fixed navbar */
  min-height: 100vh;
  padding-bottom: 50px;
  background-color: var(--cyber-dark-bg);
  color: var(--cyber-text-primary);
  font-family: 'Rajdhani', sans-serif;
}

.container {
  max-width: 1200px;
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
  margin-bottom: 60px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

.card-title {
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
  margin-bottom: 20px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.profile-info p,
.sales-stats .stat-item {
  font-size: 1.1rem;
  color: var(--cyber-text-primary);
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
}

.profile-info strong {
  color: var(--cyber-border-color);
  text-shadow: 0 0 5px var(--cyber-border-color);
}

.sales-stats .stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(0, 240, 255, 0.1);
}

.sales-stats .stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: var(--cyber-text-secondary);
}

.stat-value {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1.4rem;
  text-shadow: 0 0 8px;
}
.stat-value.neon-green { color: var(--cyber-accent-green); text-shadow: var(--cyber-glow-green); }
.stat-value.neon-cyan { color: var(--cyber-border-color); text-shadow: var(--cyber-glow-intensity); }
.stat-value.neon-purple { color: var(--cyber-accent-purple); text-shadow: var(--cyber-glow-purple); }
.stat-value.neon-yellow { color: var(--neon-yellow); text-shadow: 0 0 8px var(--neon-yellow); }

.card-description {
  font-size: 1rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 20px;
  flex-grow: 1;
  position: relative;
  z-index: 2;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  position: relative;
  z-index: 2;
}

.button-group .cyber-button {
  flex-grow: 1;
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

.quick-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 2;
}

.quick-links-list li {
  margin-bottom: 10px;
}

.quick-links-list a {
  display: flex; /* Use flex to align icon and text */
  align-items: center;
  gap: 10px; /* Space between icon and text */
  padding: 12px 18px;
  background-color: rgba(0, 255, 102, 0.05);
  border: 1px solid var(--cyber-accent-green);
  border-radius: 8px;
  color: var(--cyber-accent-green);
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 0 8px rgba(0, 255, 102, 0.2);
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
}

.quick-links-list a:hover {
  background-color: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-green);
  transform: translateX(5px);
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
  .card-title {
    font-size: 1.8rem;
  }
  .profile-info p,
  .sales-stats .stat-item,
  .card-description,
  .quick-links-list a {
    font-size: 1rem;
  }
  .stat-value {
    font-size: 1.2rem;
  }
  .cyber-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .seller-dashboard-view {
    padding-top: 80px;
  }
  .page-title {
    font-size: 2.5rem;
  }
  .page-subtitle {
    font-size: 1rem;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .cyber-panel {
    padding: 20px;
    clip-path: polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%); /* Adjust angular shape for smaller screens */
  }
  .card-title {
    font-size: 1.5rem;
  }
  .profile-info p,
  .sales-stats .stat-item,
  .card-description,
  .quick-links-list a {
    font-size: 0.95rem;
  }
  .stat-value {
    font-size: 1.1rem;
  }
  .button-group {
    flex-direction: column;
    gap: 10px;
  }
  .quick-links-list a {
    padding: 10px 15px;
  }
}

@media (max-width: 480px) {
  .seller-dashboard-view {
    padding-top: 70px;
  }
  .page-title {
    font-size: 2rem;
  }
  .cyber-panel {
    padding: 15px;
  }
  .card-title {
    font-size: 1.3rem;
  }
  .profile-info p,
  .sales-stats .stat-item,
  .card-description,
  .quick-links-list a {
    font-size: 0.85rem;
  }
  .stat-value {
    font-size: 1rem;
  }
  .cyber-button {
    padding: 8px 15px;
    font-size: 0.8rem;
  }
  .quick-links-list a {
    padding: 8px 12px;
  }
}
</style>