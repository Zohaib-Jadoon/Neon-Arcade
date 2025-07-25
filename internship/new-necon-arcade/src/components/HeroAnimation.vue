<script setup>
const emit = defineEmits(['explore-games', 'learn-more']);
</script>

<template>
  <div class="hero-animation">
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="neon-text green-glow">NEON</span>
        <span class="neon-text cyan-glow">ARCADE</span>
      </h1>
      <p class="hero-subtitle glitch">Your Gateway to the Future of Gaming</p>
      <div class="hero-buttons">
        <button @click="emit('explore-games')" class="cyber-button primary">Explore Games</button>
        <button @click="emit('learn-more')" class="cyber-button secondary">Learn More</button>
      </div>
    </div>
    <div class="grid-overlay"></div>
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

.hero-animation {
  position: relative;
  height: 700px; /* Increased height for visual impact */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--cyber-text-primary);
  overflow: hidden;
  background-color: var(--cyber-dark-bg);
  border-bottom: 3px solid var(--cyber-accent-green);
  box-shadow: 0 0 30px rgba(0, 255, 102, 0.5);
}

.hero-content {
  z-index: 2;
  max-width: 900px;
  padding: 20px;
  position: relative;
}

.hero-title {
  font-size: 5rem;
  margin-bottom: 20px;
  font-family: 'Orbitron', monospace;
  line-height: 1;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.neon-text {
  animation: neon-flicker 1.5s infinite alternate;
}

.green-glow {
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
}

.cyan-glow {
  color: var(--cyber-border-color); /* Using border-color for cyan glow */
  text-shadow: var(--cyber-glow-intensity);
}

.hero-subtitle {
  font-size: 1.8rem;
  margin-bottom: 40px;
  color: var(--cyber-text-secondary);
  font-weight: 300;
  position: relative;
  display: inline-block;
}

.glitch {
  animation: glitch 2s infinite alternate;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(to right, rgba(0, 255, 102, 0.1) 1px, transparent 1px), /* Using rgba for green accent */
    linear-gradient(to bottom, rgba(0, 255, 102, 0.1) 1px, transparent 1px); /* Using rgba for green accent */
  background-size: 50px 50px;
  z-index: 1;
  animation: grid-pulse 5s infinite alternate;
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

/* Animations */
@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    opacity: 1;
    text-shadow:
      0 0 10px currentColor,
      0 0 20px currentColor,
      0 0 30px currentColor,
      0 0 40px currentColor;
  }
  20%, 24%, 55% {
    opacity: 0.5;
    text-shadow: none;
  }
}

@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

@keyframes grid-pulse {
  0% { opacity: 0.1; }
  50% { opacity: 0.3; }
  100% { opacity: 0.1; }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-animation {
    height: 600px;
  }
  .hero-title {
    font-size: 4rem;
    gap: 15px;
  }
  .hero-subtitle {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .hero-animation {
    height: 500px;
  }
  .hero-title {
    font-size: 3rem;
    flex-direction: column;
    gap: 5px;
  }
  .hero-subtitle {
    font-size: 1.2rem;
  }
  .hero-buttons {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .hero-animation {
    height: 400px;
  }
  .hero-title {
    font-size: 2.2rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>