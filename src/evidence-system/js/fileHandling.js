/**
 * File Handling JavaScript file for the Evidence Submission System
 * Handles file uploads and previews
 * Now integrated with Supabase Storage
 */

/**
 * Handle files for upload
 * @param {FileList} files - The files to handle
 * @param {HTMLElement} previewContainer - The container for file previews
 */
async function handleFiles(files, previewContainer) {
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Show authentication modal if not logged in
    document.getElementById('auth-modal').style.display = 'flex';
    return;
  }
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Create a preview element
    const preview = document.createElement('div');
    preview.className = 'file-preview p-2 border border-opacity-10 border-white rounded-lg shine-effect reflective-edge';
    preview.style.background = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(7, 16, 38, 0.7))';
    
    // Show loading state
    preview.innerHTML = `
      <div class="text-center p-4">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
        <div class="mt-2 text-sm">Uploading...</div>
      </div>
    `;
    
    previewContainer.appendChild(preview);
    
    // Upload to Supabase Storage
    try {
      const result = await uploadFile(file, 'evidence');
      
      if (result.success) {
        // Update preview with file info and thumbnail
        updateFilePreview(preview, file, result.url);
      } else {
        // Show error in preview
        preview.innerHTML = `
          <div class="text-center p-4">
            <div class="text-red-500 text-2xl">❌</div>
            <div class="mt-2 text-sm">Upload failed</div>
            <div class="mt-1 text-xs text-red-400">${result.message}</div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Show error in preview
      preview.innerHTML = `
        <div class="text-center p-4">
          <div class="text-red-500 text-2xl">❌</div>
          <div class="mt-2 text-sm">Upload failed</div>
          <div class="mt-1 text-xs text-red-400">${error.message}</div>
        </div>
      `;
    }
  }
}

/**
 * Update file preview with file info and thumbnail
 * @param {HTMLElement} preview - The preview element
 * @param {File} file - The file
 * @param {string} url - The URL to the uploaded file
 */
function updateFilePreview(preview, file, url) {
  const fileType = file.type.split('/')[0];
  const fileSize = formatFileSize(file.size);
  
  let previewContent = '';
  
  // Create appropriate preview based on file type
  if (fileType === 'image') {
    previewContent = `
      <div class="relative">
        <img src="${url}" alt="${file.name}" class="w-full h-32 object-cover rounded-lg">
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-xs p-1 truncate">
          ${file.name}
        </div>
      </div>
    `;
  } else if (fileType === 'video') {
    previewContent = `
      <div class="relative">
        <div class="w-full h-32 flex items-center justify-center bg-black rounded-lg">
          <div class="text-3xl">🎬</div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-xs p-1 truncate">
          ${file.name}
        </div>
      </div>
    `;
  } else if (fileType === 'audio') {
    previewContent = `
      <div class="relative">
        <div class="w-full h-32 flex items-center justify-center bg-black rounded-lg">
          <div class="text-3xl">🎵</div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-xs p-1 truncate">
          ${file.name}
        </div>
      </div>
    `;
  } else {
    // Generic file icon for other types
    previewContent = `
      <div class="relative">
        <div class="w-full h-32 flex items-center justify-center bg-black rounded-lg">
          <div class="text-3xl">📄</div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-xs p-1 truncate">
          ${file.name}
        </div>
      </div>
    `;
  }
  
  // Add file info and controls
  previewContent += `
    <div class="mt-2 text-xs">
      <div class="flex justify-between">
        <span>${fileType.toUpperCase()}</span>
        <span>${fileSize}</span>
      </div>
      <div class="flex justify-between mt-2">
        <button class="preview-file text-blue-400 hover:underline text-xs" data-url="${url}">Preview</button>
        <button class="remove-file text-red-400 hover:underline text-xs" data-url="${url}">Remove</button>
      </div>
    </div>
  `;
  
  preview.innerHTML = previewContent;
  
  // Add event listeners for preview and remove buttons
  const previewButton = preview.querySelector('.preview-file');
  const removeButton = preview.querySelector('.remove-file');
  
  previewButton.addEventListener('click', () => {
    previewFile(url, file.name, file.type);
  });
  
  removeButton.addEventListener('click', async () => {
    // Remove from Supabase Storage
    try {
      const filePath = url.split('/').pop();
      const { error } = await supabase.storage
        .from('evidence')
        .remove([filePath]);
      
      if (error) {
        console.error('Error removing file from storage:', error.message);
      }
    } catch (error) {
      console.error('Error removing file:', error);
    }
    
    // Remove preview element
    preview.remove();
  });
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} The formatted file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}

/**
 * Preview a file in a modal
 * @param {string} url - The URL to the file
 * @param {string} fileName - The file name
 * @param {string} fileType - The file type
 */
function previewFile(url, fileName, fileType) {
  const modal = document.getElementById('preview-modal');
  const modalContent = document.getElementById('modal-content-container');
  
  // Clear previous content
  modalContent.innerHTML = '';
  
  // Add file name header
  const header = document.createElement('div');
  header.className = 'text-xl font-semibold mb-4 p-4 border-b border-opacity-20 border-white';
  header.textContent = fileName;
  modalContent.appendChild(header);
  
  // Create appropriate preview based on file type
  const contentType = fileType.split('/')[0];
  
  if (contentType === 'image') {
    const img = document.createElement('img');
    img.src = url;
    img.alt = fileName;
    img.className = 'max-w-full max-h-[70vh] mx-auto';
    modalContent.appendChild(img);
  } else if (contentType === 'video') {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.className = 'max-w-full max-h-[70vh] mx-auto';
    modalContent.appendChild(video);
  } else if (contentType === 'audio') {
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    audio.className = 'w-full mt-4';
    modalContent.appendChild(audio);
  } else {
    // For other file types, show a download link
    const downloadContainer = document.createElement('div');
    downloadContainer.className = 'text-center p-8';
    downloadContainer.innerHTML = `
      <div class="text-6xl mb-4">📄</div>
      <p class="mb-4">This file type cannot be previewed directly.</p>
      <a href="${url}" download="${fileName}" class="official-button px-6 py-3 rounded-full inline-block">Download File</a>
    `;
    modalContent.appendChild(downloadContainer);
  }
  
  // Show the modal
  modal.style.display = 'flex';
  
  // Set up close button
  const closeButton = document.getElementById('close-modal');
  closeButton.onclick = function() {
    modal.style.display = 'none';
  };
  
  // Close modal when clicking outside the content
  modal.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

/**
 * Add a link preview
 * @param {string} url - The URL to preview
 * @param {HTMLElement} previewContainer - The container for link previews
 */
function addLinkPreview(url, previewContainer) {
  // Create a preview element
  const preview = document.createElement('div');
  preview.className = 'link-preview p-3 mb-3 border border-opacity-10 border-white rounded-lg flex items-center justify-between shine-effect reflective-edge';
  preview.style.background = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(7, 16, 38, 0.7))';
  
  // Add link info and controls
  preview.innerHTML = `
    <div class="flex items-center">
      <div class="text-2xl mr-3">🔗</div>
      <div class="truncate max-w-xs">
        <a href="${url}" target="_blank" class="text-blue-400 hover:underline">${url}</a>
      </div>
    </div>
    <div>
      <button class="remove-link text-red-400 hover:underline text-xs">Remove</button>
    </div>
  `;
  
  previewContainer.appendChild(preview);
  
  // Add event listener for remove button
  const removeButton = preview.querySelector('.remove-link');
  removeButton.addEventListener('click', () => {
    preview.remove();
  });
}
