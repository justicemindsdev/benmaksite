/**
 * Containers JavaScript file for the Evidence Submission System
 * Handles evidence container management
 */

/**
 * Add a new evidence container
 * This function now integrates with Supabase
 */
async function addContainer() {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Show authentication modal if not logged in
    document.getElementById('auth-modal').style.display = 'flex';
    return;
  }
  
  containerCount++;
  
  const containerList = document.getElementById('containers');
  const timestamp = getCurrentTimestamp();
  const containerId = `container-${containerCount}-${Math.random().toString(36).substring(2, 10)}`;
  
  // Initialize evidence status tracking
  containerEvidenceStatus[containerId] = [];
  
  // Create a new container with admission and evidence sections
  const newContainer = document.createElement('div');
  newContainer.className = 'mb-8 grid grid-cols-1 md:grid-cols-2 gap-4';
  
  // Admission section
  const admissionSection = document.createElement('div');
  admissionSection.className = 'container-box p-6 relative layer-effect shine-effect reflective-edge';
  admissionSection.setAttribute('data-container-id', containerId);
  admissionSection.innerHTML = `
    <h2 class="text-xl font-semibold tracking-wider mb-3">ADMISSION ${containerCount}</h2>
    <div class="my-3 text-sm text-gray-400 font-mono">${timestamp}</div>
    <div class="admission-content my-5">
      <textarea class="admission-editable w-full p-3 text-white rounded-xl" rows="4" placeholder="Enter admission here..."></textarea>
    </div>
    <button class="seal-admission official-button px-5 py-2 rounded-full shine-effect">
      SEAL ADMISSION
    </button>
  `;
  
  // Evidence section
  const evidenceSection = document.createElement('div');
  evidenceSection.className = 'container-box p-6 relative layer-effect shine-effect reflective-edge';
  evidenceSection.setAttribute('data-container-id', containerId);
  evidenceSection.innerHTML = `
    <h2 class="text-xl font-semibold tracking-wider mb-3">EVIDENCE SEGMENT ${containerCount}</h2>
    <div class="evidence-list mt-5"></div>
    <button class="add-evidence mt-5 official-button px-5 py-2 rounded-full shine-effect">
      ADD EVIDENCE
    </button>
  `;
  
  // Add sections to container
  newContainer.appendChild(admissionSection);
  newContainer.appendChild(evidenceSection);
  
  // Add container to the list
  containerList.appendChild(newContainer);
  
  // Initialize view status for this container
  viewStatus[containerId] = false;
  
  // Set up event handlers for the new container
  setupContainerEventHandlers(newContainer, containerId);
  
  // Create container in Supabase
  try {
    const title = `Evidence Container ${containerCount}`;
    const description = "Created on " + timestamp;
    
    const result = await createEvidenceContainer(title, description);
    
    if (result.success) {
      // Store the Supabase container ID in the DOM element
      admissionSection.setAttribute('data-supabase-id', result.container.id);
      evidenceSection.setAttribute('data-supabase-id', result.container.id);
      console.log('Container created in Supabase:', result.container);
    } else {
      console.error('Failed to create container in Supabase:', result.message);
    }
  } catch (error) {
    console.error('Error creating container in Supabase:', error);
  }
}

/**
 * Set up event handlers for a container
 * @param {HTMLElement} container - The container element
 * @param {string} containerId - The container ID
 */
function setupContainerEventHandlers(container, containerId) {
  const addEvidenceButton = container.querySelector('.add-evidence');
  const evidenceList = container.querySelector('.evidence-list');
  const admissionEditable = container.querySelector('.admission-editable');
  const sealButton = container.querySelector('.seal-admission');
  
  // Seal admission button
  sealButton.addEventListener('click', function() {
    const admissionSection = container.querySelector('.container-box[data-container-id="' + containerId + '"]');
    
    // Make content non-editable
    admissionEditable.readOnly = true;
    admissionEditable.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    admissionEditable.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    
    // Add sealed effect
    admissionSection.classList.add('sealed-box');
    
    // Add the glowing seal badge
    const sealBadge = document.createElement('div');
    sealBadge.className = 'seal-badge';
    sealBadge.textContent = 'SEALED';
    admissionSection.appendChild(sealBadge);
    
    // Disable the seal button
    sealButton.disabled = true;
    sealButton.textContent = 'ADMISSION SEALED';
    sealButton.classList.add('opacity-50');
    
    // Disable the add evidence button
    addEvidenceButton.disabled = true;
    addEvidenceButton.classList.add('opacity-50');
    
    // Increment sealed count and update TOC
    sealedCount++;
    updateTOC();
  });
  
  // Add evidence toggle button
  addEvidenceButton.addEventListener('click', () => {
    addEvidenceToggle(containerId, evidenceList);
  });
}

/**
 * Add an evidence toggle to a container
 * @param {string} containerId - The container ID
 * @param {HTMLElement} evidenceList - The evidence list element
 */
function addEvidenceToggle(containerId, evidenceList) {
  const timestamp = getCurrentTimestamp();
  const toggleId = `evidence-${containerId}-${Math.random().toString(36).substring(2, 8)}`;
  
  // Create new evidence toggle
  const evidenceToggle = document.createElement('div');
  evidenceToggle.className = 'mb-5 shine-effect';
  evidenceToggle.setAttribute('data-toggle-id', toggleId);
  evidenceToggle.innerHTML = `
    <div class="toggle-header p-3 flex items-center justify-between shine-effect reflective-edge">
      <div class="flex items-center">
        <span class="arrow mr-2">▶</span>
        <input type="text" class="toggle-title bg-transparent border-none outline-none" value="NEW EVIDENCE" />
      </div>
      <div class="text-sm text-gray-400 font-mono">${timestamp}</div>
    </div>
    <div class="toggle-content">
      <div class="p-4 border border-opacity-20 border-white border-t-0 rounded-b-lg shine-effect reflective-edge" style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(7, 16, 38, 0.6));">
        <textarea class="evidence-editable w-full p-3 text-white rounded-xl" rows="4" placeholder="Enter evidence details here..."></textarea>
        
        <div class="mt-5">
          <div class="text-sm font-semibold">Add Link</div>
          <div class="flex mt-2">
            <input type="text" class="link-input w-full p-3 text-white rounded-l-full" placeholder="Paste URL here">
            <button class="add-link official-button px-4 py-2 rounded-r-full shine-effect">ADD</button>
          </div>
        </div>
        
        <div class="mt-5">
          <div class="text-sm font-semibold">Upload File</div>
          <div class="border border-dashed border-opacity-20 border-white rounded-xl p-4 text-center mt-2 hover:bg-opacity-30 cursor-pointer shine-effect reflective-edge" style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(7, 16, 38, 0.7));">
            <div class="text-2xl mb-2">📁</div>
            <div class="text-sm">Drop files here or click to upload</div>
            <input type="file" class="file-input hidden" multiple>
          </div>
        </div>
        
        <div class="file-preview-container grid grid-cols-3 gap-3 mt-4"></div>
        <div class="link-preview-container mt-4"></div>
        
        <div class="mt-6 p-3 border border-opacity-10 border-white rounded-xl shine-effect reflective-edge" style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(7, 16, 38, 0.7));">
          <label class="custom-checkbox">
            <span class="text-sm">I confirm I have reviewed this evidence</span>
            <input type="checkbox" class="evidence-confirm-checkbox">
            <span class="checkmark"></span>
          </label>
        </div>
      </div>
    </div>
  `;
  
  evidenceList.appendChild(evidenceToggle);
  
  // Track this evidence toggle in the container status
  containerEvidenceStatus[containerId].push({
    id: toggleId,
    viewed: false
  });
  
  setupEvidenceToggleHandlers(evidenceToggle, toggleId, containerId);
}

/**
 * Set up event handlers for an evidence toggle
 * @param {HTMLElement} evidenceToggle - The evidence toggle element
 * @param {string} toggleId - The toggle ID
 * @param {string} containerId - The container ID
 */
function setupEvidenceToggleHandlers(evidenceToggle, toggleId, containerId) {
  const header = evidenceToggle.querySelector('.toggle-header');
  const content = evidenceToggle.querySelector('.toggle-content');
  const arrow = evidenceToggle.querySelector('.arrow');
  const uploadZone = evidenceToggle.querySelector('.border-dashed');
  const fileInput = evidenceToggle.querySelector('.file-input');
  const checkbox = evidenceToggle.querySelector('.evidence-confirm-checkbox');
  
  // Toggle header click
  header.addEventListener('click', function(e) {
    // Don't toggle if clicked on input
    if (e.target.tagName.toLowerCase() === 'input') return;
    
    const isOpen = content.classList.contains('open');
    arrow.textContent = isOpen ? '▶' : '▼';
    content.classList.toggle('open');
  });
  
  // Handle checkbox for confirming evidence was viewed
  checkbox.addEventListener('change', function() {
    // Find this toggle in the container evidence status
    const toggleIndex = containerEvidenceStatus[containerId].findIndex(item => item.id === toggleId);
    if (toggleIndex !== -1) {
      containerEvidenceStatus[containerId][toggleIndex].viewed = this.checked;
      // Check if all evidence in this container has been viewed
      checkContainerViewStatus(containerId);
    }
  });
  
  // Set up file upload via click
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Set up file upload via drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('bg-opacity-40');
    uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.3)';
  });
  
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('bg-opacity-40');
    uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.2)';
  });
  
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('bg-opacity-40');
    uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files, evidenceToggle.querySelector('.file-preview-container'));
    }
  });
  
  // Handle file selection
  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files, evidenceToggle.querySelector('.file-preview-container'));
  });
  
  // Set up link preview
  const linkInput = evidenceToggle.querySelector('.link-input');
  const addLinkButton = evidenceToggle.querySelector('.add-link');
  const linkPreviewContainer = evidenceToggle.querySelector('.link-preview-container');
  
  addLinkButton.addEventListener('click', () => {
    const url = linkInput.value.trim();
    if (url) {
      addLinkPreview(url, linkPreviewContainer);
      linkInput.value = '';
    }
  });
  
  // Auto-open the toggle
  arrow.textContent = '▼';
  content.classList.add('open');
  
  // If the admission is sealed, only allow viewing, not editing
  const container = evidenceToggle.closest('.grid');
  if (container.querySelector('.sealed-box')) {
    disableEvidenceEditing(evidenceToggle);
  }
}

/**
 * Disable editing for an evidence toggle
 * @param {HTMLElement} evidenceToggle - The evidence toggle element
 */
function disableEvidenceEditing(evidenceToggle) {
  const evidenceEditable = evidenceToggle.querySelector('.evidence-editable');
  const linkInput = evidenceToggle.querySelector('.link-input');
  const addLinkButton = evidenceToggle.querySelector('.add-link');
  const fileInput = evidenceToggle.querySelector('.file-input');
  const uploadZone = evidenceToggle.querySelector('.border-dashed');
  const titleInput = evidenceToggle.querySelector('.toggle-title');
  
  // Read-only, not disabled, to allow viewing
  evidenceEditable.readOnly = true;
  evidenceEditable.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  evidenceEditable.style.border = '1px solid rgba(255, 255, 255, 0.1)';
  
  // Disable adding new content
  linkInput.disabled = true;
  addLinkButton.disabled = true;
  addLinkButton.classList.add('opacity-50');
  
  fileInput.disabled = true;
  uploadZone.classList.add('opacity-50');
  uploadZone.style.cursor = 'not-allowed';
  
  titleInput.readOnly = true;
}

/**
 * Update the Table of Contents
 */
function updateTOC() {
  const tocContainer = document.getElementById('toc-container');
  const tocItems = document.getElementById('toc-items');
  
  // Show TOC if there are sealed items
  if (sealedCount > 0) {
    tocContainer.classList.remove('hidden');
    
    // Clear existing items
    tocItems.innerHTML = '';
    
    // Add TOC items for each sealed container
    document.querySelectorAll('.sealed-box').forEach((box, index) => {
      const containerTitle = box.querySelector('h2').textContent;
      const containerId = box.getAttribute('data-container-id');
      
      // Check if all evidence toggles in this container have been viewed
      const allEvidenceViewed = containerEvidenceStatus[containerId] && 
                               containerEvidenceStatus[containerId].every(status => status.viewed);
      
      const tocItem = document.createElement('div');
      tocItem.className = 'py-3 border-b border-opacity-20 border-white flex justify-between items-center cursor-pointer hover:bg-white hover:bg-opacity-5 px-4 transition-colors rounded-lg shine-effect';
      tocItem.innerHTML = `
        <div class="font-semibold">${containerTitle}</div>
        <div class="flex items-center">
          <span class="inline-block w-4 h-4 rounded-full mr-2 ${allEvidenceViewed ? 'bg-green-600' : 'bg-blue-600'} shadow-lg"></span>
          <span>${allEvidenceViewed ? 'Viewed' : 'Not Viewed'}</span>
        </div>
      `;
      
      // Add click handler to jump to the evidence
      tocItem.addEventListener('click', () => {
        box.scrollIntoView({ behavior: 'smooth' });
      });
      
      tocItems.appendChild(tocItem);
    });
  }
}

/**
 * Check if all evidence in a container has been viewed
 * @param {string} containerId - The container ID
 * @returns {boolean} Whether all evidence has been viewed
 */
function checkContainerViewStatus(containerId) {
  if (!containerEvidenceStatus[containerId]) return false;
  
  const allViewed = containerEvidenceStatus[containerId].every(item => item.viewed);
  viewStatus[containerId] = allViewed;
  
  // Update TOC to reflect new status
  updateTOC();
  
  return allViewed;
}
