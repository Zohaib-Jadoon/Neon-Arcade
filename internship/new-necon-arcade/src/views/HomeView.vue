<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import GameCard from '../components/GameCard.vue'
import GameDetailModal from '../components/GameDetailModal.vue'
import HeroAnimation from '../components/HeroAnimation.vue' // New Hero component
import { useFsm } from '../composables/useFsm'

const store = useStore()
const router = useRouter()

const allGames = computed(() => store.getters.allGames)
const isAuthenticated = computed(() => store.getters.isAuthenticated)

const featuredGames = computed(() => allGames.value.filter(game => game.featured).slice(0, 4))
const newReleases = computed(() =>
  [...allGames.value]
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    .slice(0, 3))

const showGameDetailModal = ref(false)
const selectedGame = ref(null)

const { state, context, nextEvents, error, sendTransition } = useFsm()
const fsmKey = 'globalKey' // Example key, can be dynamic
const fsmTransition = ref('START') // Example transition event

const openGameDetailModal = (game) => {
  selectedGame.value = game
  showGameDetailModal.value = true
}

const closeGameDetailModal = () => {
  showGameDetailModal.value = false
  selectedGame.value = null
}

const handleExploreGames = async () => {
  try {
    await sendTransition('globalKey', 'EXPLORE_GAMES');
  } catch (error) {
    console.error('FSM transition error:', error);
  }
  if (isAuthenticated.value) {
    router.push('/games')
  } else {
    router.push('/login')
  }
}

const handleLearnMore = () => {
  router.push('/about')
}

const triggerFsmTransition = async () => {
  try {
    const response = await sendTransition(fsmKey, fsmTransition.value)
    console.log('FSM Response:', response)
  } catch (err) {
    console.error('FSM Error:', err)
  }
}

onMounted(() => {
  // Add entrance animations
  const cards = document.querySelectorAll('.game-card')
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`
    card.classList.add('fade-in-up')
  })
})
</script>

<template>
  <div class="home-page">
    <HeroAnimation
      @explore-games="handleExploreGames"
      @learn-more="handleLearnMore"
    />

    <!-- Featured Games Section -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Games</h2>
          <p class="section-subtitle">Discover the hottest cyberpunk gaming experiences</p>
        </div>
        <div class="games-grid">
          <GameCard
            v-for="game in featuredGames"
            :key="game.id"
            :game="game"
            class="game-card"
            @quick-view="openGameDetailModal"
          />
        </div>
      </div>
    </section>

    <!-- New Releases Section -->
    <section class="new-releases-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">New Releases</h2>
          <p class="section-subtitle">Fresh from the digital underground</p>
        </div>
        <div class="games-grid">
          <GameCard
            v-for="game in newReleases"
            :key="game.id"
            :game="game"
            class="game-card"
            @quick-view="openGameDetailModal"
          />
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Browse Categories</h2>
          <p class="section-subtitle">Find your perfect gaming genre</p>
        </div>
        <div class="categories-grid">
          <div class="category-card cyber-panel" v-for="category in ['RPG', 'Action', 'Racing', 'FPS', 'Puzzle', 'Adventure']" :key="category">
            <div class="category-icon">
              <span class="category-text">{{ category }}</span>
            </div>
            <h3 class="category-name">{{ category }}</h3>
          </div>
        </div>
      </div>
    </section>

    <GameDetailModal
      :game="selectedGame"
      :show="showGameDetailModal"
      @close="closeGameDetailModal"
      v-if="selectedGame"
    />
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

.home-page {
  padding-top: 0px; /* HeroAnimation handles its own padding */
  min-height: 100vh;
  background-color: var(--cyber-dark-bg);
  color: var(--cyber-text-primary);
  font-family: 'Rajdhani', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 15px;
  color: var(--cyber-border-color);
  text-shadow: var(--cyber-glow-intensity);
  animation: glitch-text 4s infinite alternate;
}

.section-subtitle {
  font-size: 1.3rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 30px;
}

.featured-section,
.new-releases-section,
.categories-section {
  padding: 80px 0;
}

.new-releases-section {
  background: rgba(26, 26, 26, 0.3);
  border-top: 2px solid rgba(0, 240, 255, 0.1);
  border-bottom: 2px solid rgba(0, 240, 255, 0.1);
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.game-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  perspective: 1000px; /* For 3D effect */
}

.game-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

.category-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: rotateX(5deg) rotateY(-5deg); /* Subtle 3D tilt */
  transform-origin: center;
}

.category-card:hover {
  border-color: var(--cyber-accent-green);
  transform: translateY(-8px) scale(1.02) rotateX(0deg) rotateY(0deg); /* Lift and straighten on hover */
  box-shadow: var(--cyber-glow-green);
}

.category-icon {
  width: 90px;
  height: 90px;
  margin: 0 auto 25px;
  background: linear-gradient(45deg, var(--cyber-accent-green), var(--cyber-border-color));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 15px var(--cyber-accent-green);
  transition: all 0.3s ease;
  z-index: 2; /* Ensure icon is above shimmer */
}

.category-card:hover .category-icon {
  box-shadow: 0 0 25px var(--cyber-accent-green), 0 0 40px rgba(0, 255, 102, 0.5);
}

.category-text {
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  color: var(--cyber-dark-bg);
  font-size: 1.1rem;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.category-name {
  font-family: 'Orbitron', monospace;
  color: var(--cyber-text-primary);
  font-size: 1.5rem;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
  position: relative;
  z-index: 2; /* Ensure name is above shimmer */
}

/* FSM Section Styling */
.fsm-section {
  margin: 40px auto;
  text-align: center;
  max-width: 600px;
  padding: 30px;
}

.fsm-section h3 {
  font-family: 'Orbitron', monospace;
  font-size: 1.8rem;
  color: var(--cyber-accent-purple);
  text-shadow: var(--cyber-glow-purple);
  margin-bottom: 20px;
}

.fsm-section .cyber-input {
  width: calc(100% - 150px); /* Adjust width for button */
  padding: 12px 15px;
  margin-right: 10px;
  font-size: 1rem;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--cyber-text-secondary);
  color: var(--cyber-text-primary);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Rajdhani', sans-serif;
  box-shadow: inset 0 0 5px rgba(0, 240, 255, 0.1);
}

.fsm-section .cyber-input:focus {
  outline: none;
  border-color: var(--cyber-accent-green);
  box-shadow: 0 0 10px var(--cyber-accent-green), inset 0 0 5px var(--cyber-accent-green);
}

.fsm-section .cyber-button {
  padding: 12px 25px;
  font-size: 1rem;
}

.fsm-status {
  margin-top: 20px;
  font-size: 1.1rem;
  color: var(--cyber-accent-green);
  text-shadow: 0 0 5px rgba(0, 255, 102, 0.3);
}

.fsm-error {
  color: var(--neon-red);
  margin-top: 10px;
  font-size: 1.1rem;
  text-shadow: 0 0 5px rgba(255, 51, 102, 0.3);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
}

/* Glitch text animation from Navbar for consistency */
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
  .section-title {
    font-size: 3rem;
  }
  .section-subtitle {
    font-size: 1.2rem;
  }
  .games-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
  }
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 25px;
  }
  .category-card {
    padding: 25px 15px;
  }
  .category-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 20px;
  }
  .category-text {
    font-size: 1rem;
  }
  .category-name {
    font-size: 1.3rem;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2.5rem;
  }
  .section-subtitle {
    font-size: 1.1rem;
  }
  .featured-section,
  .new-releases-section,
  .categories-section {
    padding: 60px 0;
  }
  .games-grid {
    grid-template-columns: 1fr; /* Single column on small screens */
    gap: 25px;
  }
  .categories-grid {
    grid-template-columns: repeat(2, 1fr); /* Two columns on small screens */
    gap: 20px;
  }
  .category-card {
    transform: none; /* Remove tilt on smaller screens for better readability */
  }
  .category-card:hover {
    transform: translateY(-5px) scale(1.02); /* Keep lift effect */
  }
  .fsm-section .cyber-input {
    width: calc(100% - 120px); /* Adjust width for button */
    margin-right: 5px;
  }
  .fsm-section .cyber-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 2rem;
  }
  .section-subtitle {
    font-size: 1rem;
  }
  .categories-grid {
    grid-template-columns: 1fr; /* Single column on extra small screens */
    gap: 15px;
  }
  .category-icon {
    width: 70px;
    height: 70px;
    margin-bottom: 15px;
  }
  .category-text {
    font-size: 0.9rem;
  }
  .category-name {
    font-size: 1.1rem;
  }
  .fsm-section .cyber-input {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
  .fsm-section .cyber-button {
    width: 100%;
  }
}
</style>