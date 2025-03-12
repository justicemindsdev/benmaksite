/**
 * Chat Token Manager
 * A utility to help manage large conversations with AI assistants by breaking them into manageable chunks
 * and providing tools to work around token limits.
 */

class ChatTokenManager {
  constructor(options = {}) {
    this.options = {
      maxTokensPerChunk: 8000,
      storageType: 'localStorage', // 'localStorage', 'file', or 'supabase'
      supabaseClient: null,
      ...options
    };
    
    this.conversations = {};
    this.activeConversationId = null;
    
    // Load existing conversations from storage
    this.loadConversations();
  }
  
  /**
   * Create a new conversation
   * @param {string} title - Conversation title
   * @returns {string} - Conversation ID
   */
  createConversation(title) {
    const id = 'conv_' + Date.now();
    this.conversations[id] = {
      id,
      title,
      chunks: [],
      summary: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.activeConversationId = id;
    this.saveConversations();
    return id;
  }
  
  /**
   * Set the active conversation
   * @param {string} id - Conversation ID
   */
  setActiveConversation(id) {
    if (!this.conversations[id]) {
      throw new Error(`Conversation with ID ${id} not found`);
    }
    this.activeConversationId = id;
  }
  
  /**
   * Add a message to the active conversation
   * @param {Object} message - Message object with role and content
   */
  addMessage(message) {
    if (!this.activeConversationId) {
      throw new Error('No active conversation');
    }
    
    const conversation = this.conversations[this.activeConversationId];
    
    // If no chunks exist or the last chunk is too large, create a new chunk
    if (conversation.chunks.length === 0 || this.estimateTokens(JSON.stringify(conversation.chunks[conversation.chunks.length - 1])) > this.options.maxTokensPerChunk) {
      conversation.chunks.push([]);
    }
    
    // Add message to the last chunk
    const lastChunkIndex = conversation.chunks.length - 1;
    conversation.chunks[lastChunkIndex].push(message);
    
    // Update conversation
    conversation.updatedAt = new Date().toISOString();
    this.saveConversations();
  }
  
  /**
   * Get messages from the active conversation
   * @param {Object} options - Options for retrieving messages
   * @param {number} options.limit - Maximum number of messages to retrieve
   * @param {boolean} options.includeSummary - Whether to include the summary
   * @returns {Array} - Array of messages
   */
  getMessages(options = {}) {
    if (!this.activeConversationId) {
      throw new Error('No active conversation');
    }
    
    const conversation = this.conversations[this.activeConversationId];
    const { limit = 100, includeSummary = true } = options;
    
    // If there are no chunks, return an empty array
    if (conversation.chunks.length === 0) {
      return [];
    }
    
    // Get the last chunk
    const lastChunk = conversation.chunks[conversation.chunks.length - 1];
    
    // If includeSummary is true and there's a summary, add it as a system message
    let messages = [];
    if (includeSummary && conversation.summary && conversation.chunks.length > 1) {
      messages.push({
        role: 'system',
        content: `Previous conversation summary: ${conversation.summary}`
      });
    }
    
    // Add messages from the last chunk, limited by the limit option
    messages = [...messages, ...lastChunk.slice(-limit)];
    
    return messages;
  }
  
  /**
   * Generate a summary of all chunks except the last one
   * This can be used to provide context for the AI while keeping token usage low
   * @returns {string} - Summary of the conversation
   */
  async generateSummary() {
    if (!this.activeConversationId) {
      throw new Error('No active conversation');
    }
    
    const conversation = this.conversations[this.activeConversationId];
    
    // If there are less than 2 chunks, there's nothing to summarize
    if (conversation.chunks.length < 2) {
      conversation.summary = '';
      this.saveConversations();
      return '';
    }
    
    // Combine all chunks except the last one
    const chunksToSummarize = conversation.chunks.slice(0, -1);
    const allMessages = chunksToSummarize.flat();
    
    // Create a simplified version of the messages to reduce token usage
    const simplifiedMessages = allMessages.map(msg => ({
      role: msg.role,
      content: this.truncateContent(msg.content, 100)
    }));
    
    // In a real implementation, you would call an AI API here to generate a summary
    // For this example, we'll just create a placeholder summary
    const summary = `This conversation contains ${allMessages.length} messages across ${chunksToSummarize.length} chunks. The conversation covers various topics and includes code examples and explanations.`;
    
    // Update the conversation summary
    conversation.summary = summary;
    this.saveConversations();
    
    return summary;
  }
  
  /**
   * Export the active conversation to a file
   * @returns {Blob} - Blob containing the conversation data
   */
  exportConversation() {
    if (!this.activeConversationId) {
      throw new Error('No active conversation');
    }
    
    const conversation = this.conversations[this.activeConversationId];
    const conversationData = JSON.stringify(conversation, null, 2);
    
    return new Blob([conversationData], { type: 'application/json' });
  }
  
  /**
   * Import a conversation from a file
   * @param {File} file - JSON file containing conversation data
   * @returns {Promise<string>} - Conversation ID
   */
  importConversation(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const conversation = JSON.parse(event.target.result);
          
          // Validate the conversation data
          if (!conversation.id || !conversation.title || !Array.isArray(conversation.chunks)) {
            throw new Error('Invalid conversation data');
          }
          
          // Generate a new ID to avoid conflicts
          const newId = 'conv_' + Date.now();
          conversation.id = newId;
          
          // Add the conversation
          this.conversations[newId] = conversation;
          this.activeConversationId = newId;
          this.saveConversations();
          
          resolve(newId);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Split a large message into smaller chunks that fit within token limits
   * @param {string} content - Message content
   * @param {number} maxTokens - Maximum tokens per chunk
   * @returns {Array<string>} - Array of content chunks
   */
  splitMessage(content, maxTokens = 4000) {
    // Estimate tokens in the content
    const estimatedTokens = this.estimateTokens(content);
    
    // If the content is already within the limit, return it as is
    if (estimatedTokens <= maxTokens) {
      return [content];
    }
    
    // Split the content into paragraphs
    const paragraphs = content.split('\n\n');
    
    // Initialize chunks
    const chunks = [];
    let currentChunk = '';
    
    // Process each paragraph
    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed the token limit, start a new chunk
      if (this.estimateTokens(currentChunk + paragraph) > maxTokens) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        
        // If the paragraph itself is too large, split it into sentences
        if (this.estimateTokens(paragraph) > maxTokens) {
          const sentences = paragraph.split(/(?<=[.!?])\s+/);
          
          for (const sentence of sentences) {
            if (this.estimateTokens(currentChunk + sentence) > maxTokens) {
              if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = '';
              }
              
              // If the sentence itself is too large, split it by words
              if (this.estimateTokens(sentence) > maxTokens) {
                const words = sentence.split(' ');
                
                for (const word of words) {
                  if (this.estimateTokens(currentChunk + word + ' ') > maxTokens) {
                    chunks.push(currentChunk);
                    currentChunk = word + ' ';
                  } else {
                    currentChunk += word + ' ';
                  }
                }
              } else {
                currentChunk = sentence;
              }
            } else {
              currentChunk += sentence;
            }
          }
        } else {
          currentChunk = paragraph;
        }
      } else {
        if (currentChunk) {
          currentChunk += '\n\n';
        }
        currentChunk += paragraph;
      }
    }
    
    // Add the last chunk if it's not empty
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
  
  /**
   * Estimate the number of tokens in a string
   * This is a simple approximation - in production, you'd use a proper tokenizer
   * @param {string} text - Text to estimate tokens for
   * @returns {number} - Estimated token count
   */
  estimateTokens(text) {
    // A very rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Truncate content to a maximum length while preserving meaning
   * @param {string} content - Content to truncate
   * @param {number} maxWords - Maximum number of words
   * @returns {string} - Truncated content
   */
  truncateContent(content, maxWords) {
    const words = content.split(/\s+/);
    
    if (words.length <= maxWords) {
      return content;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
  }
  
  /**
   * Save conversations to storage
   */
  saveConversations() {
    switch (this.options.storageType) {
      case 'localStorage':
        localStorage.setItem('chatTokenManager_conversations', JSON.stringify(this.conversations));
        break;
      
      case 'file':
        // In a real implementation, you would save to a file here
        console.log('Saving to file is not implemented in this example');
        break;
      
      case 'supabase':
        if (!this.options.supabaseClient) {
          console.error('Supabase client is not provided');
          return;
        }
        
        // Save to Supabase
        this.saveToSupabase();
        break;
    }
  }
  
  /**
   * Load conversations from storage
   */
  loadConversations() {
    switch (this.options.storageType) {
      case 'localStorage':
        const savedConversations = localStorage.getItem('chatTokenManager_conversations');
        
        if (savedConversations) {
          try {
            this.conversations = JSON.parse(savedConversations);
          } catch (error) {
            console.error('Error parsing saved conversations:', error);
          }
        }
        break;
      
      case 'file':
        // In a real implementation, you would load from a file here
        console.log('Loading from file is not implemented in this example');
        break;
      
      case 'supabase':
        if (!this.options.supabaseClient) {
          console.error('Supabase client is not provided');
          return;
        }
        
        // Load from Supabase
        this.loadFromSupabase();
        break;
    }
  }
  
  /**
   * Save conversations to Supabase
   */
  async saveToSupabase() {
    const supabase = this.options.supabaseClient;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    // Save each conversation
    for (const id in this.conversations) {
      const conversation = this.conversations[id];
      
      // Convert chunks to a string to store in the database
      const conversationData = {
        external_id: conversation.id,
        user_id: user.id,
        title: conversation.title,
        chunks: JSON.stringify(conversation.chunks),
        summary: conversation.summary,
        created_at: conversation.createdAt,
        updated_at: conversation.updatedAt
      };
      
      // Upsert the conversation
      const { error } = await supabase
        .from('ai_conversations')
        .upsert(conversationData, { onConflict: 'external_id' });
      
      if (error) {
        console.error('Error saving conversation to Supabase:', error.message);
      }
    }
  }
  
  /**
   * Load conversations from Supabase
   */
  async loadFromSupabase() {
    const supabase = this.options.supabaseClient;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    // Get all conversations for the user
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error loading conversations from Supabase:', error.message);
      return;
    }
    
    // Convert the data to the format used by this class
    this.conversations = {};
    
    for (const item of data) {
      try {
        const chunks = JSON.parse(item.chunks);
        
        this.conversations[item.external_id] = {
          id: item.external_id,
          title: item.title,
          chunks,
          summary: item.summary,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        };
      } catch (error) {
        console.error('Error parsing chunks for conversation:', item.external_id, error);
      }
    }
  }
}

// Example usage
/*
// Create a new instance
const tokenManager = new ChatTokenManager({
  maxTokensPerChunk: 8000,
  storageType: 'localStorage'
});

// Create a new conversation
const conversationId = tokenManager.createConversation('My AI Conversation');

// Add messages
tokenManager.addMessage({
  role: 'user',
  content: 'Hello, can you help me with a programming problem?'
});

tokenManager.addMessage({
  role: 'assistant',
  content: 'Of course! I\'d be happy to help. What programming problem are you facing?'
});

// Get messages for the AI
const messages = tokenManager.getMessages({ includeSummary: true });

// Generate a summary when the conversation gets long
tokenManager.generateSummary();

// Export the conversation
const blob = tokenManager.exportConversation();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'conversation.json';
a.click();
*/

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChatTokenManager };
} else {
  window.ChatTokenManager = ChatTokenManager;
}
