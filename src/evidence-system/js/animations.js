/**
 * Animations JavaScript for the Evidence Submission System
 * Handles dynamic animations and visual effects
 */

/**
 * Initialize animations for the page
 * This function should be called when the DOM is loaded
 */
function initializeAnimations() {
  // Add random gleam spots
  for (let i = 0; i < 10; i++) {
    const gleamSpot = document.createElement('div');
    gleamSpot.className = 'gleam-spot';
    gleamSpot.style.top = `${Math.random() * 100}%`;
    gleamSpot.style.left = `${Math.random() * 100}%`;
    gleamSpot.style.animationDelay = `${Math.random() * 4}s`;
    document.body.appendChild(gleamSpot);
  }
  
  // Add animation to buttons
  document.querySelectorAll('.official-button').forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 5px 15px rgba(37, 99, 235, 0.4)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
    
    button.addEventListener('mousedown', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 5px rgba(37, 99, 235, 0.4)';
    });
    
    button.addEventListener('mouseup', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 5px 15px rgba(37, 99, 235, 0.4)';
    });
  });
  
  // Initialize modal functionality
  document.querySelectorAll('.modal').forEach(modal => {
    // Close modal when clicking outside the content
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    // Close modal when pressing Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });
  });
}
