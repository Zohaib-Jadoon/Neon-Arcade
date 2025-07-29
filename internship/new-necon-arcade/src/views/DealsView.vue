<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import GameCard from '../components/GameCard.vue'
import GameDetailModal from '../components/GameDetailModal.vue'
import { useFsm } from '../composables/useFsm'
import Cyberpunk2077 from "@/assets/images/Cyberpunk2077.jpeg"
import GhostintheShell from "@/assets/images/GhostintheShell.jpeg"
import NeonDrive from "@/assets/images/NeonDrive.jpeg"
import NeuralNetwork from "@/assets/images/NeuralNetwork.jpeg"
import DigitalWarfare from "@/assets/images/DigitalWarfare.jpeg"

const store = useStore()
const isLoading = ref(true)
const selectedDealType = ref('all')
const deals = ref([
  {
    id: 1,
    title: 'Cyberpunk 2077',
    price: 8399,
    originalPrice: 22399,
    image: Cyberpunk2077,
    rating: 4.2,
    genre: 'RPG',
    platform: ['PC', 'PS5', 'Xbox'],
    dealType: 'flash',
    discount: 62,
    timeLeft: '2 days',
    featured: true
  },
  {
    id: 2,
    title: 'Ghost in the Shell',
    price: 9799,
    originalPrice: 19599,
    image: GhostintheShell,
    rating: 4.5,
    genre: 'Action',
    platform: ['PC', 'PS5'],
    dealType: 'weekend',
    discount: 50,
    timeLeft: '3 days',
    featured: true
  },
  {
    id: 3,
    title: 'Neon Drive',
    price: 5599,
    originalPrice: 11199,
    image: NeonDrive,
    rating: 4.0,
    genre: 'Racing',
    platform: ['PC', 'Switch'],
    dealType: 'seasonal',
    discount: 50,
    timeLeft: '1 week',
    featured: false
  },
  {
    id: 4,
    title: 'Digital Warfare',
    price: 11199,
    originalPrice: 16799,
    image: DigitalWarfare,
    rating: 4.1,
    genre: 'FPS',
    platform: ['PC', 'PS5', 'Xbox'],
    dealType: 'daily',
    discount: 33,
    timeLeft: '18 hours',
    featured: false
  },
  {
    id: 5,
    title: 'Neural Network',
    price: 6999,
    originalPrice: 12599,
    image: NeuralNetwork,
    rating: 4.3,
    genre: 'Puzzle',
    platform: ['PC'],
    dealType: 'flash',
    discount: 44,
    timeLeft: '6 hours',
    featured: false
  }
])
const dealTypes = ref([
  { id: 'all', name: 'All Deals', icon: '🎯' },
  { id: 'flash', name: 'Flash Sales', icon: '⚡' },
  { id: 'daily', name: 'Daily Deals', icon: '📅' },
  { id: 'weekend', name: 'Weekend Specials', icon: '🎮' },
  { id: 'seasonal', name: 'Seasonal Sales', icon: '🎄' }
])
const allGames = computed(() => store.getters.allGames)
const gamesOnDeal = computed(() =>
  allGames.value.filter(game => game.originalPrice && game.originalPrice > game.price))
const filteredDeals = computed(() => {
  if (selectedDealType.value === 'all') {
    return deals.value
  }
  return deals.value.filter(deal => deal.dealType === selectedDealType.value)
})
const totalSavings = computed(() => {
  return filteredDeals.value.reduce((total, deal) => {
    return total + (deal.originalPrice - deal.price)
  }, 0)
})
const showGameDetailModal = ref(false)
const selectedGame = ref(null)
const openGameDetailModal = (game) => {
  selectedGame.value = game
  showGameDetailModal.value = true
}
const closeGameDetailModal = () => {
  showGameDetailModal.value = false
  selectedGame.value = null
}
const fsmKey = 'globalKey' // Example key, can be dynamic
const fsmTransition = ref('GO_DEALS') // Transition event for Deals page
const { state, context, nextEvents, error, sendTransition } = useFsm()

const triggerFsmTransition = async () => {
  try {
    const response = await sendTransition(fsmKey, fsmTransition.value)
    console.log('FSM Response:', response)
  } catch (err) {
    console.error('FSM Error:', err)
  }
}
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
  // Send FSM transition on page mount
  sendTransition(fsmKey, 'GO_DEALS').then(response => {
    console.log('FSM Response:', response)
  }).catch(err => {
    console.error('FSM Error:', err)
  })
})
</script>

<template>
  <div class="deals-view">
    <div class="container">
      <!-- Header -->
      <div class="deals-header">
        <h1 class="page-title">Special Deals</h1>
        <p class="page-subtitle">Limited time offers on the hottest cyberpunk games</p>
        <div class="savings-banner">
          <span class="savings-text">Total Savings Available: </span>
          <span class="savings-amount">₨{{ totalSavings.toLocaleString() }}</span>
        </div>
      </div>
      <!-- Deal Type Filters -->
      <div class="deal-filters">
        <button
          v-for="dealType in dealTypes"
          :key="dealType.id"
          @click="selectedDealType = dealType.id"
          class="deal-filter-btn"
          :class="{ 'active': selectedDealType === dealType.id }"
        >
          <span class="filter-icon">{{ dealType.icon }}</span>
          <span class="filter-name">{{ dealType.name }}</span>
        </button>
      </div>
      <!-- Featured Deal Banner -->
      <div class="featured-deal-banner">
        <div class="banner-content">
          <div class="banner-text">
            <h2 class="banner-title">🔥 FLASH SALE ALERT!</h2>
            <p class="banner-subtitle">Up to 70% off on selected cyberpunk titles</p>
            <div class="banner-timer">
              <span class="timer-label">Ends in:</span>
              <div class="timer-display">
                <div class="timer-unit">
                  <span class="timer-number">23</span>
                  <span class="timer-label">H</span>
                </div>
                <div class="timer-unit">
                  <span class="timer-number">45</span>
                  <span class="timer-label">M</span>
                </div>
                <div class="timer-unit">
                  <span class="timer-number">12</span>
                  <span class="timer-label">S</span>
                </div>
              </div>
            </div>
          </div>
          <div class="banner-visual">
            <div class="pulse-circle"></div>
            <div class="discount-badge">70% OFF</div>
          </div>
        </div>
      </div>
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading amazing deals...</p>
      </div>
      <!-- Deals Grid -->
      <div v-else class="deals-section">
        <div class="section-header">
          <h2 class="section-title">
            {{ selectedDealType === 'all' ? 'All Deals' : dealTypes.find(t => t.id === selectedDealType)?.name }}
          </h2>
          <span class="deals-count">{{ filteredDeals.length }} deals available</span>
        </div>
        <div v-if="filteredDeals.length > 0" class="deals-grid">
          <div v-for="deal in filteredDeals" :key="deal.id" class="deal-card-wrapper">
            <div class="deal-badge" :class="deal.dealType">
              <span class="discount-percent">-{{ deal.discount }}%</span>
              <span class="deal-type">{{ deal.dealType.toUpperCase() }}</span>
            </div>
            <div class="time-left-badge">
              <span class="time-icon">⏰</span>
              <span class="time-text">{{ deal.timeLeft }}</span>
            </div>
            <GameCard :game="deal" class="deal-game-card" @quick-view="openGameDetailModal" />
          </div>
        </div>
        <div v-else class="no-deals">
          <p class="no-deals-title">No active deals right now.</p>
          <p class="no-deals-text">Check back soon for more exciting offers!</p>
        </div>
      </div>
      <!-- Game Detail Modal -->
      <GameDetailModal
        :game="selectedGame"
        :show="showGameDetailModal"
        @close="closeGameDetailModal"
        v-if="selectedGame"
      />
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

.deals-view {
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

.deals-header {
  text-align: center;
  margin-bottom: 60px;
  padding-top: 40px;
}

.page-title {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 15px;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  animation: glitch-text 4s infinite alternate;
}

.page-subtitle {
  font-size: 1.3rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 30px;
}

.savings-banner {
  background: linear-gradient(45deg, rgba(0, 240, 255, 0.15), rgba(0, 255, 102, 0.15));
  padding: 18px 35px;
  border-radius: 30px;
  display: inline-block;
  border: 2px solid var(--cyber-border-color);
  box-shadow: var(--cyber-glow-intensity);
  transition: all 0.3s ease;
}
.savings-banner:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 0 25px var(--cyber-border-color), 0 0 40px var(--cyber-border-color);
}

.savings-text {
  color: var(--cyber-text-primary);
  font-weight: 600;
  font-size: 1.1rem;
}

.savings-amount {
  color: var(--cyber-accent-green);
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: var(--cyber-glow-green);
  margin-left: 10px;
}

.deal-filters {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.deal-filter-btn {
  background: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-text-secondary);
  color: var(--cyber-text-primary);
  padding: 14px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
  box-shadow: 0 0 5px rgba(0, 240, 255, 0.2);
}

.deal-filter-btn:hover {
  border-color: var(--cyber-border-color);
  background: rgba(0, 240, 255, 0.1);
  color: var(--cyber-border-color);
  text-shadow: 0 0 8px var(--cyber-border-color);
  transform: translateY(-3px);
}

.deal-filter-btn.active {
  border-color: var(--cyber-accent-green);
  background: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  text-shadow: none;
  box-shadow: var(--cyber-glow-green);
  transform: translateY(-3px);
}

.filter-icon {
  font-size: 1.2rem;
}

.featured-deal-banner {
  background: linear-gradient(135deg, rgba(255, 51, 102, 0.15), rgba(0, 255, 102, 0.15));
  border: 3px solid var(--neon-red);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 60px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 25px rgba(255, 51, 102, 0.7);
  clip-path: polygon(0% 0%, 100% 0%, 100% 90%, 90% 100%, 0% 100%);
}

.featured-deal-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.banner-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: center;
  position: relative;
  z-index: 2;
}

.banner-title {
  font-family: 'Orbitron', monospace;
  font-size: 2.5rem;
  color: var(--neon-red);
  margin-bottom: 15px;
  text-shadow: 0 0 15px var(--neon-red);
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; text-shadow: 0 0 15px var(--neon-red); }
  50% { opacity: 0.8; text-shadow: 0 0 25px var(--neon-red); }
}

.banner-subtitle {
  color: var(--cyber-text-secondary);
  font-size: 1.2rem;
  margin-bottom: 25px;
}

.banner-timer {
  display: flex;
  align-items: center;
  gap: 20px;
}

.timer-label {
  color: var(--cyber-text-primary);
  font-weight: 600;
  font-size: 1.1rem;
}

.timer-display {
  display: flex;
  gap: 15px;
}

.timer-unit {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--cyber-accent-green);
  padding: 10px 15px;
  border-radius: 6px;
  text-align: center;
  min-width: 60px;
  box-shadow: 0 0 10px rgba(0, 255, 102, 0.4);
}

.timer-number {
  display: block;
  color: var(--cyber-accent-green);
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: var(--cyber-glow-green);
}

.timer-unit .timer-label {
  font-size: 0.9rem;
  color: var(--cyber-text-secondary);
  margin-top: 5px;
}

.banner-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-circle {
  width: 120px;
  height: 120px;
  border: 4px solid var(--neon-red);
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
  box-shadow: 0 0 20px var(--neon-red);
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.discount-badge {
  position: absolute;
  background: var(--neon-red);
  color: white;
  padding: 12px 18px;
  border-radius: 50%;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 0 15px var(--neon-red);
}

.loading-container {
  text-align: center;
  padding: 100px 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--cyber-text-secondary);
  border-top: 4px solid var(--cyber-accent-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 25px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--cyber-text-secondary);
  font-size: 20px;
  font-family: 'Rajdhani', sans-serif;
}

.deals-section {
  margin-bottom: 80px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-family: 'Orbitron', monospace;
  font-size: 2.2rem;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
  margin: 0;
}

.deals-count {
  color: var(--cyber-text-secondary);
  font-weight: 600;
  font-size: 1.1rem;
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 40px;
}

.deal-card-wrapper {
  position: relative;
  perspective: 1000px; /* For 3D effect */
}

.deal-badge {
  position: absolute;
  top: -15px;
  left: 20px;
  z-index: 10;
  padding: 10px 18px;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
  border: 2px solid;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transform: rotateX(10deg) rotateY(-5deg); /* Subtle 3D tilt */
  transform-origin: bottom left;
}

.deal-badge.flash {
  background: var(--neon-red);
  border-color: var(--neon-red);
  color: white;
  box-shadow: 0 0 15px var(--neon-red);
}
.deal-badge.daily {
  background: var(--cyber-border-color);
  border-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity);
}
.deal-badge.weekend {
  background: var(--cyber-accent-green);
  border-color: var(--cyber-accent-green);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-green);
}
.deal-badge.seasonal {
  background: var(--cyber-accent-purple);
  border-color: var(--cyber-accent-purple);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-purple);
}

.discount-percent {
  font-size: 1.1rem;
}

.deal-type {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.time-left-badge {
  position: absolute;
  top: -15px;
  right: 20px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--cyber-text-secondary);
  padding: 8px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--cyber-text-primary);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  transform: rotateX(10deg) rotateY(5deg); /* Subtle 3D tilt */
  transform-origin: bottom right;
}

.time-icon {
  font-size: 1rem;
}

.deal-game-card {
  margin-top: 20px; /* Space for badges */
}

.no-deals {
  text-align: center;
  padding: 100px 20px;
  background: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-text-secondary);
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%);
}

.no-deals-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  margin-bottom: 15px;
}

.no-deals-text {
  color: var(--cyber-text-secondary);
  font-size: 1.2rem;
}

/* Animations from Navbar for consistency */
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

/* Responsive Design */
@media (max-width: 1024px) {
  .page-title {
    font-size: 3rem;
  }
  .savings-banner {
    padding: 15px 25px;
  }
  .savings-amount {
    font-size: 1.3rem;
  }
  .deal-filters {
    gap: 15px;
  }
  .deal-filter-btn {
    padding: 12px 20px;
    font-size: 1rem;
  }
  .featured-deal-banner {
    padding: 30px;
  }
  .banner-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 20px;
  }
  .banner-title {
    font-size: 2rem;
  }
  .banner-visual {
    order: -1; /* Move visual to top on smaller screens */
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 1.8rem;
  }
  .deals-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .deals-view {
    padding-top: 80px;
  }
  .page-title {
    font-size: 2.5rem;
  }
  .page-subtitle {
    font-size: 1.1rem;
  }
  .savings-banner {
    padding: 12px 20px;
  }
  .savings-text {
    font-size: 1rem;
  }
  .savings-amount {
    font-size: 1.2rem;
  }
  .deal-filters {
    gap: 10px;
  }
  .deal-filter-btn {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
  .featured-deal-banner {
    padding: 25px;
  }
  .banner-title {
    font-size: 1.8rem;
  }
  .banner-subtitle {
    font-size: 1rem;
  }
  .timer-unit {
    padding: 6px 10px;
    min-width: 50px;
  }
  .timer-number {
    font-size: 1.2rem;
  }
  .pulse-circle {
    width: 90px;
    height: 90px;
  }
  .discount-badge {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  .section-title {
    font-size: 1.6rem;
  }
  .deals-count {
    font-size: 1rem;
  }
  .deals-grid {
    grid-template-columns: 1fr; /* Single column on small screens */
    gap: 25px;
  }
  .deal-badge, .time-left-badge {
    top: -10px;
    left: 10px;
    right: 10px;
    padding: 8px 12px;
    font-size: 0.8rem;
  }
  .deal-badge {
    left: 10px;
  }
  .time-left-badge {
    right: 10px;
  }
  .no-deals-title {
    font-size: 1.4rem;
  }
  .no-deals-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .deals-view {
    padding-top: 70px;
  }
  .page-title {
    font-size: 2rem;
  }
  .savings-banner {
    display: block;
    width: fit-content;
    margin: 0 auto 30px;
  }
  .deal-filters {
    flex-direction: column;
    gap: 10px;
  }
  .deal-filter-btn {
    width: 100%;
    justify-content: center;
  }
  .featured-deal-banner {
    padding: 20px;
  }
  .banner-title {
    font-size: 1.5rem;
  }
  .banner-timer {
    flex-direction: column;
    gap: 10px;
  }
  .timer-display {
    width: 100%;
    justify-content: center;
  }
  .timer-unit {
    flex: 1;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .section-title {
    font-size: 1.4rem;
  }
  .deals-count {
    align-self: flex-end;
  }
  .deal-badge, .time-left-badge {
    font-size: 0.7rem;
    padding: 6px 10px;
  }
}
</style>