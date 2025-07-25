<script setup>
import { ref, watch, computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const categories = computed(() => store.state.categories)

const props = defineProps({
  game: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const gameData = ref({
  id: props.game?.id || null,
  title: props.game?.title || '',
  genre: props.game?.genre || '',
  price: props.game?.price || null,
  originalPrice: props.game?.originalPrice || null,
  description: props.game?.description || '',
  image: props.game?.image || '/placeholder.png', // Default placeholder
  platform: props.game?.platform || [],
  developer: props.game?.developer || '',
  tags: props.game?.tags || [],
  releaseDate: props.game?.releaseDate || new Date().toISOString().split('T')[0],
})

const isNewGame = computed(() => !gameData.value.id)

// Watch for changes in the 'game' prop to update the form when editing
watch(() => props.game, (newGame) => {
  if (newGame) {
    gameData.value = {
      id: newGame.id,
      title: newGame.title,
      genre: newGame.genre,
      price: newGame.price,
      originalPrice: newGame.originalPrice,
      description: newGame.description,
      image: newGame.image,
      platform: newGame.platform,
      developer: newGame.developer,
      tags: newGame.tags,
      releaseDate: newGame.releaseDate,
    }
    // Ensure platforms is an array, even if null/undefined from existing data
    if (!gameData.value.platform) {
      gameData.value.platform = []
    }
  } else {
    // Reset form for new game
    gameData.value = {
      id: null,
      title: '',
      genre: '',
      price: null,
      originalPrice: null,
      description: '',
      image: '/placeholder.png',
      platform: [],
      developer: '',
      tags: [],
      releaseDate: new Date().toISOString().split('T')[0],
    }
  }
}, { immediate: true })

const platformOptions = ['PC', 'PS5', 'Xbox', 'Switch', 'Mobile']
const tagInput = ref('')

const addTag = () => {
  if (tagInput.value && !gameData.value.tags.includes(tagInput.value.trim())) {
    gameData.value.tags.push(tagInput.value.trim())
    tagInput.value = ''
  }
}

const removeTag = (tagToRemove) => {
  gameData.value.tags = gameData.value.tags.filter(tag => tag !== tagToRemove)
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      gameData.value.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const submitForm = () => {
  // Basic validation
  if (!gameData.value.title || !gameData.value.genre || gameData.value.price === null || !gameData.value.description || gameData.value.platform.length === 0) {
    alert('Please fill in all required fields (Title, Genre, Price, Description, Platform).')
    return
  }
  emit('save', gameData.value)
}
</script>

<template>
  <div class="game-form-container cyber-panel">
    <h2 class="form-title">{{ isNewGame ? 'Add New Game' : 'Edit Game' }}</h2>
    <form @submit.prevent="submitForm" class="game-form">
      <div class="form-group">
        <label for="title" class="form-label">Title:</label>
        <input type="text" id="title" v-model="gameData.title" required class="cyber-input" />
      </div>

      <div class="form-group">
        <label for="genre" class="form-label">Genre:</label>
        <select id="genre" v-model="gameData.genre" required class="cyber-input">
          <option value="">Select a genre</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="price" class="form-label">Price (₨):</label>
        <input type="number" id="price" v-model.number="gameData.price" required min="0" class="cyber-input" />
      </div>

      <div class="form-group">
        <label for="originalPrice" class="form-label">Original Price (Optional, for deals ₨):</label>
        <input type="number" id="originalPrice" v-model.number="gameData.originalPrice" min="0" class="cyber-input" />
      </div>

      <div class="form-group">
        <label for="description" class="form-label">Description:</label>
        <textarea id="description" v-model="gameData.description" required rows="5" class="cyber-input"></textarea>
      </div>

      <div class="form-group">
        <label for="developer" class="form-label">Developer:</label>
        <input type="text" id="developer" v-model="gameData.developer" class="cyber-input" />
      </div>

      <div class="form-group">
        <label for="releaseDate" class="form-label">Release Date:</label>
        <input type="date" id="releaseDate" v-model="gameData.releaseDate" class="cyber-input" />
      </div>

      <div class="form-group platform-group">
        <label class="form-label">Platforms:</label>
        <div class="platform-checkboxes">
          <label v-for="platform in platformOptions" :key="platform" class="platform-item">
            <input type="checkbox" :value="platform" v-model="gameData.platform" class="cyber-checkbox" />
            <span class="checkbox-label-text">{{ platform }}</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="tags" class="form-label">Tags (Press Enter to add):</label>
        <div class="tags-input-container">
          <input type="text" id="tags" v-model="tagInput" @keyup.enter="addTag" class="cyber-input tag-input" placeholder="e.g., RPG, Sci-Fi" />
          <div class="tags-display">
            <span v-for="tag in gameData.tags" :key="tag" class="tag-item">
              {{ tag }} <button type="button" @click="removeTag(tag)" class="remove-tag-btn">x</button>
            </span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="imageUpload" class="form-label">Game Thumbnail:</label>
        <input type="file" id="imageUpload" @change="handleImageUpload" accept="image/*" class="cyber-input file-input" />
        <div v-if="gameData.image" class="image-preview">
          <img :src="gameData.image" alt="Game Thumbnail Preview" />
          <p>Current Image</p>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="cyber-button primary">{{ isNewGame ? 'Add Game' : 'Update Game' }}</button>
        <button type="button" @click="emit('cancel')" class="cyber-button secondary">Cancel</button>
      </div>
    </form>
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
  --cyber-accent-purple: #9900ff; /* Seller specific accent */
  --cyber-text-primary: #e0e0e0;
  --cyber-text-secondary: #a0a0a0;
  --cyber-glow-intensity: 0 0 15px var(--cyber-border-color), 0 0 30px var(--cyber-border-color);
  --cyber-glow-green: 0 0 15px var(--cyber-accent-green), 0 0 30px var(--cyber-accent-green);
  --cyber-glow-purple: 0 0 15px var(--cyber-accent-purple), 0 0 30px var(--cyber-accent-purple);
  --cyber-shadow-offset: 5px;
  --neon-red: #ff3366;
  --neon-yellow: #ffff00;
}

.game-form-container {
  background-color: var(--cyber-panel-bg);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(153, 0, 255, 0.5), inset 0 0 10px rgba(153, 0, 255, 0.2);
  position: relative;
  z-index: 2;
  overflow: hidden;
  clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%); /* Angular shape */
  transform: perspective(1000px) rotateY(-2deg) rotateX(2deg); /* Subtle 3D tilt */
  transition: all 0.3s ease;
}

.game-form-container::before {
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

.game-form-container:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-5px);
  box-shadow: 0 0 30px rgba(153, 0, 255, 0.8), inset 0 0 15px rgba(153, 0, 255, 0.3);
}

.game-form-container:hover::before {
  animation-play-state: paused;
  transform: translateX(0);
}

.form-title {
  font-family: 'Orbitron', monospace;
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--cyber-accent-purple);
  text-shadow: var(--cyber-glow-purple);
  text-align: center;
  margin-bottom: 30px;
  animation: glitch-text-purple 4s infinite alternate;
  position: relative;
  z-index: 2;
}

.game-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: var(--cyber-text-secondary);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Rajdhani', sans-serif;
}

.cyber-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 1rem;
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

textarea.cyber-input {
  resize: vertical;
  min-height: 100px;
}

.platform-group {
  margin-top: 10px;
}

.platform-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--cyber-text-secondary);
  border-radius: 8px;
  padding: 15px;
  box-shadow: inset 0 0 5px rgba(0, 240, 255, 0.1);
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--cyber-text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.cyber-checkbox {
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid var(--cyber-border-color);
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: inset 0 0 5px rgba(0, 240, 255, 0.2);
  display: grid;
  place-content: center;
}

.cyber-checkbox:checked {
  background-color: var(--cyber-accent-green);
  border-color: var(--cyber-accent-green);
  box-shadow: 0 0 10px var(--cyber-accent-green), inset 0 0 5px var(--cyber-accent-green);
}

.cyber-checkbox:checked::after {
  content: '✔';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--cyber-dark-bg);
  font-size: 16px;
  font-weight: bold;
}

.checkbox-label-text {
  margin-bottom: 0; /* Override default form-label margin */
  cursor: pointer;
}

.tags-input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-input {
  width: 100%;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
}

.tag-item {
  background-color: var(--cyber-accent-purple);
  color: var(--cyber-text-primary);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 0 8px rgba(153, 0, 255, 0.5);
}

.remove-tag-btn {
  background: none;
  border: none;
  color: var(--cyber-text-primary);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0 3px;
  transition: color 0.2s ease;
}

.remove-tag-btn:hover {
  color: var(--neon-red);
}

.image-preview {
  margin-top: 15px;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  height: auto;
  max-height: 200px;
  border: 2px solid var(--cyber-accent-green);
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 0 15px rgba(0, 255, 102, 0.5);
}

.image-preview p {
  font-size: 0.9rem;
  color: var(--cyber-text-secondary);
  margin-top: 10px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
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
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 75% 100%, 0% 100%);
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

.cyber-button.secondary {
  background-color: transparent;
  border-color: var(--neon-red);
  color: var(--neon-red);
  box-shadow: 0 0 10px rgba(255, 51, 102, 0.3);
}

.cyber-button.secondary:hover {
  background-color: var(--neon-red);
  color: var(--cyber-dark-bg);
  box-shadow: 0 0 15px rgba(255, 51, 102, 0.7);
}

/* Animations */
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
@media (max-width: 768px) {
  .form-title {
    font-size: 2rem;
  }
  .game-form-container {
    padding: 25px;
    transform: none; /* Remove 3D tilt on smaller screens */
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); /* Straighten clip-path */
  }
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  .cyber-button {
    width: 100%;
  }
  .platform-checkboxes {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .form-title {
    font-size: 1.8rem;
  }
  .game-form-container {
    padding: 20px;
  }
  .cyber-input {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
  .form-label {
    font-size: 12px;
  }
  .cyber-checkbox {
    width: 20px;
    height: 20px;
  }
  .cyber-checkbox:checked::after {
    font-size: 14px;
  }
}
</style>
