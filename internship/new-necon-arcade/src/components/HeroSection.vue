<script setup>
import { ref, onMounted } from 'vue'

const heroText = ref('')
const fullText = 'WELCOME TO THE NEON ARCADE'
const typingSpeed = 100

onMounted(() => {
  let i = 0
  const typeWriter = () => {
    if (i < fullText.length) {
      heroText.value += fullText.charAt(i)
      i++
      setTimeout(typeWriter, typingSpeed)
    }
  }
  typeWriter()
})
</script>

<template>
  <section class="hero-section">
    <div class="hero-background">
      <div class="hero-grid"></div>
    </div>

    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">
          <span class="typing-text neon-glow">{{ heroText }}</span>
          <span class="cursor">|</span>
        </h1>
        <p class="hero-subtitle">
          Dive into the digital underground where gaming meets cyberpunk aesthetics
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number neon-glow">1000+</span>
            <span class="stat-label">Players</span>
          </div>
          <div class="stat-item">
            <span class="stat-number neon-glow">50K+</span>
            <span class="stat-label">Games</span>
          </div>
          <div class="stat-item">
            <span class="stat-number neon-glow">24/7</span>
            <span class="stat-label">Support</span>
          </div>
        </div>
        <div class="hero-actions">
          <button class="cyber-button primary">Explore Games</button>
          <button class="cyber-button secondary">Watch Trailer</button>
        </div>
      </div>

      <div class="hero-visual">
        <div class="floating-elements">
          <div class="floating-cube cube-1"></div>
          <div class="floating-cube cube-2"></div>
          <div class="floating-cube cube-3"></div>
        </div>
        <div class="hero-image">
          <img src="/placeholder.svg?height=400&width=600" alt="Cyberpunk Gaming" class="main-image">
        </div>
      </div>
    </div>
  </section>
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

.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/placeholder.svg?height=800&width=1200') center center / cover no-repeat;
  border-bottom: 3px solid var(--cyber-accent-green);
  box-shadow: 0 0 30px rgba(0, 255, 102, 0.5);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.hero-grid {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 255, 102, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 102, 0.1) 1px, transparent 1px);
  background-size: 100px 100px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, 100px); }
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  z-index: 1;
}

.hero-text {
  z-index: 2;
}

.hero-title {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 20px;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
}

.typing-text {
  color: var(--cyber-accent-green);
}

.cursor {
  animation: blink 1s infinite;
  color: var(--cyber-accent-green);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--cyber-text-secondary);
  margin-bottom: 40px;
  line-height: 1.6;
  font-weight: 300;
}

.hero-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--cyber-text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-actions {
  display: flex;
  gap: 20px;
}

/* Cyber Button Styling (re-used from previous components) */
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

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-cube {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--cyber-accent-green);
  background: rgba(0, 255, 102, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 102, 0.5);
}

.cube-1 {
  top: 20%;
  left: 10%;
  animation: float 6s ease-in-out infinite;
}

.cube-2 {
  top: 60%;
  right: 20%;
  animation: float 8s ease-in-out infinite reverse;
}

.cube-3 {
  bottom: 20%;
  left: 30%;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.hero-image {
  position: relative;
  z-index: 1;
}

.main-image {
  max-width: 100%;
  height: auto;
  border: 2px solid var(--cyber-accent-green);
  box-shadow: 0 0 30px var(--cyber-glow-green); /* Using cyber-glow-green */
  filter: brightness(1.1) contrast(1.2);
}

/* Responsive Design */
@media (max-width: 968px) {
  .hero-section {
    height: 600px;
  }
  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  .hero-title {
    font-size: 2.5rem;
  }
  .hero-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: 450px;
  }
  .hero-title {
    font-size: 2rem;
  }
  .hero-subtitle {
    font-size: 1.2rem;
  }
  .hero-stats {
    gap: 20px;
  }
  .stat-number {
    font-size: 1.5rem;
  }
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  .cyber-button {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    height: 350px;
  }
  .hero-title {
    font-size: 2rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>