/**
 * Animations JavaScript file for the Evidence Submission System
 * Handles visual effects and animations
 */

/**
 * Initialize all animations
 */
function initializeAnimations() {
  animateGlowingOrbs();
  animateGleamSpots();
}

/**
 * Animate the glowing orbs
 */
function animateGlowingOrbs() {
  const orbs = document.querySelectorAll('.glowing-orb');
  
  function moveOrb(orb, index) {
    const x = 30 + Math.sin(Date.now() / 4000 + index) * 20;
    const y = 30 + Math.cos(Date.now() / 3000 + index) * 20;
    orb.style.left = `${x}%`;
    orb.style.top = `${y}%`;
  }
  
  function animateOrbs() {
    orbs.forEach((orb, index) => {
      moveOrb(orb, index);
    });
    requestAnimationFrame(animateOrbs);
  }
  
  animateOrbs();
}

/**
 * Animate the gleam spots
 */
function animateGleamSpots() {
  const gleamSpots = document.querySelectorAll('.gleam-spot');
  
  function animateGleams() {
    gleamSpots.forEach((spot, i) => {
      // Create a unique movement pattern for each spot
      const t = Date.now() / 1000;
      const scale = 0.8 + Math.sin(t * 0.5 + i) * 0.2;
      const opacity = 0.5 + Math.sin(t * 0.7 + i * 2) * 0.5;
      
      spot.style.transform = `scale(${scale})`;
      spot.style.opacity = opacity;
    });
    
    requestAnimationFrame(animateGleams);
  }
  
  animateGleams();
}
