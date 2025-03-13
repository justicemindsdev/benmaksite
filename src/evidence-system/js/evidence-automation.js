/**
 * Evidence Automation System
 * 
 * This script provides an automated interface for managing the evidence submission system.
 * It guides users through the process with clear prompts and instructions,
 * handling backend operations automatically.
 */

// Configuration object for the automation system
const EvidenceAutomation = {
  // State management
  state: {
    initialized: false,
    authenticated: false,
    currentStep: 'init',
    containers: [],
    currentContainer: null,
    evidenceItems: [],
    uploadQueue: [],
    processingUploads: false
  },

  // DOM elements cache
  elements: {},

  // Initialize the automation system
  async initialize() {
    if (this.state.initialized) return;

    console.log('Initializing Evidence Automation System...');
    
    // Create automation UI if it doesn't exist
    this.createAutomationUI();
    
    // Cache DOM elements
    this.cacheElements();
    
    // Initialize Supabase if not already initialized
    if (typeof window.supabaseClient === 'undefined') {
      if (typeof initializeSupabase === 'function') {
        initializeSupabase();
      } else {
        console.error('Supabase initialization function not found');
        this.showError('Supabase initialization function not found');
        return;
      }
    }
    
    // Check authentication status
    await this.checkAuthentication();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Mark as initialized
    this.state.initialized = true;
    
    // Start the automation flow
    this.startAutomationFlow();
    
    console.log('Evidence Automation System initialized');
  },

  // Create the automation UI
  createAutomationUI() {
    // Check if the automation UI already exists
    if (document.getElementById('automation-panel')) return;
    
    // Create the automation panel
    const panel = document.createElement('div');
    panel.id = 'automation-panel';
    panel.className = 'fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-blue-900 text-white p-4 shadow-lg z-50 border-t border-blue-700';
    panel.style.maxHeight = '80vh';
    panel.style.overflowY = 'auto';
    
    // Add panel content
    panel.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Evidence Automation System</h2>
        <div>
          <button id="automation-minimize" class="px-3 py-1 bg-blue-800 hover:bg-blue-700 rounded-lg mr-2">Minimize</button>
          <button id="automation-close" class="px-3 py-1 bg-red-800 hover:bg-red-700 rounded-lg">Close</button>
        </div>
      </div>
      
      <div id="automation-content" class="mb-4">
        <div id="automation-status" class="mb-4 p-3 bg-black bg-opacity-50 rounded-lg">
          <p>Initializing automation system...</p>
        </div>
        
        <div id="automation-steps" class="mb-4 grid grid-cols-5 gap-2">
          <div class="step active" data-step="init">Initialize</div>
          <div class="step" data-step="auth">Authenticate</div>
          <div class="step" data-step="container">Create Container</div>
          <div class="step" data-step="evidence">Add Evidence</div>
          <div class="step" data-step="submit">Submit</div>
        </div>
        
        <div id="automation-action-area" class="p-4 bg-black bg-opacity-30 rounded-lg">
          <div id="automation-prompt" class="mb-4">
            Please wait while the system initializes...
          </div>
          
          <div id="automation-inputs" class="mb-4">
            <!-- Dynamic inputs will be added here -->
          </div>
          
          <div id="automation-buttons" class="flex justify-end">
            <button id="automation-next" class="official-button px-5 py-2 rounded-full shine-effect">Next</button>
          </div>
        </div>
      </div>
      
      <div id="automation-log" class="mt-4 p-3 bg-black bg-opacity-50 rounded-lg max-h-32 overflow-y-auto text-sm">
        <div class="log-entry text-gray-400">System starting...</div>
      </div>
    `;
    
    // Add styles for the automation UI
    const style = document.createElement('style');
    style.textContent = `
      #automation-panel {
        transition: transform 0.3s ease-in-out;
      }
      
      #automation-panel.minimized {
        transform: translateY(calc(100% - 40px));
      }
      
      #automation-panel .step {
        padding: 8px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        text-align: center;
        position: relative;
        opacity: 0.6;
      }
      
      #automation-panel .step.active {
        background: rgba(59, 130, 246, 0.5);
        opacity: 1;
      }
      
      #automation-panel .step.completed {
        background: rgba(16, 185, 129, 0.5);
        opacity: 1;
      }
      
      #automation-panel .step.completed::after {
        content: "✓";
        position: absolute;
        top: 2px;
        right: 5px;
        font-size: 12px;
      }
      
      #automation-panel .log-entry {
        margin-bottom: 4px;
      }
      
      #automation-panel .log-entry.error {
        color: #f87171;
      }
      
      #automation-panel .log-entry.success {
        color: #34d399;
      }
      
      #automation-panel .log-entry.warning {
        color: #fbbf24;
      }
    `;
    
    // Add the panel and styles to the document
    document.head.appendChild(style);
    document.body.appendChild(panel);
  },

  // Cache DOM elements for faster access
  cacheElements() {
    this.elements = {
      panel: document.getElementById('automation-panel'),
      status: document.getElementById('automation-status'),
      steps: document.getElementById('automation-steps'),
      actionArea: document.getElementById('automation-action-area'),
      prompt: document.getElementById('automation-prompt'),
      inputs: document.getElementById('automation-inputs'),
      buttons: document.getElementById('automation-buttons'),
      nextButton: document.getElementById('automation-next'),
      log: document.getElementById('automation-log'),
      minimizeButton: document.getElementById('automation-minimize'),
      closeButton: document.getElementById('automation-close')
    };
  },

  // Set up event listeners
  setupEventListeners() {
    // Minimize button
    this.elements.minimizeButton.addEventListener('click', () => {
      this.elements.panel.classList.toggle('minimized');
      this.elements.minimizeButton.textContent = this.elements.panel.classList.contains('minimized') ? 'Expand' : 'Minimize';
    });
    
    // Close button
    this.elements.closeButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to close the automation system?')) {
        this.elements.panel.remove();
      }
    });
    
    // Next button
    this.elements.nextButton.addEventListener('click', () => {
      this.handleNextStep();
    });
  },

  // Check if the user is authenticated
  async checkAuthentication() {
    this.log('Checking authentication status...');
    
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      
      if (session) {
        this.state.authenticated = true;
        this.log('User is authenticated', 'success');
        return true;
      } else {
        this.state.authenticated = false;
        this.log('User is not authenticated', 'warning');
        return false;
      }
    } catch (error) {
      this.log('Error checking authentication: ' + error.message, 'error');
      this.state.authenticated = false;
      return false;
    }
  },

  // Start the automation flow
  startAutomationFlow() {
    this.log('Starting automation flow');
    
    // Set initial step
    this.setStep('init');
    
    // Update status
    this.updateStatus('System initialized and ready');
    
    // Check if user is authenticated
    if (this.state.authenticated) {
      this.log('User is already authenticated, proceeding to container creation');
      this.setStep('container');
    } else {
      this.log('Authentication required');
      this.setStep('auth');
    }
  },

  // Set the current step
  setStep(step) {
    // Update state
    this.state.currentStep = step;
    
    // Update step indicators
    const stepElements = this.elements.steps.querySelectorAll('.step');
    stepElements.forEach(el => {
      el.classList.remove('active');
      if (el.dataset.step === step) {
        el.classList.add('active');
      }
    });
    
    // Mark previous steps as completed
    const stepOrder = ['init', 'auth', 'container', 'evidence', 'submit'];
    const currentIndex = stepOrder.indexOf(step);
    
    stepElements.forEach(el => {
      const elIndex = stepOrder.indexOf(el.dataset.step);
      if (elIndex < currentIndex) {
        el.classList.add('completed');
      }
    });
    
    // Update UI for the current step
    this.updateUIForStep(step);
  },

  // Update UI for the current step
  updateUIForStep(step) {
    // Clear inputs
    this.elements.inputs.innerHTML = '';
    
    switch (step) {
      case 'init':
        this.elements.prompt.textContent = 'Initializing the system...';
        this.elements.nextButton.textContent = 'Next';
        break;
        
      case 'auth':
        this.elements.prompt.textContent = 'Please authenticate to continue';
        this.elements.inputs.innerHTML = `
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block mb-2">Email</label>
              <input type="email" id="auth-email" class="w-full p-3 rounded-lg bg-black bg-opacity-50 border border-blue-800 text-white" placeholder="Enter your email">
            </div>
            <div>
              <label class="block mb-2">Password</label>
              <input type="password" id="auth-password" class="w-full p-3 rounded-lg bg-black bg-opacity-50 border border-blue-800 text-white" placeholder="Enter your password">
            </div>
          </div>
        `;
        this.elements.nextButton.textContent = 'Login';
        break;
        
      case 'container':
        this.elements.prompt.textContent = 'Create an evidence container';
        this.elements.inputs.innerHTML = `
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block mb-2">Container Title</label>
              <input type="text" id="container-title" class="w-full p-3 rounded-lg bg-black bg-opacity-50 border border-blue-800 text-white" placeholder="Enter a title for this evidence container">
            </div>
            <div>
              <label class="block mb-2">Description</label>
              <textarea id="container-description" class="w-full p-3 rounded-lg bg-black bg-opacity-50 border border-blue-800 text-white" rows="3" placeholder="Enter a description for this evidence container"></textarea>
            </div>
          </div>
        `;
        this.elements.nextButton.textContent = 'Create Container';
        break;
        
      case 'evidence':
        this.elements.prompt.textContent = 'Add evidence to the container';
        this.elements.inputs.innerHTML = `
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block mb-2">Evidence Title</label>
              <input type="text" id="evidence-title" class="w-full p-3 rounded-lg bg-black bg-opacity-50 border border-blue-800 text-white" placeholder="Enter a title for this evidence">
            </div>
            <div>
              <label class="block mb-2">Description</label>
              <textarea id="evidence-description" class="w-full p-3 rounded-lg bg-black bg-opacity-50 border border-blue-800 text-white" rows="3" placeholder="Enter a description for this evidence"></textarea>
            </div>
            <div>
              <label class="block mb-2">Upload Files</label>
              <div class="border border-dashed border-blue-800 rounded-lg p-4 text-center hover:bg-opacity-30 cursor-pointer" id="evidence-upload-zone">
                <div class="text-2xl mb-2">📁</div>
                <div class="text-sm">Drop files here or click to upload</div>
                <input type="file" id="evidence-file-input" class="hidden" multiple>
              </div>
            </div>
            <div id="evidence-file-preview" class="grid grid-cols-3 gap-3 mt-2"></div>
          </div>
          
          <div class="mt-4 flex justify-between">
            <button id="add-more-evidence" class="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg">Add Another Evidence Item</button>
            <button id="finish-evidence" class="px-4 py-2 bg-green-800 hover:bg-green-700 rounded-lg">Finish Adding Evidence</button>
          </div>
        `;
        
        // Set up file upload zone
        setTimeout(() => {
          const uploadZone = document.getElementById('evidence-upload-zone');
          const fileInput = document.getElementById('evidence-file-input');
          const filePreview = document.getElementById('evidence-file-preview');
          
          if (uploadZone && fileInput) {
            // Click to upload
            uploadZone.addEventListener('click', () => {
              fileInput.click();
            });
            
            // File selection
            fileInput.addEventListener('change', () => {
              this.handleFileSelection(fileInput.files, filePreview);
            });
            
            // Drag and drop
            uploadZone.addEventListener('dragover', (e) => {
              e.preventDefault();
              uploadZone.classList.add('bg-blue-900');
              uploadZone.classList.add('bg-opacity-30');
            });
            
            uploadZone.addEventListener('dragleave', () => {
              uploadZone.classList.remove('bg-blue-900');
              uploadZone.classList.remove('bg-opacity-30');
            });
            
            uploadZone.addEventListener('drop', (e) => {
              e.preventDefault();
              uploadZone.classList.remove('bg-blue-900');
              uploadZone.classList.remove('bg-opacity-30');
              
              if (e.dataTransfer.files.length) {
                this.handleFileSelection(e.dataTransfer.files, filePreview);
              }
            });
          }
          
          // Set up add more evidence button
          const addMoreButton = document.getElementById('add-more-evidence');
          if (addMoreButton) {
            addMoreButton.addEventListener('click', () => {
              this.saveCurrentEvidence();
              this.clearEvidenceInputs();
            });
          }
          
          // Set up finish evidence button
          const finishButton = document.getElementById('finish-evidence');
          if (finishButton) {
            finishButton.addEventListener('click', () => {
              this.saveCurrentEvidence();
              this.setStep('submit');
            });
          }
        }, 100);
        
        this.elements.nextButton.textContent = 'Next';
        break;
        
      case 'submit':
        this.elements.prompt.textContent = 'Review and submit your evidence';
        
        // Generate summary of container and evidence
        let summary = `<div class="p-4 bg-black bg-opacity-50 rounded-lg mb-4">
          <h3 class="text-lg font-semibold mb-2">${this.state.currentContainer?.title || 'Untitled Container'}</h3>
          <p class="text-sm text-gray-300 mb-4">${this.state.currentContainer?.description || 'No description'}</p>
          
          <h4 class="text-md font-semibold mb-2">Evidence Items (${this.state.evidenceItems.length})</h4>
          <ul class="list-disc pl-5 mb-4">`;
          
        this.state.evidenceItems.forEach((item, index) => {
          summary += `<li class="mb-2">
            <div class="font-semibold">${item.title || `Evidence ${index + 1}`}</div>
            <div class="text-sm text-gray-300">${item.description || 'No description'}</div>
            <div class="text-xs text-gray-400">${item.files?.length || 0} file(s) attached</div>
          </li>`;
        });
        
        summary += `</ul>
          
          <div class="mt-4 p-3 border border-opacity-10 border-white rounded-lg">
            <label class="custom-checkbox">
              <span class="text-sm">I confirm that all information is accurate and complete</span>
              <input type="checkbox" id="submit-confirm-checkbox">
              <span class="checkmark"></span>
            </label>
          </div>
        </div>`;
        
        this.elements.inputs.innerHTML = summary;
        this.elements.nextButton.textContent = 'Submit Evidence';
        break;
    }
  },

  // Handle next step button click
  async handleNextStep() {
    switch (this.state.currentStep) {
      case 'init':
        this.setStep('auth');
        break;
        
      case 'auth':
        await this.handleAuthentication();
        break;
        
      case 'container':
        await this.handleContainerCreation();
        break;
        
      case 'evidence':
        this.saveCurrentEvidence();
        this.setStep('submit');
        break;
        
      case 'submit':
        await this.handleSubmission();
        break;
    }
  },

  // Handle authentication
  async handleAuthentication() {
    const email = document.getElementById('auth-email')?.value;
    const password = document.getElementById('auth-password')?.value;
    
    if (!email || !password) {
      this.showError('Please enter both email and password');
      return;
    }
    
    this.log('Attempting to authenticate...');
    this.updateStatus('Authenticating...');
    this.elements.nextButton.disabled = true;
    
    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        this.state.authenticated = true;
        this.log('Authentication successful', 'success');
        this.updateStatus('Authentication successful');
        this.setStep('container');
      } else {
        this.showError('Authentication failed: ' + result.message);
        this.log('Authentication failed: ' + result.message, 'error');
      }
    } catch (error) {
      this.showError('Authentication error: ' + error.message);
      this.log('Authentication error: ' + error.message, 'error');
    } finally {
      this.elements.nextButton.disabled = false;
    }
  },

  // Handle container creation
  async handleContainerCreation() {
    const title = document.getElementById('container-title')?.value;
    const description = document.getElementById('container-description')?.value;
    
    if (!title) {
      this.showError('Please enter a container title');
      return;
    }
    
    this.log('Creating evidence container...');
    this.updateStatus('Creating container...');
    this.elements.nextButton.disabled = true;
    
    try {
      const result = await createEvidenceContainer(title, description || '');
      
      if (result.success) {
        this.state.currentContainer = result.container;
        this.state.containers.push(result.container);
        
        this.log('Container created successfully', 'success');
        this.updateStatus('Container created successfully');
        this.setStep('evidence');
      } else {
        this.showError('Failed to create container: ' + result.message);
        this.log('Failed to create container: ' + result.message, 'error');
      }
    } catch (error) {
      this.showError('Error creating container: ' + error.message);
      this.log('Error creating container: ' + error.message, 'error');
    } finally {
      this.elements.nextButton.disabled = false;
    }
  },

  // Handle file selection
  handleFileSelection(files, previewContainer) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Add to upload queue
      this.state.uploadQueue.push(file);
      
      // Create preview
      this.createFilePreview(file, previewContainer);
    }
    
    // Process upload queue if not already processing
