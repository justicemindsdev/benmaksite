# AI Chat Token Limit Workaround

This project provides a solution for working around token limits in AI chat interfaces like Claude. It includes a JavaScript library and a demo application that demonstrates how to manage large conversations by breaking them into manageable chunks.

## The Problem

AI chat interfaces like Claude have token limits that restrict the size of conversations. When a conversation gets too long, you might encounter issues like:

1. The AI losing context of earlier parts of the conversation
2. Being unable to send new messages due to token limits
3. Having to start a new conversation and lose the context of the previous one

## The Solution

The `ChatTokenManager` class provides several strategies to work around these limitations:

1. **Chunking**: Automatically breaks conversations into smaller chunks that fit within token limits
2. **Summarization**: Generates summaries of previous chunks to provide context without using too many tokens
3. **Storage**: Saves conversations to localStorage, files, or a Supabase database
4. **Export/Import**: Allows exporting and importing conversations as JSON files

## Getting Started

### Using the Library

1. Include the `chat-token-manager.js` file in your project:

```html
<script src="chat-token-manager.js"></script>
```

2. Create a new instance of the `ChatTokenManager`:

```javascript
const tokenManager = new ChatTokenManager({
  maxTokensPerChunk: 8000, // Adjust based on the AI's token limit
  storageType: 'localStorage' // 'localStorage', 'file', or 'supabase'
});
```

3. Create a new conversation:

```javascript
const conversationId = tokenManager.createConversation('My AI Conversation');
```

4. Add messages to the conversation:

```javascript
tokenManager.addMessage({
  role: 'user',
  content: 'Hello, can you help me with a programming problem?'
});

tokenManager.addMessage({
  role: 'assistant',
  content: 'Of course! I\'d be happy to help. What programming problem are you facing?'
});
```

5. Get messages for the AI:

```javascript
const messages = tokenManager.getMessages({ includeSummary: true });
// Use these messages in your API call to the AI
```

6. Generate a summary when the conversation gets long:

```javascript
await tokenManager.generateSummary();
```

### Demo Application

The `token-manager-demo.html` file provides a complete demo application that shows how to use the `ChatTokenManager` class. It includes:

- Creating and managing multiple conversations
- Adding messages and seeing token usage
- Generating summaries of previous chunks
- Exporting and importing conversations

To run the demo:

1. Open `token-manager-demo.html` in a web browser
2. Create a new conversation or use the default one
3. Add messages to see how the token manager works
4. Try exporting and importing conversations

## Advanced Usage

### Supabase Integration

To use Supabase for storage:

1. Set up a Supabase project and create the necessary tables
2. Initialize the token manager with Supabase:

```javascript
const supabase = supabaseClient.createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

const tokenManager = new ChatTokenManager({
  maxTokensPerChunk: 8000,
  storageType: 'supabase',
  supabaseClient: supabase
});
```

### Splitting Large Messages

If you need to send a very large message that exceeds token limits:

```javascript
const content = "Your very long message here...";
const chunks = tokenManager.splitMessage(content, 4000);

// Send each chunk separately
for (const chunk of chunks) {
  tokenManager.addMessage({
    role: 'user',
    content: chunk
  });
}
```

## Implementation Details

### Token Estimation

The library uses a simple approximation to estimate token counts (1 token ≈ 4 characters). In a production environment, you might want to use a more accurate tokenizer specific to the AI model you're using.

### Summarization

The current implementation uses a placeholder for summarization. In a real application, you would call an AI API to generate a summary of previous chunks.

### Storage

The library supports three storage types:

- `localStorage`: Stores conversations in the browser's localStorage
- `file`: Allows exporting and importing conversations as JSON files
- `supabase`: Stores conversations in a Supabase database

## Best Practices

1. **Set appropriate token limits**: Adjust the `maxTokensPerChunk` based on the AI model you're using
2. **Generate summaries regularly**: When a conversation spans multiple chunks, generate a summary to provide context
3. **Export important conversations**: Use the export feature to save important conversations
4. **Split large messages**: If you need to send a very large message, split it into smaller chunks

## Limitations

- The token estimation is approximate and may not match exactly with the AI model's tokenization
- The summarization feature requires integration with an AI API for production use
- The file storage option requires additional implementation for server-side applications

## License

This project is licensed under the MIT License - see the LICENSE file for details.
