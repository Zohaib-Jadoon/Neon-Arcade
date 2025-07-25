<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useFsm } from '../../composables/useFsm'
import GameForm from '../../components/seller/GameForm.vue'

const store = useStore()
const router = useRouter()
const user = computed(() => store.getters.user)
const sellerGames = computed(() => store.getters.getGamesBySeller(user.value?.id))

const showGameForm = ref(false)
const editingGame = ref(null)

const { sendTransition } = useFsm()

const openAddGameForm = async () => {
  try {
    const response = await sendTransition('globalKey', 'ADD_GAME')
    console.log('FSM state after ADD_GAME:', response.state)
  } catch (error) {
    console.error('FSM transition error:', error)
  }
  editingGame.value = null
  showGameForm.value = true
}

const openEditGameForm = async (game) => {
  try {
    await sendTransition('globalKey', 'EDIT_GAME')
  } catch (error) {
    console.error('FSM transition error:', error)
  }
  editingGame.value = { ...game } // Pass a copy to avoid direct mutation
  showGameForm.value = true
}

const closeGameForm = async () => {
  try {
    await sendTransition('globalKey', 'CANCEL')
  } catch (error) {
    console.error('FSM transition error:', error)
  }
  showGameForm.value = false
  editingGame.value = null
}

const handleGameSaved = async (gameData) => {
  try {
    await sendTransition('globalKey', 'SAVE')
  } catch (error) {
    console.error('FSM transition error:', error)
  }
  if (gameData.id) {
    await store.dispatch('updateGame', gameData)
    alert('Game updated successfully!')
  } else {
    await store.dispatch('addGame', gameData)
    alert('Game added successfully!')
  }
  closeGameForm()
}

const deleteGame = async (gameId) => {
  if (confirm('Are you sure you want to delete this game?')) {
    try {
      await sendTransition('globalKey', 'DELETE_GAME')
      await sendTransition('globalKey', 'CONFIRM_DELETE')
    } catch (error) {
      console.error('FSM transition error:', error)
    }
    await store.dispatch('deleteGame', gameId)
    alert('Game deleted successfully!')
  }
}
</script>

<template>
  <div class="game-management-view container">
    <h1 class="page-title">Game Management</h1>
    <p class="page-subtitle">Add, edit, or remove your game listings.</p>

    <div class="add-game-section">
      <button @click="openAddGameForm" class="cyber-button primary">Add New Game</button>
    </div>

    <div v-if="sellerGames.length === 0" class="no-games cyber-panel">
      <p>You haven't listed any games yet. Click "Add New Game" to get started!</p>
    </div>

    <div v-else class="game-list">
      <div v-for="game in sellerGames" :key="game.id" class="game-item cyber-panel">
        <img :src="game.image" :alt="game.title" class="game-thumbnail" />
        <div class="game-details">
          <h3 class="game-title">{{ game.title }}</h3>
          <p class="game-genre">{{ game.genre }}</p>
          <p class="game-price">₨{{ game.price.toLocaleString() }}</p>
        </div>
        <div class="game-actions">
          <button @click="openEditGameForm(game)" class="action-button edit-button cyber-button">Edit</button>
          <button @click="deleteGame(game.id)" class="action-button delete-button cyber-button">Delete</button>
        </div>
      </div>
    </div>

    <div v-if="showGameForm" class="modal-overlay" @click.self="closeGameForm">
      <div class="modal-content cyber-panel">
        <button class="close-button" @click="closeGameForm">❌</button>
        <GameForm
          :game="editingGame"
          @save="handleGameSaved"
          @cancel="closeGameForm"
        />
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

.game-management-view {
  padding: 100px 20px 40px; /* Adjusted padding for fixed navbar */
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

.page-title {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 15px;
  color: var(--cyber-accent-purple); /* Purple for seller view */
  text-shadow: var(--cyber-glow-purple);
  animation: glitch-text-purple 4s infinite alternate;
}

.page-subtitle {
  font-size: 1.3rem;
  text-align: center;
  color: var(--cyber-text-secondary);
  margin-bottom: 40px;
}

.add-game-section {
  text-align: center;
  margin-bottom: 40px;
}

.cyber-button {
  background-color: var(--cyber-accent-purple);
  color: var(--cyber-text-primary);
  border: 2px solid var(--cyber-accent-purple);
  padding: 12px 25px;
  font-family: 'Orbitron', monospace;
  font-size: 1rem;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease-out;
  box-shadow: var(--cyber-glow-purple);
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%); /* Angular shape */
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

.cyber-button:hover {
  background-color: var(--cyber-border-color);
  border-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity), 0 0 30px var(--cyber-accent-purple);
  transform: translateY(-3px) scale(1.02);
}

.cyber-button:hover::before {
  left: 100%;
}

.no-games {
  text-align: center;
  font-size: 1.5rem;
  color: var(--cyber-text-secondary);
  padding: 50px 0;
  border: 2px dashed var(--cyber-border-color);
  border-radius: 15px;
  background-color: var(--cyber-panel-bg);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  position: relative;
  overflow: hidden;
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
  transform: perspective(1000px) rotateY(-2deg) rotateX(2deg); /* Subtle 3D tilt */
  transition: all 0.3s ease;
}

.no-games::before {
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

.no-games:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-5px);
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.8), inset 0 0 15px rgba(0, 240, 255, 0.3);
}

.no-games:hover::before {
  animation-play-state: paused;
  transform: translateX(0);
}

.game-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Smaller cards */
  gap: 30px;
}

.game-item {
  display: flex;
  flex-direction: column; /* Stack content vertically for smaller cards */
  align-items: center;
  gap: 15px;
  padding: 20px; /* Reduced padding */
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  border-radius: 15px;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  position: relative;
  overflow: hidden;
  clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%); /* Angular shape */
  transform: perspective(1000px) rotateY(2deg) rotateX(-2deg); /* Subtle 3D tilt */
  transition: all 0.3s ease;
}

.game-item::before {
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

.game-item:hover {
  transform: translateY(-8px) scale(1.02) perspective(1000px) rotateY(0deg) rotateX(0deg);
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.7), inset 0 0 12px rgba(0, 240, 255, 0.3);
}

.game-item:hover::before {
  animation-play-state: paused;
  transform: translateX(0);
}

.game-thumbnail {
  width: 150px; /* Adjusted size for smaller cards */
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--cyber-accent-green); /* Neon green border */
  box-shadow: 0 0 10px rgba(0, 255, 102, 0.5);
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.game-item:hover .game-thumbnail {
  box-shadow: 0 0 20px rgba(0, 255, 102, 0.8);
}

.game-details {
  flex-grow: 1;
  text-align: center; /* Center text for stacked layout */
  position: relative;
  z-index: 2;
}

.game-title {
  font-family: 'Orbitron', monospace;
  font-size: 1.6rem; /* Adjusted font size */
  color: var(--cyber-accent-green);
  margin-bottom: 8px;
  text-shadow: var(--cyber-glow-green);
}

.game-genre {
  font-size: 1rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 8px;
}

.game-price {
  font-family: 'Orbitron', monospace;
  font-size: 1.3rem;
  color: var(--neon-yellow);
  text-shadow: 0 0 8px var(--neon-yellow);
}

.game-actions {
  display: flex;
  gap: 10px;
  width: 100%; /* Ensure buttons take full width */
  justify-content: center;
  position: relative;
  z-index: 2;
}

.action-button {
  flex: 1; /* Distribute space evenly */
  padding: 10px 15px;
  border-radius: 8px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.edit-button {
  background-color: transparent;
  border-color: var(--cyber-border-color);
  color: var(--cyber-border-color);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.edit-button:hover {
  background-color: var(--cyber-border-color);
  color: var(--cyber-dark-bg);
  box-shadow: var(--cyber-glow-intensity);
}

.delete-button {
  background-color: transparent;
  border-color: var(--neon-red);
  color: var(--neon-red);
  box-shadow: 0 0 10px rgba(255, 51, 102, 0.3);
}

.delete-button:hover {
  background-color: var(--neon-red);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 15px rgba(255, 51, 102, 0.7);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85); /* Darker overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px); /* Stronger blur */
}

.modal-content {
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-accent-purple); /* Purple border for modal */
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 700px;
  position: relative;
  box-shadow: 0 0 30px rgba(153, 0, 255, 0.5), inset 0 0 15px rgba(153, 0, 255, 0.2); /* Purple glow */
  animation: fadeIn 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
  transform: perspective(1000px) rotateY(-2deg) rotateX(2deg); /* Subtle 3D tilt */
  transition: all 0.3s ease;
}

.modal-content:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-5px);
  box-shadow: 0 0 40px rgba(153, 0, 255, 0.8), inset 0 0 20px rgba(153, 0, 255, 0.3);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: var(--neon-red);
  cursor: pointer;
  font-size: 2.5rem; /* Larger close button */
  transition: transform 0.2s ease, color 0.2s ease, text-shadow 0.2s ease;
  text-shadow: 0 0 10px rgba(255, 51, 102, 0.5);
  z-index: 10; /* Ensure it's above other content */
}

.close-button:hover {
  transform: rotate(90deg) scale(1.1);
  color: #ff6699;
  text-shadow: 0 0 15px #ff6699;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px) perspective(1000px) rotateY(-5deg) rotateX(5deg); }
  to { opacity: 1; transform: translateY(0) perspective(1000px) rotateY(-2deg) rotateX(2deg); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes glitch-text-purple {
  0% {
    text-shadow: var(--cyber-glow-purple);
    transform: translate(0, 0);
  }
  20% {
    text-shadow: var(--cyber-glow-purple);
    transform: translate(-1px, 1px);
  }
  40% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(1px, -1px);
  }
  60% {
    text-shadow: var(--cyber-glow-purple);
    transform: translate(-0.5px, 0.5px);
  }
  80% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(0.5px, -0.5px);
  }
  100% {
    text-shadow: var(--cyber-glow-purple);
    transform: translate(0, 0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .page-title {
    font-size: 3rem;
  }
  .page-subtitle {
    font-size: 1.2rem;
  }
  .game-list {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 25px;
  }
  .game-item {
    padding: 18px;
  }
  .game-thumbnail {
    width: 120px;
    height: 120px;
  }
  .game-title {
    font-size: 1.4rem;
  }
  .game-price {
    font-size: 1.2rem;
  }
  .action-button {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  .modal-content {
    padding: 25px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
  .page-subtitle {
    font-size: 1.1rem;
  }
  .game-list {
    grid-template-columns: 1fr; /* Single column on small screens */
    gap: 20px;
  }
  .game-item {
    flex-direction: row; /* Revert to row for better use of horizontal space */
    text-align: left;
    padding: 15px;
    gap: 15px;
    transform: none; /* Remove 3D tilt on smaller screens */
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); /* Straighten clip-path */
  }
  .game-thumbnail {
    width: 90px;
    height: 90px;
  }
  .game-details {
    text-align: left;
  }
  .game-actions {
    flex-direction: column; /* Stack buttons vertically */
    width: auto;
    justify-content: flex-start;
    gap: 8px;
  }
  .action-button {
    flex-grow: 0; /* Don't grow to full width */
    width: 100px; /* Fixed width for buttons */
  }
  .modal-content {
    padding: 20px;
    transform: none; /* Remove 3D tilt on smaller screens */
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); /* Straighten clip-path */
  }
  .close-button {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }
  .page-subtitle {
    font-size: 1rem;
  }
  .game-item {
    padding: 12px;
    gap: 10px;
  }
  .game-thumbnail {
    width: 70px;
    height: 70px;
  }
  .game-title {
    font-size: 1.2rem;
  }
  .game-genre {
    font-size: 0.9rem;
  }
  .game-price {
    font-size: 1.1rem;
  }
  .action-button {
    padding: 6px 10px;
    font-size: 0.75rem;
    width: 80px;
  }
  .modal-content {
    padding: 15px;
  }
  .close-button {
    font-size: 1.8rem;
    top: 10px;
    right: 10px;
  }
}
</style>
