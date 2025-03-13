/**
 * Main JavaScript file for the Evidence Submission System
 * Handles initialization and global variables
 */

// Global variables
let containerCount = 0;
let sealedCount = 0;
let viewStatus = {};
let containerEvidenceStatus = {};

/**
 * Get the current timestamp
 * @returns {string} The formatted timestamp
 */
function getCurrentTimestamp() {
  const now = new Date();
  return now.toLocaleString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false
  });
}

/**
 * Generate a unique ID for the document
 * @returns {string} The unique ID
 */
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase() + 
         '-' + 
         Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Set up the live clock
  const clockElement = document.getElementById('live-clock');
  if (clockElement) {
    function updateClock() {
      const now = new Date();
      clockElement.textContent = now.toLocaleString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false
      });
    }
    
    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
  }
  
  // Generate and set unique document ID
  const uniqueIdElement = document.getElementById('unique-id');
  if (uniqueIdElement) {
    uniqueIdElement.textContent = generateUniqueId();
  }
  
  // Set up add container button
  const addContainerButton = document.getElementById('add-container');
  if (addContainerButton && typeof addContainer === 'function') {
    addContainerButton.addEventListener('click', addContainer);
  }
  
  // Set up send evidence button
  const sendEvidenceButton = document.getElementById('send-evidence');
  if (sendEvidenceButton && typeof handleEvidenceSubmission === 'function') {
    sendEvidenceButton.addEventListener('click', handleEvidenceSubmission);
  }
  
  // Set up copy link button
  const copyLinkButton = document.getElementById('copy-link');
  if (copyLinkButton) {
    copyLinkButton.addEventListener('click', function() {
      const linkInput = document.getElementById('share-link');
      if (linkInput) {
        linkInput.select();
        document.execCommand('copy');
        
        // Show copied feedback
        const originalText = copyLinkButton.textContent;
        copyLinkButton.textContent = 'COPIED!';
        setTimeout(() => {
          copyLinkButton.textContent = originalText;
        }, 2000);
      }
    });
  }
  
  // Set up back to editor button
  const backToEditButton = document.getElementById('back-to-edit');
  if (backToEditButton) {
    backToEditButton.addEventListener('click', function() {
      const shareContainer = document.getElementById('share-container');
      if (shareContainer) {
        shareContainer.style.display = 'none';
        window.scrollTo(0, 0);
      }
    });
  }
  
  // Initialize Supabase
  try {
    if (typeof initializeSupabase === 'function') {
      initializeSupabase();
      console.log('Supabase initialized');
      
      // Load user's existing evidence containers if authenticated
      loadUserData();
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
  }
});

/**
 * Load user's data from Supabase
 */
async function loadUserData() {
  try {
    // Check if Supabase is initialized
    if (typeof supabase === 'undefined' || supabase === null) {
      console.error('Supabase client not initialized');
      return;
    }
    
    // Check if user is authenticated
    const sessionResponse = await supabase.auth.getSession();
    if (!sessionResponse.data.session) {
      console.log('User not authenticated');
      return;
    }
    
    // Check if getEvidenceContainers function exists
    if (typeof getEvidenceContainers === 'function') {
      // Get the user's evidence containers
      const result = await getEvidenceContainers();
      
      if (result.success && result.containers.length > 0) {
        console.log('User has existing evidence containers:', result.containers);
        
        // Show existing containers
        // This would typically create container elements for each existing container
        // For now, we'll just log them
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}
