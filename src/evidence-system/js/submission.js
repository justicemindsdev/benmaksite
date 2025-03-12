/**
 * Submission JavaScript file for the Evidence Submission System
 * Handles the evidence submission process
 * Now integrated with Supabase
 */

/**
 * Handle evidence submission
 */
async function handleEvidenceSubmission() {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Show authentication modal if not logged in
    document.getElementById('auth-modal').style.display = 'flex';
    return;
  }
  
  if (containerCount === 0) {
    alert('Please add at least one evidence container before submitting.');
    return;
  }
  
  if (sealedCount === 0) {
    alert('Please seal at least one admission before submitting.');
    return;
  }
  
  // Generate a submission ID
  const submissionId = `JM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  // Get current timestamp
  const timestamp = getCurrentTimestamp();
  
  // Get the Supabase container ID from the first sealed container
  const sealedContainer = document.querySelector('.sealed-box');
  const supabaseContainerId = sealedContainer ? sealedContainer.getAttribute('data-supabase-id') : null;
  
  if (!supabaseContainerId) {
    console.error('No Supabase container ID found');
    alert('Error submitting evidence. Please try again.');
    return;
  }
  
  // Submit to Supabase
  try {
    const result = await submitEvidence(supabaseContainerId);
    
    if (!result.success) {
      console.error('Failed to submit evidence to Supabase:', result.message);
      alert('Error submitting evidence. Please try again.');
      return;
    }
    
    console.log('Evidence submitted to Supabase:', result.submission);
    
    // Add to submission log
    addSubmissionToLog(submissionId, timestamp, result.submission.id);
    
    // Create shareable link
    const shareableLink = `https://justiceminds.org/evidence/${submissionId}`;
    
    // Display the shareable container
    displayShareContainer(submissionId, timestamp, shareableLink);
  } catch (error) {
    console.error('Error submitting evidence:', error);
    alert('Error submitting evidence. Please try again.');
  }
}

/**
 * Add submission to log
 * @param {string} submissionId - The submission ID
 * @param {string} timestamp - The timestamp
 * @param {number} supabaseId - The Supabase submission ID
 */
function addSubmissionToLog(submissionId, timestamp, supabaseId) {
  const submissionLog = document.getElementById('submission-log');
  const logEntries = document.getElementById('log-entries');
  submissionLog.classList.remove('hidden');
  
  const logEntry = document.createElement('div');
  logEntry.className = 'py-3 px-4 border-b border-opacity-10 border-white flex justify-between items-center hover:bg-white hover:bg-opacity-5 transition-colors rounded-lg shine-effect';
  logEntry.setAttribute('data-supabase-id', supabaseId);
  logEntry.innerHTML = `
    <div>
      <div class="font-semibold text-lg">${submissionId}</div>
      <div class="text-sm text-gray-400 font-mono">${timestamp}</div>
      <div class="text-sm mt-1">Contains ${sealedCount} sealed admission(s)</div>
    </div>
    <a href="#" class="text-blue-400 hover:underline official-button px-4 py-2 rounded-full shine-effect">View Submission</a>
  `;
  
  // Add click handler to view submission details
  const viewButton = logEntry.querySelector('a');
  viewButton.addEventListener('click', (e) => {
    e.preventDefault();
    viewSubmissionDetails(supabaseId);
  });
  
  logEntries.appendChild(logEntry);
}

/**
 * View submission details
 * @param {number} supabaseId - The Supabase submission ID
 */
async function viewSubmissionDetails(supabaseId) {
  // This would typically fetch the submission details from Supabase
  // For now, we'll just show an alert
  alert(`Viewing submission details for ID: ${supabaseId}`);
}

/**
 * Display the share container
 * @param {string} submissionId - The submission ID
 * @param {string} timestamp - The timestamp
 * @param {string} shareableLink - The shareable link
 */
function displayShareContainer(submissionId, timestamp, shareableLink) {
  const shareContainer = document.getElementById('share-container');
  shareContainer.style.display = 'block';
  
  // Scroll to the share container
  shareContainer.scrollIntoView({ behavior: 'smooth' });
  
  // Update the container with submission details
  document.getElementById('submission-id').textContent = submissionId;
  document.getElementById('submission-date').textContent = timestamp;
  document.getElementById('share-link').value = shareableLink;
  
  // Set up view details button
  document.getElementById('view-details').addEventListener('click', () => {
    // This would typically navigate to a details page
    // For now, we'll just show the submission log
    document.getElementById('submission-log').scrollIntoView({ behavior: 'smooth' });
  });
}

/**
 * Load user's submissions from Supabase
 */
async function loadUserSubmissions() {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return;
  }
  
  try {
    // Get the user's profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting profile:', profileError.message);
      return;
    }
    
    // Get the user's submissions
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        id,
        submission_date,
        status,
        evidence_containers (
          id,
          title,
          description
        )
      `)
      .eq('user_id', profiles.id)
      .order('submission_date', { ascending: false });
    
    if (error) {
      console.error('Error getting submissions:', error.message);
      return;
    }
    
    // Display the submissions
    if (submissions.length > 0) {
      const submissionLog = document.getElementById('submission-log');
      const logEntries = document.getElementById('log-entries');
      submissionLog.classList.remove('hidden');
      
      // Clear existing entries
      logEntries.innerHTML = '';
      
      // Add entries for each submission
      submissions.forEach(submission => {
        const submissionId = `JM-${submission.id}`;
        const timestamp = new Date(submission.submission_date).toLocaleString('en-GB', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour12: false
        });
        
        const logEntry = document.createElement('div');
        logEntry.className = 'py-3 px-4 border-b border-opacity-10 border-white flex justify-between items-center hover:bg-white hover:bg-opacity-5 transition-colors rounded-lg shine-effect';
        logEntry.setAttribute('data-supabase-id', submission.id);
        logEntry.innerHTML = `
          <div>
            <div class="font-semibold text-lg">${submissionId}</div>
            <div class="text-sm text-gray-400 font-mono">${timestamp}</div>
            <div class="text-sm mt-1">Status: ${submission.status}</div>
          </div>
          <a href="#" class="text-blue-400 hover:underline official-button px-4 py-2 rounded-full shine-effect">View Submission</a>
        `;
        
        // Add click handler to view submission details
        const viewButton = logEntry.querySelector('a');
        viewButton.addEventListener('click', (e) => {
          e.preventDefault();
          viewSubmissionDetails(submission.id);
        });
        
        logEntries.appendChild(logEntry);
      });
    }
  } catch (error) {
    console.error('Error loading submissions:', error);
  }
}

// Load user's submissions when the page loads
document.addEventListener('DOMContentLoaded', function() {
  loadUserSubmissions();
});
