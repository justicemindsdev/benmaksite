/**
 * Token Limit Workaround Test
 * This script demonstrates how to use the ChatTokenManager in a Node.js environment
 * to work around token limits in AI chat interfaces.
 */

// Import the ChatTokenManager
const { ChatTokenManager } = require('./chat-token-manager.js');

// Create a new instance of the ChatTokenManager
const tokenManager = new ChatTokenManager({
  maxTokensPerChunk: 4000, // Lower for demonstration purposes
  storageType: 'file' // Use file storage for this example
});

// Sample conversation data - this would normally come from user interactions
const sampleConversation = [
  { role: 'user', content: 'Hello, I need help with a complex programming problem.' },
  { role: 'assistant', content: 'I\'d be happy to help! Could you describe the problem in detail?' },
  { role: 'user', content: 'I\'m trying to implement a system that can handle large conversations with AI assistants without hitting token limits.' },
  { role: 'assistant', content: 'That\'s an interesting challenge. There are several approaches you could take:\n\n1. Chunking the conversation into smaller parts\n2. Summarizing previous parts of the conversation\n3. Using a database to store conversation history\n\nWhich aspect would you like to focus on first?' },
  { role: 'user', content: 'Let\'s start with chunking. How would you recommend implementing that?' }
];

// Large message that would exceed token limits
const largeMessage = `
I've been researching different approaches to chunking conversations, and I've found several methods:

${Array(50).fill('This is a paragraph of text that contains information about chunking conversations. The idea is to break down large conversations into smaller, manageable pieces that can fit within token limits. Each chunk should contain enough context to be useful, but not so much that it exceeds the token limit.').join('\n\n')}

What do you think of these approaches? Which one would you recommend for my use case?
`;

// Function to run the test
async function runTest() {
  console.log('=== Token Limit Workaround Test ===\n');
  
  // Create a new conversation
  const conversationId = tokenManager.createConversation('Test Conversation');
  console.log(`Created conversation with ID: ${conversationId}`);
  
  // Add the sample conversation messages
  console.log('\nAdding sample conversation messages...');
  for (const message of sampleConversation) {
    tokenManager.addMessage(message);
    console.log(`Added message from ${message.role}: ${message.content.substring(0, 50)}...`);
  }
  
  // Get the current messages
  const currentMessages = tokenManager.getMessages();
  console.log(`\nCurrent conversation has ${currentMessages.length} messages in the active chunk`);
  
  // Split the large message into chunks
  console.log('\nSplitting large message into chunks...');
  const messageChunks = tokenManager.splitMessage(largeMessage);
  console.log(`Large message split into ${messageChunks.length} chunks`);
  
  // Add each chunk as a separate message
  console.log('\nAdding large message chunks to the conversation...');
  for (let i = 0; i < messageChunks.length; i++) {
    tokenManager.addMessage({
      role: 'user',
      content: `Part ${i + 1}/${messageChunks.length}: ${messageChunks[i]}`
    });
    console.log(`Added chunk ${i + 1}/${messageChunks.length}`);
    
    // Add a mock assistant response to each chunk
    tokenManager.addMessage({
      role: 'assistant',
      content: `I've received part ${i + 1} of your message. Please continue.`
    });
  }
  
  // Check if we have multiple chunks now
  const conversation = tokenManager.conversations[conversationId];
  console.log(`\nConversation now has ${conversation.chunks.length} chunks`);
  
  // Generate a summary if we have multiple chunks
  if (conversation.chunks.length > 1) {
    console.log('\nGenerating summary of previous chunks...');
    const summary = await tokenManager.generateSummary();
    console.log('Summary generated:', summary);
  }
  
  // Get the messages for the AI, including the summary
  const messagesForAI = tokenManager.getMessages({ includeSummary: true });
  console.log(`\nMessages for AI: ${messagesForAI.length} messages`);
  
  // Export the conversation
  console.log('\nExporting conversation...');
  const blob = tokenManager.exportConversation();
  console.log('Conversation exported successfully');
  
  console.log('\n=== Test Complete ===');
}

// Run the test
runTest().catch(console.error);
