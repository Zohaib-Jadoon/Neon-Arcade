<script setup>
import { onMounted } from 'vue'
import { useFsm } from '../composables/useFsm'
import { ref as vueRef } from 'vue'

const fsmKey = 'globalKey' // Example key, can be dynamic
const fsmTransition = vueRef('GO_ABOUT') // Transition event for About page
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
  // Send FSM transition on page mount
  triggerFsmTransition()
})
</script>

<template>
  <div class="about-page container">
    <h1 class="page-title">About Neon Arcade</h1>
    <p class="tagline">Your Gateway to the Future of Gaming in Pakistan</p>

    <section class="cyber-panel fade-in">
      <h2 class="section-heading">Our Vision</h2>
      <p class="section-content">
        To be the leading digital hub for cyberpunk and futuristic gaming in Pakistan, fostering a vibrant community
        where gamers can discover, connect, and immerse themselves in cutting-edge virtual worlds. We envision a future
        where every Pakistani gamer has access to the latest and most exciting titles, delivered with unparalleled
        convenience and security.
      </p>
    </section>

    <section class="cyber-panel fade-in">
      <h2 class="section-heading">Our Mission</h2>
      <ul class="mission-list">
        <li class="cyber-panel-inner list-item-fade-in">
          <span class="list-icon">✅</span>
          <span class="list-text">
            <strong>Curated Selection:</strong> To offer a meticulously curated collection of cyberpunk, sci-fi, and futuristic games,
            ensuring high quality and diverse experiences for our community.
          </span>
        </li>
        <li class="cyber-panel-inner list-item-fade-in">
          <span class="list-icon">✅</span>
          <span class="list-text">
            <strong>Seamless Experience:</strong> To provide a secure, user-friendly, and efficient platform for purchasing and
            managing digital games, with localized payment options tailored for Pakistan.
          </span>
        </li>
        <li class="cyber-panel-inner list-item-fade-in">
          <span class="list-icon">✅</span>
          <span class="list-text">
            <strong>Community Building:</strong> To cultivate a thriving community of like-minded gamers through forums, events,
            and interactive features, promoting discussion and shared passion.
          </span>
        </li>
        <li class="cyber-panel-inner list-item-fade-in">
          <span class="list-icon">✅</span>
          <span class="list-text">
            <strong>Empowering Sellers:</strong> To offer a robust platform for local game developers and sellers to showcase their
            creations and reach a wider audience within Pakistan.
          </span>
        </li>
      </ul>
    </section>

    <section class="cyber-panel fade-in">
      <h2 class="section-heading">Why Choose Neon Arcade?</h2>
      <div class="features-grid">
        <div class="feature-card cyber-panel-inner list-item-fade-in">
          <h3>Exclusive Titles</h3>
          <p>Access to a unique selection of games not easily found elsewhere in Pakistan.</p>
        </div>
        <div class="feature-card cyber-panel-inner list-item-fade-in">
          <h3>Local Payment Options</h3>
          <p>Convenient payment methods including EasyPaisa, JazzCash, and bank transfers.</p>
        </div>
        <div class="feature-card cyber-panel-inner list-item-fade-in">
          <h3>Secure & Reliable</h3>
          <p>Your transactions and data are protected with state-of-the-art security measures.</p>
        </div>
        <div class="feature-card cyber-panel-inner list-item-fade-in">
          <h3>Vibrant Community</h3>
          <p>Join a growing community of cyberpunk enthusiasts and fellow gamers.</p>
        </div>
      </div>
    </section>

    <section class="cyber-panel fade-in">
      <h2 class="section-heading">Our Story</h2>
      <p class="section-content">
        Founded by a team of passionate gamers and tech enthusiasts in Islamabad, Pakistan, Neon Arcade was born out of a
        desire to fill a void in the local gaming market. We noticed the increasing demand for digital games, especially
        those with a futuristic and cyberpunk aesthetic, but also the challenges faced by Pakistani gamers in accessing
        them. Our goal is to bridge that gap, providing a dedicated platform that understands and caters to the unique
        needs of the Pakistani gaming community. We are committed to continuously evolving, bringing you the best of
        the gaming world, right to your fingertips.
      </p>
    </section>

    <section class="contact-info cyber-panel fade-in">
      <h2 class="section-heading">Get in Touch</h2>
      <p>Have questions or feedback? We'd love to hear from you!</p>
      <ul class="contact-list">
        <li class="list-item-fade-in">Email: <a href="mailto:support@neonarcade.pk">support@neonarcade.pk</a></li>
        <li class="list-item-fade-in">Phone: +92 3XX XXXXXXX</li>
        <li class="list-item-fade-in">Address: Teresol pvt ltd, Islamabad, Pakistan</li>
      </ul>
    </section>
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

/* Base styles for the view */
.about-page {
  padding: 100px 20px 40px; /* Adjusted padding for fixed navbar */
  min-height: 100vh;
  background-color: var(--cyber-dark-bg);
  color: var(--cyber-text-primary);
  font-family: 'Rajdhani', sans-serif; /* Ensure futuristic font */
  perspective: 1000px; /* For 3D effects */
  overflow-x: hidden; /* Prevent horizontal scroll from 3D transforms */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Page Title and Tagline */
.page-title {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 15px;
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
  animation: glitch-text 3s infinite alternate; /* Glitch animation */
  position: relative;
  z-index: 10;
}

.tagline {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  text-align: center;
  color: var(--cyber-border-color); /* Neon Cyan */
  margin-bottom: 60px;
  text-shadow: var(--cyber-glow-intensity);
}

/* Cyber Panel Base Style */
.cyber-panel {
  background-color: var(--cyber-panel-bg);
  border: 2px solid var(--cyber-border-color);
  border-radius: 15px; /* More rounded corners */
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.5), inset 0 0 10px rgba(0, 240, 255, 0.2); /* Stronger glow */
  padding: 30px;
  position: relative;
  transform-style: preserve-3d; /* For nested 3D elements */
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
  animation: border-pulse 4s infinite alternate; /* Subtle border pulse */
  margin-bottom: 60px; /* Spacing between sections */
  /* Removed clip-path for straight edges */
  transform: none; /* Ensure no initial 3D tilt */
}

.cyber-panel:hover {
  transform: translateY(-5px); /* Lift on hover, no rotation */
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.8), inset 0 0 15px rgba(0, 240, 255, 0.3);
}

/* Pseudo-elements for corner accents */
.cyber-panel::before,
.cyber-panel::after {
  content: '';
  position: absolute;
  width: 20px; /* Larger corners */
  height: 20px;
  border: 2px solid var(--cyber-accent-green);
  box-shadow: 0 0 10px var(--cyber-accent-green); /* Green glow for corners */
}

.cyber-panel::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.cyber-panel::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

/* Inner Cyber Panel for list items and feature cards */
.cyber-panel-inner {
  background-color: rgba(26, 26, 26, 0.8); /* Slightly more transparent */
  border: 1px solid var(--cyber-accent-purple);
  border-radius: 10px; /* Slightly more rounded */
  padding: 20px;
  box-shadow: 0 0 10px rgba(153, 0, 255, 0.3), inset 0 0 5px rgba(153, 0, 255, 0.1);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  transform: none; /* Ensure no initial 3D tilt */
}

.cyber-panel-inner:hover {
  transform: translateY(-3px); /* Lift on hover, no rotation */
  box-shadow: 0 0 15px rgba(153, 0, 255, 0.5), inset 0 0 8px rgba(153, 0, 255, 0.2);
}

/* Section Headings */
.section-heading {
  font-family: 'Orbitron', monospace;
  font-size: 2.2rem;
  color: var(--cyber-accent-green);
  margin-bottom: 25px;
  text-align: center;
  text-shadow: var(--cyber-glow-green);
  position: relative;
}

.section-heading::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, var(--cyber-accent-green), var(--cyber-border-color));
  margin: 10px auto 0;
  box-shadow: var(--cyber-glow-green);
}

.section-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--cyber-text-secondary);
  text-align: justify;
  text-shadow: 0 0 5px rgba(160, 160, 160, 0.1);
}

/* Mission List */
.mission-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px; /* Spacing between list items */
}

.mission-list li {
  display: flex;
  align-items: flex-start;
  font-size: 1.1rem;
  color: var(--cyber-text-primary);
  line-height: 1.6;
}

.list-icon {
  font-size: 1.8rem; /* Larger icon */
  margin-right: 15px;
  color: var(--cyber-border-color); /* Neon Cyan */
  flex-shrink: 0;
  text-shadow: var(--cyber-glow-intensity);
}

.list-text strong {
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}
.feature-card h3 {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  color: var(--cyber-accent-green);
  margin-bottom: 15px;
  text-shadow: var(--cyber-glow-green);
}

.feature-card p {
  font-size: 1rem;
  color: var(--cyber-text-secondary);
}

/* Contact Info */
.contact-info {
  text-align: center;
}

.contact-info p {
  color: var(--cyber-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

.contact-list li {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: var(--cyber-text-primary);
}

.contact-list a {
  color: var(--cyber-border-color); /* Neon Cyan */
  text-decoration: underline;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.contact-list a:hover {
  color: var(--cyber-accent-green);
  text-shadow: var(--cyber-glow-green);
}

/* Animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px); /* No rotation */
  }
  to {
    opacity: 1;
    transform: translateY(0); /* No rotation */
  }
}

@keyframes list-item-fade-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes glitch-text {
  0% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(0, 0);
  }
  20% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(-2px, 2px);
  }
  40% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(2px, -2px);
  }
  60% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(-1px, 1px);
  }
  80% {
    text-shadow: var(--cyber-glow-intensity);
    transform: translate(1px, -1px);
  }
  100% {
    text-shadow: var(--cyber-glow-green);
    transform: translate(0, 0);
  }
}

@keyframes border-pulse {
  0% { border-color: var(--cyber-border-color); box-shadow: var(--cyber-glow-intensity); }
  50% { border-color: var(--cyber-accent-green); box-shadow: var(--cyber-glow-green); }
  100% { border-color: var(--cyber-border-color); box-shadow: var(--cyber-glow-intensity); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Apply animations with delay */
.fade-in {
  opacity: 0;
  animation: fade-in 0.8s ease-out forwards;
}

.fade-in:nth-child(1) { animation-delay: 0.2s; }
.fade-in:nth-child(2) { animation-delay: 0.4s; }
.fade-in:nth-child(3) { animation-delay: 0.6s; }
.fade-in:nth-child(4) { animation-delay: 0.8s; }
.fade-in:nth-child(5) { animation-delay: 1.0s; }

.list-item-fade-in {
  opacity: 0;
  animation: list-item-fade-in 0.6s ease-out forwards;
}

.mission-list .list-item-fade-in:nth-child(1) { animation-delay: 0.6s; }
.mission-list .list-item-fade-in:nth-child(2) { animation-delay: 0.7s; }
.mission-list .list-item-fade-in:nth-child(3) { animation-delay: 0.8s; }
.mission-list .list-item-fade-in:nth-child(4) { animation-delay: 0.9s; }

.features-grid .list-item-fade-in:nth-child(1) { animation-delay: 1.0s; }
.features-grid .list-item-fade-in:nth-child(2) { animation-delay: 1.1s; }
.features-grid .list-item-fade-in:nth-child(3) { animation-delay: 1.2s; }
.features-grid .list-item-fade-in:nth-child(4) { animation-delay: 1.3s; }

.contact-list .list-item-fade-in:nth-child(1) { animation-delay: 1.4s; }
.contact-list .list-item-fade-in:nth-child(2) { animation-delay: 1.5s; }
.contact-list .list-item-fade-in:nth-child(3) { animation-delay: 1.6s; }

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2.8rem;
  }
  .tagline {
    font-size: 1.2rem;
  }
  .section-heading {
    font-size: 1.8rem;
  }
  .section-content, .mission-list li, .feature-card p, .contact-list li {
    font-size: 1rem;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
  .cyber-panel {
    transform: none; /* Ensure no 3D tilt on smaller screens */
    /* Removed clip-path for straight edges */
  }
  .cyber-panel::before, .cyber-panel::after {
    width: 10px;
    height: 10px;
  }
  .cyber-panel-inner {
    transform: none; /* Ensure no inner 3D tilt on smaller screens */
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2.2rem;
    margin-bottom: 40px;
  }
  .tagline {
    font-size: 1rem;
  }
  .section-heading {
    font-size: 1.5rem;
  }
  .cyber-panel {
    padding: 20px;
  }
  .list-icon {
    font-size: 1.5rem;
  }
}
</style>
