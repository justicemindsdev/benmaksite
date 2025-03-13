/**
 * Supabase Integration for Evidence Submission System
 * Handles authentication and database operations
 */

// Supabase configuration
const SUPABASE_URL = 'https://eflzhvxrymhfvyfbxkrw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbHpodnhyeW1oZnZ5ZmJ4a3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTE5NTMsImV4cCI6MjA1MTkyNzk1M30.FP4H6bu8uDkgqq5-J3G8zBdl-OoQ20PFXKw6dFsP8PA';

/**
 * Initialize Supabase client
 * This function should be called when the page loads
 */
function initializeSupabase() {
  try {
    // The Supabase CDN script creates a global 'supabase' object
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
      console.error('Supabase client not loaded. Make sure to include the Supabase JavaScript library.');
      return;
    }
    
    // Create Supabase client
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Store the client for use in other functions
    window.supabaseClient = client;
    
    console.log('Supabase client initialized successfully');
    
    // Check for existing session
    checkSession();
    
    return client;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
}

/**
 * Check if user is already logged in
 * @returns {Promise<Object|null>} The session object or null if not logged in
 */
async function checkSession() {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    if (error) {
      console.error('Error checking session:', error.message);
      return null;
    }
    
    if (session) {
      // User is logged in
      console.log('User is logged in:', session.user);
      updateUIForAuthenticatedUser(session.user);
      return session;
    } else {
      // User is not logged in
      console.log('User is not logged in');
      updateUIForUnauthenticatedUser();
      return null;
    }
  } catch (error) {
    console.error('Error checking session:', error.message);
    return null;
  }
}

/**
 * Sign up a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} username - User's username
 * @returns {Promise<Object>} Result object with success flag and user data or error message
 */
async function signUp(email, password, username) {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    // Sign up the user
    const { data: authData, error: authError } = await window.supabaseClient.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('Error signing up:', authError.message);
      return { success: false, message: authError.message };
    }
    
    // Create a profile for the user
    if (authData.user) {
      const { error: profileError } = await window.supabaseClient
        .from('profiles')
        .insert([
          { 
            user_id: authData.user.id,
            username,
            email
          }
        ]);
      
      if (profileError) {
        console.error('Error creating profile:', profileError.message);
        return { success: false, message: profileError.message };
      }
      
      updateUIForAuthenticatedUser(authData.user);
      return { success: true, user: authData.user };
    }
  } catch (error) {
    console.error('Error signing up:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Sign in with OAuth provider (Google or Microsoft)
 * @param {string} provider - The OAuth provider ('google' or 'microsoft')
 * @returns {Promise<Object>} Result object with success flag and user data or error message
 */
async function signInWithOAuth(provider) {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    
    if (error) {
      console.error(`Error signing in with ${provider}:`, error.message);
      return { success: false, message: error.message };
    }
    
    // The OAuth flow will redirect the user away from the page
    // When they return, the session will be automatically handled
    return { success: true };
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Sign in an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Result object with success flag and user data or error message
 */
async function signIn(email, password) {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Error signing in:', error.message);
      return { success: false, message: error.message };
    }
    
    updateUIForAuthenticatedUser(data.user);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error signing in:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<Object>} Result object with success flag or error message
 */
async function signOut() {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    const { error } = await window.supabaseClient.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error.message);
      return { success: false, message: error.message };
    }
    
    updateUIForUnauthenticatedUser();
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Update UI for authenticated user
 * @param {Object} user - User object
 */
function updateUIForAuthenticatedUser(user) {
  // This function will be implemented to update the UI for authenticated users
  // For example, show user profile, enable evidence submission, etc.
  
  // Show user email in the UI
  const userEmailElement = document.getElementById('user-email');
  if (userEmailElement) {
    userEmailElement.textContent = user.email;
  }
  
  // Show authenticated UI elements
  document.querySelectorAll('.auth-only').forEach(el => {
    el.style.display = 'block';
  });
  
  // Hide unauthenticated UI elements
  document.querySelectorAll('.unauth-only').forEach(el => {
    el.style.display = 'none';
  });
}

/**
 * Update UI for unauthenticated user
 */
function updateUIForUnauthenticatedUser() {
  // This function will be implemented to update the UI for unauthenticated users
  // For example, show login form, disable evidence submission, etc.
  
  // Hide authenticated UI elements
  document.querySelectorAll('.auth-only').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show unauthenticated UI elements
  document.querySelectorAll('.unauth-only').forEach(el => {
    el.style.display = 'block';
  });
}

/**
 * Create a new evidence container
 * @param {string} title - Container title
 * @param {string} description - Container description
 * @returns {Promise<Object>} Result object with success flag and container data or error message
 */
async function createEvidenceContainer(title, description) {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    // Get the current user
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return { success: false, message: 'User not authenticated' };
    }
    
    // Get the user's profile
    const { data: profiles, error: profileError } = await window.supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting profile:', profileError.message);
      return { success: false, message: profileError.message };
    }
    
    // Create the evidence container
    const { data, error } = await window.supabaseClient
      .from('evidence_containers')
      .insert([
        { 
          user_id: profiles.id,
          title,
          description
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating evidence container:', error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, container: data[0] };
  } catch (error) {
    console.error('Error creating evidence container:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Add evidence item to a container
 * @param {number} containerId - Container ID
 * @param {string} title - Evidence title
 * @param {string} description - Evidence description
 * @param {string} fileUrl - URL to the evidence file
 * @returns {Promise<Object>} Result object with success flag and item data or error message
 */
async function addEvidenceItem(containerId, title, description, fileUrl) {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    const { data, error } = await window.supabaseClient
      .from('evidence_items')
      .insert([
        { 
          container_id: containerId,
          title,
          description,
          file_url: fileUrl
        }
      ])
      .select();
    
    if (error) {
      console.error('Error adding evidence item:', error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, item: data[0] };
  } catch (error) {
    console.error('Error adding evidence item:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Upload a file to Supabase storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path
 * @returns {Promise<Object>} Result object with success flag and URL or error message
 */
async function uploadFile(file, path) {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    const filePath = `${path}/${Date.now()}_${file.name}`;
    const { data, error } = await window.supabaseClient.storage
      .from('evidence')
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading file:', error.message);
      return { success: false, message: error.message };
    }
    
    // Get public URL for the file
    const { data: { publicUrl } } = window.supabaseClient.storage
      .from('evidence')
      .getPublicUrl(filePath);
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Submit evidence container
 * @param {number} containerId - Container ID
 * @returns {Promise<Object>} Result object with success flag and submission data or error message
 */
async function submitEvidence(containerId) {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    // Get the current user
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return { success: false, message: 'User not authenticated' };
    }
    
    // Get the user's profile
    const { data: profiles, error: profileError } = await window.supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting profile:', profileError.message);
      return { success: false, message: profileError.message };
    }
    
    // Create the submission
    const { data, error } = await window.supabaseClient
      .from('submissions')
      .insert([
        { 
          user_id: profiles.id,
          container_id: containerId,
          status: 'submitted'
        }
      ])
      .select();
    
    if (error) {
      console.error('Error submitting evidence:', error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, submission: data[0] };
  } catch (error) {
    console.error('Error submitting evidence:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Get user's evidence containers
 * @returns {Promise<Object>} Result object with success flag and containers data or error message
 */
async function getEvidenceContainers() {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    // Get the current user
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return { success: false, message: 'User not authenticated' };
    }
    
    // Get the user's profile
    const { data: profiles, error: profileError } = await window.supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting profile:', profileError.message);
      return { success: false, message: profileError.message };
    }
    
    // Get the user's evidence containers
    const { data, error } = await window.supabaseClient
      .from('evidence_containers')
      .select('*')
      .eq('user_id', profiles.id);
    
    if (error) {
      console.error('Error getting evidence containers:', error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, containers: data };
  } catch (error) {
    console.error('Error getting evidence containers:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Get evidence items for a container
 * @param {number} containerId - Container ID
 * @returns {Promise<Object>} Result object with success flag and items data or error message
 */
async function getEvidenceItems(containerId) {
  try {
    // Make sure we have an initialized client
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return { success: false, message: 'Supabase client not initialized' };
    }
    
    const { data, error } = await window.supabaseClient
      .from('evidence_items')
      .select('*')
      .eq('container_id', containerId);
    
    if (error) {
      console.error('Error getting evidence items:', error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, items: data };
  } catch (error) {
    console.error('Error getting evidence items:', error.message);
    return { success: false, message: error.message };
  }
}
